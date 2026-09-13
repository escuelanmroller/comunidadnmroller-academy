import { useState } from "react";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const schema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(80),
  email: z.string().trim().email("Email inválido").max(150),
  zona: z.string().trim().min(2, "¿Qué zona o barrio sugerís?").max(120),
  dia: z.string().min(1),
  franja: z.string().min(1),
  comentario: z.string().trim().max(500).optional().or(z.literal("")),
  // honeypot
  website: z.string().max(0).optional(),
});

const DIAS = ["Cualquiera", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const FRANJAS = ["Cualquiera", "Mañana (7–12)", "Mediodía (12–15)", "Tarde (15–19)", "Noche (19–23)"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SugerenciaDialog = ({ open, onOpenChange }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    zona: "",
    dia: "Cualquiera",
    franja: "Cualquiera",
    comentario: "",
    website: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
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
      const { error } = await supabase.functions.invoke("submit-sugerencia", {
        body: parsed.data,
      });
      if (error) throw error;
      toast({
        title: "¡Gracias por tu sugerencia! 🛼",
        description: "La leemos y tenemos en cuenta para ampliar la grilla.",
      });
      setForm({
        nombre: "",
        email: "",
        zona: "",
        dia: "Cualquiera",
        franja: "Cualquiera",
        comentario: "",
        website: "",
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "No pudimos enviar tu sugerencia",
        description: "Probá de nuevo en un momento o escribinos por WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tight text-foreground">
            Sugerí horario o sede
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Contanos qué zona y franja horaria te vendría bien. Leemos todas las sugerencias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Honeypot oculto */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set("website")(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sg-nombre">Nombre</Label>
              <Input
                id="sg-nombre"
                value={form.nombre}
                onChange={(e) => set("nombre")(e.target.value)}
                placeholder="Tu nombre"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sg-email">Email</Label>
              <Input
                id="sg-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="tu@email.com"
                maxLength={150}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sg-zona">Zona o barrio sugerido</Label>
            <Input
              id="sg-zona"
              value={form.zona}
              onChange={(e) => set("zona")(e.target.value)}
              placeholder="Ej: Caballito Norte, Núñez, Lomas de Zamora…"
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Día preferido</Label>
              <Select value={form.dia} onValueChange={set("dia")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Horario preferido</Label>
              <Select value={form.franja} onValueChange={set("franja")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRANJAS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sg-comentario">Comentario (opcional)</Label>
            <Textarea
              id="sg-comentario"
              value={form.comentario}
              onChange={(e) => set("comentario")(e.target.value)}
              placeholder="Contanos más si querés…"
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.comentario.length}/500
            </p>
          </div>

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
                <Send className="w-4 h-4 mr-2" /> Enviar sugerencia
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SugerenciaDialog;
