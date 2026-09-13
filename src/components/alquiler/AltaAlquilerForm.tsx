import { useMemo, useState } from "react";
import { AlertCircle, ShieldCheck, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sedes, claseTieneAlquiler, ordenDias, NIVEL_UNIFICADO, type ClaseSede } from "@/data/sedes";

// Únicas sedes/turnos que se ofrecen acá: los que hoy tienen alquiler real en
// sedes.ts (misma fuente que usa la Landing de Alquiler) — nunca una lista
// hardcodeada aparte, para no repetir el desalineamiento que tenía el
// prototipo de Tiiny (ver alta-alquileres-clases-nm/CONTEXTO.md).
const SEDES_ALQUILER = sedes.filter((s) => s.alquiler);

const turnosDeSede = (sedeId: string): ClaseSede[] => {
  const sede = SEDES_ALQUILER.find((s) => s.id === sedeId);
  if (!sede) return [];
  const vistos = new Set<string>();
  return sede.clases
    .filter((c) => claseTieneAlquiler(sede, c))
    .filter((c) => {
      const key = `${c.dia}-${c.hora}-${c.disciplina}`;
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia) || a.hora.localeCompare(b.hora),
    );
};

const turnoValue = (c: ClaseSede) => `${c.dia}|${c.hora}|${c.disciplina}`;
const turnoLabel = (c: ClaseSede) =>
  `${c.dia} ${c.hora}hs${c.disciplina !== NIVEL_UNIFICADO ? ` · ${c.disciplina}` : ""}`;

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Dado un turno fijo (día+hora), calcula las próximas N fechas reales en las
// que cae — con al menos `anticipacionHoras` de margen. 4 clases semanales
// caen solas dentro de un mes (22 días entre la 1ª y la 4ª), no hace falta
// forzar nada extra.
const proximasFechas = (dia: string, hora: string, cantidad: number, anticipacionHoras = 24): Date[] => {
  const targetDow = DIAS_SEMANA.indexOf(dia);
  const [hh, mm] = hora.split(":").map(Number);
  const minFecha = new Date(Date.now() + anticipacionHoras * 3600 * 1000);
  const fechas: Date[] = [];
  let cursor = new Date();
  cursor.setHours(hh, mm || 0, 0, 0);
  while (fechas.length < cantidad) {
    if (cursor.getDay() === targetDow && cursor.getTime() >= minFecha.getTime()) {
      fechas.push(new Date(cursor));
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + 7);
      continue;
    }
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
};

