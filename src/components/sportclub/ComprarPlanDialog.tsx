import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PLANES_SPORTCLUB, ALQUILER_OPCIONES } from "@/data/sportclub";

const schema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(6, "WhatsApp inválido").max(40),
  plan: z.string().trim().min(1, "Elegí tu plan SportClub"),
  alquiler: z.string().trim().min(1, "Indicá si necesitás alquiler"),
  website: z.string().max(0).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nombre del plan pago que se está por comprar, ej. "Plan Full Socio SportClub". */
  planNombre: string;
  /** Ese pack ya incluye el equipo — se pide confirmar con un checkbox en vez de
   *  preguntar si necesita alquiler (no tiene sentido preguntarlo, ya está incluido). */
  esPackAlquiler?: boolean;
}

const ComprarPlanDialog = ({ open, onOpenChange, planNombre, esPackAlquiler = false }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [alquiler, setAlquiler] = useState("");
  const [yaTieneRollers, setYaTieneRollers] = useState(false);
  const [confirmaPack, setConfirmaPack] = useState(false);
  const [website, setWebsite] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPlan("");
    setAlquiler("");
    setYaTieneRollers(false);
    setConfirmaPack(false);
    setWebsite("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esPackAlquiler && !confirmaPack) {
      toast({
        title: "Confirmá el pack",
        description: `Marcá la casilla para confirmar que querés comprar ${planNombre}.`,
        variant: "destructive",
      });
      return;
    }
    const alquilerFinal = esPackAlquiler
      ? `Sí (incluido en el pack ${planNombre})`
      : alquiler;
    const parsed = schema.safeParse({ name, email, phone, plan, alquiler: alquilerFinal, website });
    if (!parsed.success) {
      toast({
        title: "Revisá los datos",
        description: parsed.error.issues[0]?.message ?? "Hay un campo inválido.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-sportclub", {
        body: {
          ...parsed.data,
          planPago: planNombre,
          soloProtecciones: !esPackAlquiler && alquiler === "si" && yaTieneRollers,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Algo salió mal");
      toast({
        title: "¡Listo!",
        description: "Te contactamos por WhatsApp para coordinar el pago de tu plan.",
      });
      // Misma página de confirmación que usa el form principal (de momento sin
      // cambios ahí — eso es el próximo paso). alquilerCodigo va en el formato
      // que esa página espera ("si"/"no"/"considerando"), no el texto descriptivo
      // que le mandamos a Slack: si viene del pack, la respuesta es "si" siempre
      // (comprar el pack ES la respuesta a "necesitás alquiler").
      const alquilerCodigo = esPackAlquiler ? "si" : alquiler;
      // Solo relevante cuando alquilerCodigo="si" en Plan Full (el pack ya
      // incluye todo, no hace falta preguntar). Si ya tiene rollers y solo
      // necesita protecciones, no tiene sentido ofrecerle después el pack de
      // 4 Clases + Alquiler en la confirmación — está pensado para quien no
      // tiene nada.
      const soloProtecciones = !esPackAlquiler && alquiler === "si" && yaTieneRollers;
      const payload = {
        name, email, phone, plan,
        alquiler: alquilerCodigo,
        soloProtecciones,
        planPago: planNombre,
      };
      try {
        sessionStorage.setItem("sportclub_form", JSON.stringify(payload));
      } catch {}
      resetForm();
      onOpenChange(false);
      navigate("/exclusivo-de-socios-sportclub-confirmado", { state: payload });
    } catch (err: any) {
      toast({
        title: "No pudimos enviar tu solicitud",
        description: err?.message ?? "Probá de nuevo en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <DialogContent className="max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display italic uppercase text-2xl font-black tracking-tight text-foreground">
            {planNombre}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completá tus datos y te contactamos por WhatsApp para coordinar el pago.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Honeypot oculto */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div className="space-y-1.5">
            <Label htmlFor="cp-nombre">Nombre</Label>
            <Input
              id="cp-nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cp-email">Email</Label>
              <Input
                id="cp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                maxLength={255}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-phone">WhatsApp</Label>
              <Input
                id="cp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Con código de área"
                maxLength={40}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Plan de SportClub que ya tenés activo</Label>
            <Select value={plan} onValueChange={setPlan} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí tu plan" />
              </SelectTrigger>
              <SelectContent>
                {PLANES_SPORTCLUB.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {esPackAlquiler ? (
            <div className="flex items-start gap-2.5 border border-border p-3">
              <Checkbox
                id="cp-confirma"
                checked={confirmaPack}
                onCheckedChange={(v) => setConfirmaPack(v === true)}
                disabled={loading}
                className="mt-0.5"
              />
              <Label htmlFor="cp-confirma" className="text-sm font-normal leading-snug cursor-pointer">
                Confirmo que quiero comprar <strong>{planNombre}</strong> (el equipo ya está incluido)
              </Label>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>¿Vas a necesitar alquiler de equipo?</Label>
              <Select value={alquiler} onValueChange={setAlquiler} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí una opción" />
                </SelectTrigger>
                <SelectContent>
                  {ALQUILER_OPCIONES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Solo si necesita alquiler: distinguir "ya tengo rollers, me
                  falta protección" de "no tengo nada" — quien ya tiene sus
                  rollers no necesita el pack de 4 Clases + Alquiler (pensado
                  para arrancar de cero), solo coordinar el alquiler de
                  protecciones. */}
              {alquiler === "si" && (
                <div className="flex items-start gap-2.5 border border-border p-3 mt-2">
                  <Checkbox
                    id="cp-ya-rollers"
                    checked={yaTieneRollers}
                    onCheckedChange={(v) => setYaTieneRollers(v === true)}
                    disabled={loading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="cp-ya-rollers" className="text-sm font-normal leading-snug cursor-pointer">
                    Ya tengo mis rollers — solo necesito alquilar protecciones
                  </Label>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-xs rounded-full py-6 hover:shadow-[0_0_24px_rgba(208,28,31,0.5)] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Quiero comprar este plan
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComprarPlanDialog;
