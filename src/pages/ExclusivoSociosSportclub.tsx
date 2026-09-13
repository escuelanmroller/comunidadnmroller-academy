import { useState } from "react";
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
import FlyFreePanel from "@/components/FlyFreePanel";
import EquipoPropioNota from "@/components/EquipoPropioNota";
import {
  ArrowLeft,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import logoSportclub from "@/assets/logo-sportclub.webp";
import { sedes, Sede, alquilerEnClases } from "@/data/sedes";
import { PLANES_SPORTCLUB, ALQUILER_OPCIONES } from "@/data/sportclub";
import SedesMapa from "@/components/SedesMapa";
import PlanesSportclub from "@/components/PlanesSportclub";
import EquipoBanners from "@/components/sportclub/EquipoBanners";
import HorariosSportclub from "@/components/sportclub/HorariosSportclub";
import PreFiltroEquipo from "@/components/sportclub/PreFiltroEquipo";

// ── Niveles incluidos en el beneficio gratuito de socio SportClub ──
const SPORTCLUB_NIVEL = "Inicial · Princip.";

// ── Horarios del beneficio por sede (flyer SportClub · nivel Inicial/Principiante,
//    las 11 sedes). El orden define el orden de aparición. Para cambiar
//    sedes/horarios, editá SOLO este objeto. ──
const SPORTCLUB_HORARIOS: Record<string, { dia: string; hora: string }[]> = {
  "rosedal": [
    { dia: "Martes", hora: "09:00" },
    { dia: "Sábado", hora: "10:00" },
    { dia: "Domingo", hora: "10:00" },
    { dia: "Martes", hora: "19:00" },
    { dia: "Miércoles", hora: "19:00" },
    { dia: "Jueves", hora: "19:00" },
    { dia: "Sábado", hora: "18:00" },
  ],
  "puerto-madero": [
    { dia: "Martes", hora: "18:00" },
    { dia: "Martes", hora: "19:00" },
    { dia: "Sábado", hora: "10:00" },
  ],
  "caballito": [
    { dia: "Lunes", hora: "19:00" },
    { dia: "Martes", hora: "19:00" },
    { dia: "Jueves", hora: "19:00" },
    { dia: "Domingo", hora: "09:00" },
    { dia: "Domingo", hora: "10:00" },
  ],
  "vicente-lopez": [
    { dia: "Miércoles", hora: "19:00" },
    { dia: "Sábado", hora: "09:00" },
  ],
  "belgrano": [
    { dia: "Miércoles", hora: "19:00" },
    { dia: "Viernes", hora: "19:00" },
  ],
  "villa-luro": [{ dia: "Jueves", hora: "19:00" }],
  "colegiales": [
    { dia: "Miércoles", hora: "19:00" },
    { dia: "Viernes", hora: "19:00" },
  ],
  "plaza-la-pampa": [
    { dia: "Sábado", hora: "09:00" },
    { dia: "Domingo", hora: "09:00" },
  ],
  "devoto": [
    { dia: "Martes", hora: "19:00" },
    { dia: "Viernes", hora: "19:00" },
  ],
  "villa-real": [
    { dia: "Miércoles", hora: "18:00" },
    { dia: "Miércoles", hora: "19:00" },
    { dia: "Sábado", hora: "10:30" },
  ],
  "facultad-medicina": [
    { dia: "Viernes", hora: "19:00" },
    { dia: "Domingo", hora: "10:00" },
  ],
};

// Construye las sedes SportClub a partir de los datos base (ubicación, mapa)
// sobrescribiendo los horarios con los del beneficio. Así el mapa estilo Home
// muestra exactamente estos horarios.
const sportclubSedes: Sede[] = Object.keys(SPORTCLUB_HORARIOS)
  .map((id) => sedes.find((s) => s.id === id))
  .filter((s): s is Sede => Boolean(s))
  .map((s) => ({
    ...s,
    // Respetamos el dato real de alquiler de cada sede (no lo forzamos).
    // Así la viñeta "Alquiler" sólo aparece donde el servicio existe de verdad.
    clases: SPORTCLUB_HORARIOS[s.id].map((h) => ({ ...h, disciplina: SPORTCLUB_NIVEL })),
  }));

// Las 11 sedes del mapa son exactamente las del beneficio (sportclubSedes) —
// nunca "todas las sedes del sitio". Antes caía a los datos base (`?? s`) para
// la sede sin entrada en SPORTCLUB_HORARIOS (Belgrano Converse Park), que
// mostraba sus horarios reales de Rampas — una disciplina avanzada a la que
// los socios SportClub no acceden con el beneficio gratuito. Esa sede no
// comparte horario acá: directamente no aparece en este mapa.
const todasLasSedes: Sede[] = sportclubSedes;

// El beneficio gratuito cubre solo nivel inicial y principiante; reformulamos
// la pregunta como "perfil/identidad" (mismo estilo que los filtros de la Home).
const PERFIL_AVANZADO = "Quiero superarme y avanzar rápido";

const PERFILES = [
  { value: "Nunca patiné o no sé por dónde empezar", emoji: "🟢" },
  { value: "Ya sé lo básico, quiero mejorar", emoji: "🟡" },
  { value: PERFIL_AVANZADO, emoji: "🔴" },
];

const BENEFICIOS = [
  {
    Icon: Sparkles,
    t: "Sin costo extra",
    d: "Si sos socio SportClub con plan habilitado, accedés a clases de patinaje sin pagar de más.",
  },
  {
    Icon: ShieldCheck,
    t: "Seguro médico incluido",
    d: "Patiná tranquilo: tu actividad está cubierta durante la clase.",
  },
  {
    Icon: Tag,
    t: "Alquiler de equipo 50% OFF",
    d: "¿No tenés rollers ni protecciones? Alquilás tu equipo a mitad de precio en estas sedes.",
  },
  {
    Icon: Lock,
    t: "Nivel inicial y principiante",
    d: "El beneficio cubre estos dos niveles. Para avanzar a intermedio necesitás un plan.",
  },
];

const FormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(6, "WhatsApp inválido").max(40),
  plan: z.string().trim().min(1, "Elegí tu plan SportClub"),
  sede: z.string().trim().min(1, "Elegí una sede"),
  nivel: z.string().trim().min(1, "Elegí tu perfil"),
  alquiler: z.string().trim().min(1, "Indicá si necesitás alquiler"),
});