const formatFecha = (d: Date) => {
  const s = d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const TALLES_ROPA = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const TALLES_CASCO = ["S", "M", "L"] as const;

const WHATSAPP_NUMERO = "5491165920600";

interface Props {
  nombre: string;
  email: string;
  telefono: string;
  dni: string;
  /** "clase-unica" | "clase-2x1" | "pack-4-clases" */
  planSlug: string;
  planLabel: string;
}

const AltaAlquilerForm = ({ nombre, email, telefono, dni, planSlug, planLabel }: Props) => {
  const esPack4 = planSlug === "pack-4-clases";
  const es2x1 = planSlug === "clase-2x1";

  const [sedeId, setSedeId] = useState("");
  const [turno, setTurno] = useState("");
  const [sinRollers, setSinRollers] = useState(false);
  const [talleCalzado, setTalleCalzado] = useState("");
  const [talleRopa, setTalleRopa] = useState("");
  const [talleCasco, setTalleCasco] = useState("");
  const [compNombre, setCompNombre] = useState("");
  const [compApellido, setCompApellido] = useState("");
  const [compDni, setCompDni] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const turnosDisponibles = useMemo(() => turnosDeSede(sedeId), [sedeId]);
  const turnoElegido = useMemo(() => {
    if (!turno) return null;
    const [dia, hora, disciplina] = turno.split("|");
    return { dia, hora, disciplina };
  }, [turno]);

  const fechas = useMemo(() => {
    if (!esPack4 || !turnoElegido) return [];
    return proximasFechas(turnoElegido.dia, turnoElegido.hora, 4);
  }, [esPack4, turnoElegido]);

  const canSubmit =
    !!sedeId &&
    !!turno &&
    (sinRollers || talleCalzado.trim().length > 0) &&
    !!talleRopa &&
    !!talleCasco &&
    (!es2x1 || (compNombre.trim() && compApellido.trim() && compDni.trim() && /^\S+@\S+\.\S+$/.test(compEmail)));

  const handleSedeChange = (value: string) => {
    setSedeId(value);
    setTurno("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !turnoElegido) {
      toast({
        title: "Completá todos los campos obligatorios",
        description: "Faltan datos para poder prepararte el equipo.",
        variant: "destructive",
      });
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.functions.invoke("notify-alta-alquiler", {
        body: {
          nombre,
          email,
          telefono,
          dni,
          planLabel,
          planSlug,
          sedeNombre: SEDES_ALQUILER.find((s) => s.id === sedeId)?.nombre ?? sedeId,
          turnoDia: turnoElegido.dia,
          turnoHora: turnoElegido.hora,
          fechas: fechas.map((f) => formatFecha(f)),
          talleCalzado: sinRollers ? "no aplica (trae sus rollers)" : talleCalzado,
          talleRopa,
          talleCasco,
          acompanante: es2x1 ? { nombre: compNombre, apellido: compApellido, dni: compDni, email: compEmail } : null,
          notas: notas.trim() || null,
        },
      });
      if (error) throw error;
      setEnviado(true);
    } catch (err: any) {
      toast({
        title: "No pudimos guardar tus datos",
        description: err?.message ?? "Probá de nuevo en unos segundos, o escribinos por WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Backup manual: si algo falla del lado del servidor, este mismo resumen
  // se puede mandar a mano por WhatsApp — mismo canal que ya se usa para
  // las excepciones de reprogramación.
  const mensajeWhatsapp = useMemo(() => {
    const lineas = [
      `[ALTA-ALQUILER] Hola! Soy ${nombre || "[nombre]"} (DNI ${dni || "[dni]"}).`,
      `Compré: ${planLabel}.`,
      sedeId && turnoElegido
        ? `Sede: ${SEDES_ALQUILER.find((s) => s.id === sedeId)?.nombre}. Turno fijo: ${turnoElegido.dia} ${turnoElegido.hora}hs.`
        : "",
      fechas.length
        ? `Mis 4 fechas: ${fechas.map((f) => formatFecha(f)).join(" · ")}.`
        : "",
      `Talle calzado: ${sinRollers ? "no necesito (llevo mis rollers)" : talleCalzado}. Talla ropa: ${talleRopa}. Talle casco: ${talleCasco}.`,
      es2x1 ? `Acompañante 2x1: ${compNombre} ${compApellido}, DNI ${compDni}, email ${compEmail}.` : "",
      notas.trim() ? `Notas: ${notas.trim()}.` : "",
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(lineas.join(" "))}`;
  }, [nombre, dni, planLabel, sedeId, turnoElegido, fechas, sinRollers, talleCalzado, talleRopa, talleCasco, es2x1, compNombre, compApellido, compDni, compEmail, notas]);

  if (enviado) {
    return (
      <div className="border-2 border-primary bg-background p-6 md:p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" strokeWidth={2} />
        <h3 className="font-display italic uppercase font-black text-lg md:text-xl text-primary mb-3">
          ¡Ya tenemos tus datos!
        </h3>
        <p className="text-sm text-foreground/75 leading-relaxed max-w-md mx-auto mb-6">
          Tu equipo va a estar preparado en <strong className="text-foreground">{SEDES_ALQUILER.find((s) => s.id === sedeId)?.nombre}</strong> para tu turno de {turnoElegido?.dia} {turnoElegido?.hora}hs.
        </p>
        <a
          href={mensajeWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-12 py-3 px-6 border-2 border-[#25D366] text-[#25D366] font-bold uppercase tracking-[0.18em] text-xs whitespace-normal leading-tight text-center hover:bg-[#25D366] hover:text-white transition-colors"
        >
          ¿Tenés dudas? Escribinos por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-foreground/10 bg-background p-6 md:p-8 space-y-6 text-left">
      <div>
        <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.18em]">
          <Clock className="w-4 h-4" /> Antes de tu primera clase
        </div>
        <h3 className="font-display italic uppercase text-xl md:text-2xl font-black text-primary leading-[0.95] mb-2">
          Preparemos tu equipo y tu turno
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Completá esto con al menos <strong className="text-foreground">24 horas de anticipación</strong> a tu primera clase — si no, no llegamos a prepararte el equipo.
        </p>
      </div>

      {/* Sede y turno fijo */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 bg-[#F5B800] text-[#111] text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1">
          ⚑ Turno fijo — no rotativo
        </span>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Sede *</Label>
            <Select value={sedeId} onValueChange={handleSedeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí tu sede" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                {SEDES_ALQUILER.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Día y horario *</Label>
            <Select value={turno} onValueChange={setTurno} disabled={!sedeId}>
              <SelectTrigger>
                <SelectValue placeholder={sedeId ? "Elegí día y horario" : "Elegí primero una sede"} />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                {turnosDisponibles.map((c) => (
                  <SelectItem key={turnoValue(c)} value={turnoValue(c)}>{turnoLabel(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {esPack4 && fechas.length > 0 && (
          <div className="border border-foreground/15 bg-muted p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-foreground/60 mb-1.5">Tus 4 fechas</p>
            <p className="text-sm font-bold text-foreground">
              {fechas.map((f) => formatFecha(f)).join(" · ")}
            </p>
          </div>
        )}

        <div className="border border-foreground/15 bg-muted p-3.5 text-xs text-foreground/70 leading-relaxed">
          <strong className="text-foreground">Este va a ser siempre tu turno</strong>: misma sede, mismo día, mismo horario en todas tus clases del pack — no es una sede en general.
        </div>
        <div className="border border-[#25D366]/35 bg-[#25D366]/10 p-3.5 text-xs text-foreground/70 leading-relaxed">
          Solo se puede reprogramar (hasta 2 veces, sin costo, misma sede) si falla algo ajeno a nosotros — lluvia o ausencia del profe. Eso se gestiona por WhatsApp, no desde acá.
        </div>
        <div className="text-xs text-foreground/55 leading-relaxed pt-1 border-t border-foreground/10">
          Si no vas a poder ir a una clase, avisanos por WhatsApp con al menos <strong className="text-foreground/70">48 horas de anticipación</strong>. Sin ese aviso, la clase queda tomada.
        </div>
      </div>

      {/* Equipo */}
      <div className="space-y-3">
        <Label className="uppercase tracking-[0.12em] text-xs font-bold block">Tu equipo</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="alq-calzado">Talle de calzado (para los rollers) *</Label>
            <Input
              id="alq-calzado"
              type="number"
              inputMode="numeric"
              min={28}
              max={48}
              placeholder="Ej: 39"
              value={talleCalzado}
              disabled={sinRollers}
              onChange={(e) => setTalleCalzado(e.target.value)}
            />
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="alq-sin-rollers"
                checked={sinRollers}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setSinRollers(checked);
                  if (checked) setTalleCalzado("");
                }}
                className="mt-0.5"
              />
              <Label htmlFor="alq-sin-rollers" className="text-xs font-normal leading-snug cursor-pointer text-foreground/70">
                Ya tengo mis propios rollers — no necesito que me presten
              </Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Talla de ropa (protecciones) *</Label>
            <Select value={talleRopa} onValueChange={setTalleRopa}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná tu talla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">XS</SelectItem>
                <SelectItem value="S">S · hasta 60kg aprox.</SelectItem>
                <SelectItem value="M">M · 60–75kg</SelectItem>
                <SelectItem value="L">L · 75–90kg</SelectItem>
                <SelectItem value="XL">XL · 90kg+</SelectItem>
                <SelectItem value="XXL">XXL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Talle de casco *</Label>
          <Select value={talleCasco} onValueChange={setTalleCasco}>
            <SelectTrigger className="sm:w-1/2">
              <SelectValue placeholder="Seleccioná tu talle" />
            </SelectTrigger>
            <SelectContent>
              {TALLES_CASCO.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-foreground/50">Medidas en cm de cada talle — se suman más adelante.</p>
        </div>

        <div className="flex items-start gap-2 pt-3 border-t border-foreground/10 text-xs text-foreground/70 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#F5B800] mt-0.5 shrink-0" />
          Los rollers, el casco y las protecciones se retiran y se devuelven <strong className="text-foreground">en tu sede, sin costo extra</strong> — ya está incluido en lo que pagaste.
        </div>
      </div>

      {/* Acompañante 2x1 */}
      {es2x1 && (
        <div className="border-2 border-[#F5B800]/40 bg-gradient-to-b from-[#F5B800]/5 to-transparent p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Label className="uppercase tracking-[0.12em] text-xs font-bold">Tu acompañante</Label>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#F5B800] border border-[#F5B800]/50 px-2 py-0.5">
              Solo para 2x1
            </span>
          </div>
          <p className="text-xs text-foreground/60">
            Para acreditarle el beneficio, cargá los datos con los que se registró en Turnos Web.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="alq-comp-nombre">Nombre *</Label>
              <Input id="alq-comp-nombre" value={compNombre} onChange={(e) => setCompNombre(e.target.value)} placeholder="Nombre" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alq-comp-apellido">Apellido *</Label>
              <Input id="alq-comp-apellido" value={compApellido} onChange={(e) => setCompApellido(e.target.value)} placeholder="Apellido" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="alq-comp-dni">DNI *</Label>
              <Input id="alq-comp-dni" inputMode="numeric" value={compDni} onChange={(e) => setCompDni(e.target.value)} placeholder="Sin puntos ni espacios" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alq-comp-email">Email (Turnos Web) *</Label>
              <Input id="alq-comp-email" type="email" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="ejemplo@mail.com" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="alq-notas">¿Algo más que debamos saber?</Label>
        <Textarea
          id="alq-notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Opcional — experiencia previa, principiante, alguna lesión..."
        />
      </div>

      <Button
        type="submit"
        disabled={!canSubmit || enviando}
        className="w-full min-h-14 py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] disabled:opacity-50 whitespace-normal leading-tight"
      >
        <Send className="w-4 h-4 mr-2 shrink-0" /> {enviando ? "Enviando..." : "Confirmar mis datos"}
      </Button>
      {!canSubmit && (
        <p className="text-xs text-center text-foreground/45 flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Completá los campos marcados con * para continuar.
        </p>
      )}
    </form>
  );
};

export default AltaAlquilerForm;
