import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ArrowLeft, ChevronRight, Clock, Info, Loader2, MapPin, Sparkles, Wallet, X } from "lucide-react";
import FlyFreePanel from "@/components/FlyFreePanel";
import EquipoPropioNota from "@/components/EquipoPropioNota";
import UpgradeNivelCallout from "@/components/UpgradeNivelCallout";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { sedes, NIVEL_UNIFICADO, NIVEL_INICIAL, NIVEL_PRINCIP_INTER, expandirNivel } from "@/data/sedes";
import SedesMapa from "@/components/SedesMapa";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SEDES_GRATIS_IDS = ["villa-luro", "colegiales", "plaza-la-pampa", "belgrano", "facultad-medicina"];

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const HORARIOS_CLASES: Record<string, { sede: string; hora: string; disciplina: string }[]> = {
  Lunes: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "P. Rivadavia", hora: "20:00", disciplina: NIVEL_UNIFICADO },
  ],
  Martes: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Devoto", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Miércoles: [
    { sede: "Villa Real", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Villa Real", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Belgrano", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Jueves: [
    { sede: "P. Rivadavia", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Villa Luro", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Viernes: [
    { sede: "Devoto", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Belgrano", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Colegiales", hora: "19:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Facultad de Medicina", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Sábado: [
    { sede: "Villa Real", hora: "10:30", disciplina: NIVEL_UNIFICADO },
    { sede: "Plaza La Pampa", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Puerto Madero", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Vicente López", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "18:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "19:00", disciplina: NIVEL_UNIFICADO },
  ],
  Domingo: [
    { sede: "P. Rivadavia", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "P. Rivadavia", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Plaza La Pampa", hora: "09:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Facultad de Medicina", hora: "10:00", disciplina: NIVEL_UNIFICADO },
    { sede: "Rosedal Palermo", hora: "10:00", disciplina: NIVEL_UNIFICADO },
  ],
};

// Orden ascendente por hora dentro de cada día
Object.values(HORARIOS_CLASES).forEach((list) => list.sort((a, b) => a.hora.localeCompare(b.hora)));

const BADGE_STYLES: Record<string, string> = {
  [NIVEL_INICIAL]: "rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/70 font-extrabold",
  [NIVEL_PRINCIP_INTER]: "rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/70 font-extrabold",
};

const BADGE_DESC: Record<string, string> = {
  [NIVEL_INICIAL]: "Desde cero: tu primera vez sobre rollers, sin experiencia previa.",
  [NIVEL_PRINCIP_INTER]: "Principiante e Intermedio: ya tenés base y querés seguir mejorando.",
};

const PERFIL_AVANZADO = "desafio";

const IDENTIDADES = [
  { value: "arrancando", emoji: "🟢", label: "Nunca patiné o no sé por dónde empezar", nivel: NIVEL_INICIAL },
  { value: "con-base",   emoji: "🟡", label: "Ya sé lo básico, quiero mejorar",         nivel: NIVEL_PRINCIP_INTER },
  { value: PERFIL_AVANZADO, emoji: "🔴", label: "Quiero superarme y avanzar rápido",   nivel: NIVEL_PRINCIP_INTER },
];

const EQUIPO_OPCIONES = [
  { value: "alquiler", label: "Sí, voy a necesitar alquilar equipo" },
  { value: "propio", label: "No, tengo mi propio equipo" },
  { value: "considerando", label: "Estoy pensando en comprar mi propio equipo" },
];

// Pregunta de "perfil/identidad" (mismo estilo que los filtros de la Home).
// Cubre desde cero hasta intermedio.
const PERFILES = [
  { value: "Nunca patiné o no sé por dónde empezar", emoji: "🟢" },
  { value: "Ya sé lo básico, quiero mejorar", emoji: "🟡" },
  { value: "Quiero superarme y avanzar rápido", emoji: "🔴" },
];

const FormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(6, "WhatsApp inválido").max(40),
  sede: z.string().trim().min(1, "Elegí una sede"),
  nivel: z.string().trim().min(1, "Elegí tu perfil"),
  equipo: z.string().trim().min(1, "Indicá tu situación de equipo"),
});

const ClaseGratis = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sede, setSede] = useState("");
  const [nivel, setNivel] = useState("");
  const [equipo, setEquipo] = useState("");
  const [filtroDia, setFiltroDia] = useState("__todos__");
  const [filtroIdentidad, setFiltroIdentidad] = useState("__todos__");

  const hayFiltros = filtroDia !== "__todos__" || filtroIdentidad !== "__todos__";
  const limpiarFiltros = () => { setFiltroDia("__todos__"); setFiltroIdentidad("__todos__"); };

  const clasesFiltradas = (dia: string) => {
    if (filtroIdentidad === "__todos__") return HORARIOS_CLASES[dia];
    const id = IDENTIDADES.find((x) => x.value === filtroIdentidad);
    return id ? HORARIOS_CLASES[dia].filter((c) =>
      expandirNivel(c.disciplina).includes(id.nivel)
    ) : HORARIOS_CLASES[dia];
  };

  const diasVisibles = useMemo(() => {
    const base = filtroDia === "__todos__" ? DIAS_SEMANA : DIAS_SEMANA.filter((d) => d === filtroDia);
    return base.filter((d) => clasesFiltradas(d).length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroDia, filtroIdentidad]);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const sedesGratis = sedes.filter((s) => SEDES_GRATIS_IDS.includes(s.id));
  const sedesSena = sedes.filter((s) => !SEDES_GRATIS_IDS.includes(s.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse({ name, email, phone, sede, nivel, equipo });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      // El backend (subscribe-clase-gratis) recibe solo los campos que ya esperaba.
      const { data, error } = await supabase.functions.invoke("subscribe-clase-gratis", {
        body: { name, email, phone, sede, nivel, equipo, website },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("¡Listo! Te contactamos por WhatsApp.");
        const payload = { name, email, phone, sede, nivel };
        // Backup en sessionStorage: el mensaje sigue personalizado aunque recarguen.
        try {
          sessionStorage.setItem("clasegratis_form", JSON.stringify(payload));
        } catch {}
        navigate("/clase-gratis-confirmada", { state: payload });
      } else {
        throw new Error(data?.error ?? "Algo salió mal");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No pudimos registrarte. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Probá gratis una clase de patinaje · NM Roller</title>
        <meta
          name="description"
          content="Reservá tu clase de prueba de patinaje en 5 sedes 100% gratis o asegurá tu lugar con una seña bonificable en sedes con alta demanda."
        />
        <link rel="canonical" href="https://comunidadnmroller.com/clase-gratis" />
        <meta property="og:title" content="Clase de prueba gratis · NM Roller" />
        <meta property="og:description" content="Probá una clase de patinaje antes de comprometerte con un plan." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="pt-10 pb-6 flex justify-center">
          <Link to="/" aria-label="Inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        {/* Hero + form */}
        <section className="px-6 lg:px-16 py-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-foreground/70 mb-6">
                Antes de comprometerte con un plan
              </p>
              <h1 className="font-display italic uppercase leading-[0.95] text-3xl md:text-5xl lg:text-6xl font-black mb-5">
                Probá gratis<br />
                una <span className="text-primary">clase de patinaje</span>
              </h1>
              <div className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <span className="text-sm font-bold text-white tracking-wide">Quedan 5 cupos disponibles esta semana</span>
              </div>
              {/* Mobile: CTA rápido para saltar al form sin scrollear */}
              <a
                href="#form"
                className="lg:hidden flex items-center justify-center gap-2 bg-primary/10 border border-primary/40 text-primary font-bold uppercase tracking-[0.12em] text-xs px-4 py-2.5 mb-5 hover:bg-primary/20 transition-colors"
              >
                Solicitar mi clase <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl">
                Reservá tu clase de prueba en <strong>5 sedes 100% gratis</strong> o
                asegurá tu lugar con una <strong>seña bonificable</strong> en sedes con
                alta demanda.{" "}
                <span className="hidden sm:inline">
                  La seña equivale al valor de una clase única:{" "}
                  <strong className="text-primary">$35.000 transferencia · $32.000 efectivo</strong>,
                  y se descuenta si comprás un plan dentro de los 7 días siguientes.
                </span>
              </p>

              {/* Pasos */}
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {[
                  { n: "01", t: "Registrate", d: "Completá el formulario con tus datos." },
                  { n: "02", t: "Elegí sede y horario", d: "Gratis o con seña bonificable." },
                  { n: "03", t: "Validamos tu alta", d: "Confirmamos tu registro y, si necesitás alquiler, lo coordinamos para tu clase." },
                ].map((s) => (
                  <div key={s.n} className="border border-border/60 bg-card p-4">
                    <div className="text-primary font-display italic text-xl font-black mb-1">{s.n}</div>
                    <div className="font-bold uppercase text-sm tracking-wide">{s.t}</div>
                    <div className="text-foreground/60 text-xs mt-1">{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form card */}
            <div id="form" className="bg-card border border-border p-6 md:p-8 lg:sticky lg:top-10">
              <h2 className="font-display italic uppercase text-2xl md:text-3xl font-black mb-2">
                Solicitar clase
              </h2>
              <p className="text-foreground/60 text-sm mb-6">
                Completá tus datos y te confirmamos por WhatsApp.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <Input
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  maxLength={100}
                  required
                  className="h-12 rounded-none bg-background border-border text-base"
                />
                <Input
                  type="email"
                  placeholder="Tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  maxLength={255}
                  required
                  className="h-12 rounded-none bg-background border-border text-base"
                />
                <Input
                  type="tel"
                  placeholder="WhatsApp (con código de área)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  maxLength={40}
                  required
                  className="h-12 rounded-none bg-background border-border text-base"
                />
                <Select value={sede} onValueChange={setSede} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="Sede en la que querés probar" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-primary font-bold">
                      Sedes 100% gratis
                    </div>
                    {sedesGratis.map((s) => (
                      <SelectItem key={s.id} value={s.nombre}>
                        {s.nombre} — Gratis
                      </SelectItem>
                    ))}
                    <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/60 font-bold">
                      Con seña bonificable
                    </div>
                    {sedesSena.map((s) => (
                      <SelectItem key={s.id} value={s.nombre}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={nivel} onValueChange={setNivel} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="Elegí el perfil con el que más te identificás" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERFILES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.emoji} {p.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={equipo} onValueChange={setEquipo} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="¿Vas a necesitar alquilar equipo?" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPO_OPCIONES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {equipo === "propio" && <EquipoPropioNota />}
                {equipo === "considerando" && <FlyFreePanel />}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Solicitar clase"}
                </Button>
                <p className="text-[11px] text-foreground/50 leading-relaxed">
                  Al enviar aceptás recibir comunicaciones por WhatsApp y email sobre
                  tu clase de prueba.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Todas las sedes + mapa (gratis vs seña) */}
        <section id="gratis-sedes" className="px-6 lg:px-16 py-16 bg-card/40 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.18em] text-primary font-bold">
                Dónde probar
              </span>
            </div>
            <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black mb-3">
              Todas las sedes
            </h2>
            <p className="text-foreground/70 max-w-2xl mb-10">
              Tu clase de prueba es <strong className="text-foreground">100% gratis</strong> en 5
              sedes. En el resto reservás con una{" "}
              <strong className="text-foreground">seña bonificable</strong>. Explorá el mapa y
              mirá los horarios de cada sede.
            </p>
          </div>

          {/* Mapa estilo Home, marcando gratis vs seña */}
          <SedesMapa sedesList={sedes} gratisIds={SEDES_GRATIS_IDS} sidebarTitle="Elegí tu sede" />

          {/* Grilla de horarios por día */}
          <div className="max-w-7xl mx-auto mt-12">
            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Select value={filtroDia} onValueChange={setFiltroDia}>
                <SelectTrigger className="w-48 rounded-none bg-background border-border">
                  <SelectValue placeholder="Todos los días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__todos__">Todos los días</SelectItem>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroIdentidad} onValueChange={setFiltroIdentidad}>
                <SelectTrigger className="w-64 rounded-none bg-background border-border">
                  <SelectValue placeholder="¿Cómo te definís?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__todos__">Cualquier nivel</SelectItem>
                  {IDENTIDADES.map((id) => (
                    <SelectItem key={id.value} value={id.value}>
                      {id.emoji} {id.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                >
                  <X className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>

            {filtroIdentidad === PERFIL_AVANZADO ? (
              <UpgradeNivelCallout variant="clase-gratis" />
            ) : (
            <>
            {/* Desktop: columna por día */}
            <div
              className="hidden lg:grid gap-2"
              style={{ gridTemplateColumns: `repeat(${diasVisibles.length}, minmax(0, 1fr))` }}
            >
              {diasVisibles.map((dia) => (
                <div key={dia}>
                  <div className="border-b-2 border-primary/20 pb-2 mb-3">
                    <h3 className="font-black italic text-foreground text-sm tracking-tight text-center">
                      {dia}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {clasesFiltradas(dia).map((clase, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-colors">
                        <p className="font-bold text-xs text-foreground leading-tight">{clase.sede}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 text-primary shrink-0" />
                          <span className="text-xs text-muted-foreground">{clase.hora}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expandirNivel(clase.disciplina).map((b) => (
                            <Tooltip key={b} delayDuration={150}>
                              <TooltipTrigger asChild>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide cursor-default ${BADGE_STYLES[b] ?? ""}`}>
                                  {b}<Info className="w-2.5 h-2.5 opacity-50 shrink-0" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] text-xs leading-snug">
                                {BADGE_DESC[b]}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: lista por día */}
            <div className="lg:hidden flex flex-col gap-6">
              {diasVisibles.map((dia) => (
                <div key={dia}>
                  <div className="border-b-2 border-primary/20 pb-2 mb-3">
                    <h3 className="font-black italic text-foreground text-lg">{dia}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {clasesFiltradas(dia).map((clase, i) => (
                      <div key={i} className="bg-card border border-border rounded-lg p-3">
                        <p className="font-bold text-sm text-foreground leading-tight">{clase.sede}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{clase.hora}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expandirNivel(clase.disciplina).map((b) => (
                            <Tooltip key={b} delayDuration={150}>
                              <TooltipTrigger asChild>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide cursor-default ${BADGE_STYLES[b] ?? ""}`}>
                                  {b}<Info className="w-2.5 h-2.5 opacity-50 shrink-0" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] text-xs leading-snug">
                                {BADGE_DESC[b]}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </>
            )}
          </div>

          {/* Info seña */}
          <div className="max-w-7xl mx-auto mt-12 flex items-start gap-3 bg-background border border-border p-5">
            <Wallet className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/80">
              <strong>Sedes con seña:</strong> reservás con <strong>$35.000 transferencia</strong>{" "}
              o <strong>$32.000 efectivo</strong> — equivale a una clase única y se bonifica si
              comprás un plan dentro de los 7 días siguientes.
            </p>
          </div>
        </section>

        {/* Niveles */}
        <section className="px-6 lg:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display italic uppercase text-3xl md:text-4xl font-black mb-3">
              Ruta de aprendizaje
            </h2>
            <p className="text-foreground/70 mb-10">
              Trabajamos los tres niveles en una misma clase, con atención
              personalizada del instructor.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { t: "Inicial", d: "Equilibrio, primeros desplazamientos y confianza desde cero." },
                { t: "Principiante", d: "Giros más precisos, frenadas y postura para moverte con seguridad." },
                { t: "Intermedio", d: "Slalom, frenadas avanzadas, urbano y nuevos retos técnicos." },
              ].map((n) => (
                <div key={n.t} className="border border-border bg-card p-5">
                  <div className="font-display italic uppercase font-black text-xl text-primary mb-2">
                    {n.t}
                  </div>
                  <p className="text-foreground/70 text-sm">{n.d}</p>
                </div>
              ))}
            </div>
            <Link
              to="/ruta-de-aprendizaje"
              className="inline-flex items-center gap-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold uppercase tracking-[0.12em] px-6 py-3"
            >
              Ver la ruta de aprendizaje completa
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 lg:px-16 py-16 bg-card/40 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display italic uppercase text-3xl md:text-4xl font-black mb-8">
              Preguntas frecuentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "¿Puedo tomar la clase de prueba gratis en cualquier sede?",
                  a: "No. La clase es 100% gratis sólo en 5 sedes: Villa Luro, Colegiales, Plaza La Pampa, Belgrano y Facultad de Medicina. En las otras 7 sedes hay que reservar con una seña bonificable de $35.000 por transferencia o $32.000 en efectivo.",
                },
                {
                  q: "¿Cómo funciona la seña bonificable?",
                  a: "La seña equivale al valor de una clase única ($35.000 transferencia / $32.000 efectivo) y se descuenta de tu plan si comprás dentro de los 7 días siguientes a la clase. Avisanos por WhatsApp para aplicarlo.",
                },
                {
                  q: "¿Qué necesito llevar?",
                  a: "Ropa cómoda y, si tenés, tu equipo de patinaje (rollers + protecciones). Si no tenés equipo, podés alquilarlo en las sedes con servicio de alquiler — consultá por WhatsApp.",
                },
                {
                  q: "¿Cuánto dura la clase?",
                  a: "Aproximadamente 1 hora. Son clases grupales con atención personalizada del instructor según el nivel de cada alumno.",
                },
                {
                  q: "¿Es obligatorio usar protecciones?",
                  a: "Sí. Recomendamos rodilleras, coderas, muñequeras y casco para garantizar tu seguridad.",
                },
                {
                  q: "¿Qué pasa si llueve o se cancela mi clase?",
                  a: "Si reprogramamos por clima u otro motivo, te avisamos en el grupo de WhatsApp de la sede y extendemos la fecha de vencimiento de tu clase.",
                },
                {
                  q: "¿Si pagué la seña y no puedo asistir?",
                  a: "La seña no es reembolsable, salvo que canceles con 24 hs de anticipación y reprogrames dentro de los días vigentes establecidos.",
                },
                {
                  q: "¿Puedo tomar más de una clase de prueba?",
                  a: "No. Ofrecemos una clase de prueba por persona. Si querés continuar, podés inscribirte en cualquiera de nuestros planes.",
                },
                {
                  q: "¿Puedo cambiar la sede después de registrarme?",
                  a: "Sí, escribinos por WhatsApp antes de tu primera clase y verificamos disponibilidad.",
                },
                {
                  q: "¿Cómo me contacto si tengo más dudas?",
                  a: "Escribinos por WhatsApp al +54 11 6592-0600 o por mail a hola@comunidadnmroller.com.",
                },
              ].map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide hover:text-primary">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/70 text-sm leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <a
                href="#form"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] transition-all"
              >
                Solicitar mi clase
              </a>
            </div>
          </div>
        </section>

        <div className="py-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground uppercase tracking-[0.18em]"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al sitio
          </Link>
        </div>
      </main>
    </>
  );
};

export default ClaseGratis;