const ExclusivoSociosSportclub = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [sede, setSede] = useState("");
  const [nivel, setNivel] = useState("");
  const [alquiler, setAlquiler] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  // Sede elegida en el form: para mostrar su info (dirección, alquiler, horarios)
  const selectedSede = sportclubSedes.find((s) => s.nombre === sede);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse({ name, email, phone, plan, sede, nivel, alquiler });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      // El backend (subscribe-sportclub) recibe solo los campos que ya esperaba.
      // alquiler se usa para pre-llenar el WhatsApp en la confirmación.
      const { data, error } = await supabase.functions.invoke("subscribe-sportclub", {
        body: { name, email, phone, plan, sede, nivel, alquiler, website },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("¡Listo! Te contactamos por WhatsApp.");
        const payload = { name, email, phone, plan, sede, nivel, alquiler };
        // Backup en sessionStorage: el mensaje sigue personalizado aunque recarguen.
        try {
          sessionStorage.setItem("sportclub_form", JSON.stringify(payload));
        } catch {}
        navigate("/exclusivo-de-socios-sportclub-confirmado", { state: payload });
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
        <title>Exclusivo socios SportClub · Aprendé a patinar · NM Roller</title>
        <meta
          name="description"
          content="Si sos socio SportClub con plan Plus, Total, Elite o Flex, accedé sin costo extra a clases de patinaje (nivel inicial y principiante) en sedes seleccionadas. Cupos limitados."
        />
        <link rel="canonical" href="https://comunidadnmroller.com/exclusivo-de-socios-sportclub" />
        <meta property="og:title" content="Exclusivo socios SportClub · NM Roller" />
        <meta property="og:description" content="Aprendé a patinar sin costo extra si sos socio SportClub." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="pt-10 pb-6 px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/" aria-label="Inicio">
              <img src={logoNM} alt="NM Roller" className="h-12 md:h-14" />
            </Link>
            <span className="text-foreground/40 text-xl md:text-2xl font-light" aria-hidden="true">×</span>
            <div className="bg-white px-3 py-2 rounded-sm">
              <img src={logoSportclub} alt="SportClub" className="h-7 md:h-9" />
            </div>
          </div>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground/50 font-bold">
            Alianza oficial · Beneficio para socios
          </span>
        </header>

        {/* Hero + form */}
        <section className="px-6 lg:px-16 py-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F5B800] text-[#111] px-4 py-1.5 mb-6 text-[11px] md:text-xs font-black uppercase tracking-[0.18em]">
                <Sparkles className="w-3.5 h-3.5" /> Beneficio exclusivo · Socios SportClub
              </div>
              <h1 className="font-display italic uppercase leading-[0.95] text-2xl md:text-4xl lg:text-5xl font-black mb-8">
                Patinaje incluido<br />
                en tu plan SportClub<br />
                <span className="text-primary">sin costo extra</span>
              </h1>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl">
                Si tenés un plan <strong>Plus, Total, Elite o Flex</strong>, accedés a
                clases de patinaje de <strong>nivel inicial y principiante</strong> en sedes
                seleccionadas, con instructores de la comunidad NM Roller.{" "}
                <strong className="text-primary">Cupos limitados</strong> — registrate y asegurá
                tu lugar.
              </p>

              {/* Pasos */}
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {[
                  { n: "01", t: "Registrate como socio", d: "Completá el formulario con tus datos." },
                  { n: "02", t: "Elegí sede y horario", d: "De las habilitadas para socios." },
                  { n: "03", t: "Validamos tu alta", d: "Confirmamos tu beneficio y, si necesitás alquiler, lo coordinamos para tu próxima clase." },
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
                Registrarme como socio
              </h2>
              <p className="text-foreground/60 text-sm mb-6">
                Completá tus datos y te confirmamos el cupo por WhatsApp.
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
                <Select value={plan} onValueChange={setPlan} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="Tu plan SportClub" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANES_SPORTCLUB.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
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

                {nivel === PERFIL_AVANZADO && (
                  <div className="flex items-start gap-3 border border-[#F5B800]/40 bg-[#F5B800]/10 p-4">
                    <Rocket className="w-5 h-5 text-[#F5B800] mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      <strong className="text-foreground">Querés ir más allá de inicial y principiante.</strong>{" "}
                      Tu beneficio cubre esos dos niveles sin costo. Para acceder a{" "}
                      <strong>nivel intermedio, disciplinas y más frecuencia</strong> podés sumar
                      —de forma <strong>opcional</strong>— el <strong>Plan Full Socio SportClub</strong>{" "}
                      (si ya tenés tu equipo) o <strong>4 Clases + Alquiler</strong> (si te falta).
                      Completá tu registro y en la <strong>confirmación</strong> te damos los pasos.
                      Mientras tanto, podés empezar gratis en inicial y principiante.
                    </p>
                  </div>
                )}
                <Select value={sede} onValueChange={setSede} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="Sede en la que querés patinar" />
                  </SelectTrigger>
                  {/* max-w acotado a este dropdown: sin tope explícito, el popover
                      crece al ancho de su línea de texto más larga (cálculo
                      shrink-to-fit) y recién ahí el whitespace-normal del item
                      alcanza a wrappear — sin el tope, en mobile se pasaba del
                      viewport y el texto quedaba cortado contra el borde. */}
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    {/* Se cruza contra los horarios QUE ESTA PÁGINA muestra
                        (s.clases, sobrescrito por SPORTCLUB_HORARIOS), no contra
                        s.alquiler a secas — una sede puede tener alquiler en
                        general pero no en el turno que el beneficio ofrece acá
                        (ej. Vicente López: alquiler solo sábado, el beneficio
                        gratis es miércoles). */}
                    {sportclubSedes.map((s) => {
                      const info = alquilerEnClases(s, s.clases);
                      return (
                        <SelectItem key={s.id} value={s.nombre} className="py-2">
                          {/* block + min-w-0: el item es flex y por default no
                              encoge por debajo del ancho del texto sin wrappear
                              — "Alquiler solo miércoles, jueves y sábado" se
                              cortaba contra el borde del popover en mobile. */}
                          <span className="block min-w-0 whitespace-normal leading-snug">
                            {s.nombre}
                            {info.hay && (
                              <span className="text-primary font-bold">
                                {" "}· Alquiler{info.resumen ? ` solo ${info.resumen}` : " disponible"}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Detalle de la sede elegida: dirección, alquiler, horarios y cómo llegar */}
                {selectedSede && (
                  <div className="border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase text-xs tracking-wide leading-tight">
                          {selectedSede.nombre}
                        </p>
                        <p className="text-foreground/60 text-xs mt-0.5">
                          {selectedSede.direccion}
                        </p>
                        {(() => {
                          const info = alquilerEnClases(selectedSede, selectedSede.clases);
                          return (
                            info.hay && (
                              <p className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wide text-primary">
                                <Tag className="w-3 h-3" />
                                Alquiler de equipo 50% OFF{info.resumen ? ` · solo ${info.resumen}` : " en esta sede"}
                              </p>
                            )
                          );
                        })()}
                        {selectedSede.clases?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {selectedSede.clases.map((c, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-xs text-foreground/70"
                              >
                                <Clock className="w-3 h-3 text-primary shrink-0" />
                                <span className="font-semibold">{c.dia}</span>
                                <span className="text-foreground/50">{c.hora} hs</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {selectedSede.mapsUrl && (
                          <a
                            href={selectedSede.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-[10px] uppercase tracking-[0.18em] text-primary font-bold"
                          >
                            Cómo llegar →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Select value={alquiler} onValueChange={setAlquiler} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-none bg-background border-border text-base">
                    <SelectValue placeholder="¿Vas a necesitar alquiler de equipo?" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALQUILER_OPCIONES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {alquiler === "no" && <EquipoPropioNota />}
                {alquiler === "considerando" && <FlyFreePanel />}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrarme como socio"}
                </Button>
                <p className="text-[11px] text-foreground/50 leading-relaxed">
                  El beneficio cubre nivel inicial y principiante. Al enviar aceptás recibir
                  comunicaciones por WhatsApp y email sobre tu beneficio de socio SportClub.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Pre-filtro: ruta rápida según el equipo del usuario */}
        <PreFiltroEquipo />

        {/* Beneficios */}
        <section className="px-6 lg:px-16 py-16 bg-card/40 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.18em] text-primary font-bold">
                Tu beneficio de socio
              </span>
            </div>
            <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black mb-3">
              Lo que incluye
            </h2>
            <p className="text-foreground/70 max-w-2xl mb-10">
              Como socio SportClub con plan habilitado, esto es lo que tenés al sumarte
              a las clases de NM Roller.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENEFICIOS.map((b) => (
                <div key={b.t} className="bg-background border border-border p-5">
                  <b.Icon className="w-6 h-6 text-primary mb-3" strokeWidth={2.2} />
                  <h3 className="font-bold uppercase text-sm tracking-wide mb-2">{b.t}</h3>
                  <p className="text-foreground/60 text-xs leading-relaxed">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sedes + mapa (estilo Home) */}
        <section className="px-6 lg:px-16 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.18em] text-primary font-bold">
                Dónde patinar
              </span>
            </div>
            <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black mb-3">
              {todasLasSedes.length} sedes
            </h2>
            <p className="text-foreground/70 max-w-2xl mb-10">
              Explorá el mapa y elegí la que te quede más cómoda. Las marcadas con{" "}
              <span className="text-secondary font-bold uppercase">Alquiler</span> ofrecen
              equipo para alquilar — 50% OFF para socios SportClub.
            </p>
          </div>

          {/* Mapa Leaflet con las 11 sedes (badge Alquiler donde corresponde) */}
          <SedesMapa sedesList={todasLasSedes} sidebarTitle="Elegí tu sede" />

          {/* Grilla horaria del beneficio socio (estilo Home) */}
          <HorariosSportclub sedesBeneficio={sportclubSedes} nivelLabel={SPORTCLUB_NIVEL} />
        </section>

        {/* Planes para escalar (abonás extra) */}
        <PlanesSportclub />

        {/* Banners de equipo en alianza con FlyFree (antes de FAQ) */}
        <EquipoBanners />

        {/* FAQ */}
        <section className="px-6 lg:px-16 py-16 bg-card/40 border-t border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display italic uppercase text-3xl md:text-4xl font-black mb-8">
              Preguntas frecuentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "¿Qué planes de SportClub aplican?",
                  a: "Los planes Plus, Total, Elite y Flex. Si tenés alguno de esos, accedés sin costo extra a las clases de nivel inicial y principiante en las sedes habilitadas.",
                },
                {
                  q: "¿Qué niveles cubre el beneficio gratuito?",
                  a: "Solo nivel inicial y principiante. Si querés avanzar a nivel intermedio y seguir progresando, necesitás adquirir un plan.",
                },
                {
                  q: "¿Puedo ir a cualquier sede o tomar 2 clases por día?",
                  a: "Ya accedés a las 11 sedes con el beneficio gratuito, a una clase por día y con el cupo de tu turno. Para otras disciplinas, más horarios sin ese cupo, o hasta 2 clases por día, necesitás un plan.",
                },
                {
                  q: "¿Tiene algún costo para el socio?",
                  a: "No. La clase está incluida en tu beneficio de socio SportClub. Solo el alquiler de equipo (si lo necesitás) tiene un valor, y para socios es 50% OFF.",
                },
                {
                  q: "¿Cómo acredito que soy socio SportClub?",
                  a: "Después de registrarte te escribimos por WhatsApp y te pedimos los datos de tu membresía para validarla. Es rápido.",
                },
                {
                  q: "¿Necesito tener mi propio equipo?",
                  a: "No es obligatorio. Si no tenés rollers ni protecciones, podés alquilar tu equipo a mitad de precio en las sedes habilitadas (con 24 hs de anticipación).",
                },
                {
                  q: "¿Los cupos son limitados?",
                  a: "Sí. Las clases son grupales con atención personalizada, por lo que el cupo por sede y horario es limitado. Te recomendamos registrarte cuanto antes.",
                },
                {
                  q: "¿Es obligatorio usar protecciones?",
                  a: "Sí. Recomendamos rodilleras, coderas, muñequeras y casco para garantizar tu seguridad durante la clase.",
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
                Registrarme como socio
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

export default ExclusivoSociosSportclub;
