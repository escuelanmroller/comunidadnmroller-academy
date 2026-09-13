import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Construction,
  Loader2,
  MapPin,
  Rocket,
  Trophy,
  Zap,
} from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";

const FormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
});

const WA_URL =
  "https://wa.me/5491165920600?text=Hola%21+Te+escribo+desde+la+p%C3%A1gina+de+Ruta+de+Aprendizaje+de+Comunidad+NM+Roller.+Quiero+m%C3%A1s+informaci%C3%B3n+%F0%9F%9B%BC";

const NIVELES = [
  {
    num: 1,
    color: "#3FB950",
    colorText: "text-[#3FB950]",
    colorBorder: "border-[#3FB950]/40",
    colorBg: "bg-[#3FB950]/10",
    dotClass: "bg-[#3FB950]",
    titulo: "Inicial",
    subtitulo: "Explorar sin miedo",
    skills: [
      {
        title: "Pararte y caerte con seguridad",
        desc: "Sabés cómo levantarte sin ayuda si te caés. Sentís que estás en control del cuerpo, incluso si algo no sale.",
      },
      {
        title: "Caminar sobre ruedas en plano",
        desc: "Desplazamiento, equilibrio, pingüino. Lográs avanzar sin ayuda, haciendo pasos cortos y seguros.",
      },
      {
        title: "Adoptar la posición básica (V / A / T)",
        desc: "Entendés cómo usar tu cuerpo para mantener el equilibrio, sin rigidez.",
      },
      {
        title: "Primer freno natural (sin derrapar)",
        desc: "Empezás a frenar sin que el cuerpo te gane, usando tus pies o posición.",
      },
      {
        title: "Mirar, empujar y mantener el equilibrio al mismo tiempo",
        desc: "Tus movimientos empiezan a fluir de forma más coordinada.",
      },
    ],
    logros: [
      "Rollear por tu cuenta en superficies planas, sin miedo",
      "Empezar a frenar con control",
      "Disfrutar el movimiento, enfocarte menos en no caerte",
      "Conectar con tu cuerpo en movimiento",
    ],
    disciplinas: [
      "RollerFit – Te ayuda a controlar el cuerpo con ritmo y ejercicios suaves",
    ],
    desafio: "Participar en tu primera Salida Urbana de la comunidad, acompañado por profes y coordinadores",
  },
  {
    num: 2,
    color: "#F5B800",
    colorText: "text-[#F5B800]",
    colorBorder: "border-[#F5B800]/40",
    colorBg: "bg-[#F5B800]/10",
    dotClass: "bg-[#F5B800]",
    titulo: "Principiante",
    subtitulo: "Moverte con confianza",
    skills: [
      {
        title: "Girar con control (cuña o tijera)",
        desc: "Ya podés cambiar de dirección con seguridad, sin frenar bruscamente.",
      },
      {
        title: "Hacer transiciones (de frente a espalda y viceversa)",
        desc: "Empezás a girar el cuerpo mientras patinás, y podés avanzar de espaldas.",
      },
      {
        title: "Frenar con técnica (cuña, T o spin)",
        desc: "Aplicás técnicas más efectivas para detenerte donde querés.",
      },
      {
        title: "Desplazarte en zigzag",
        desc: "Usás tus pies para avanzar con fluidez, cambiando de dirección con ritmo.",
      },
      {
        title: "Patinar para atrás y saltar sin miedo",
        desc: "Podés empujar hacia atrás y hacer saltos pequeños, con control.",
      },
    ],
    logros: [
      "Patinar con fluidez en bicisendas, parques y plazas",
      "Superar pendientes o esquivar obstáculos simples",
      "Frenar sin derrapar ni desestabilizarte",
      "Sentirte cada vez más autónomo/a sobre ruedas",
      "Explorar técnicas nuevas sin miedo a equivocarte",
    ],
    disciplinas: [
      "Urbano Inicial – Para practicar lo aprendido en un entorno real, con guía",
      "Roller Fútbol – Usás tus habilidades para jugar en equipo",
      "Skate Park (básico) – Probás rampas pequeñas con protecciones",
      "Slides (en piso encerado) – Explorás frenos avanzados",
      "Slalom básico – Aprendés a moverte entre conos con fluidez",
    ],
    desafio: "Participar en una salida urbana fluida o un evento comunitario especial",
  },
  {
    num: 3,
    color: "#62C3BF",
    colorText: "text-[#62C3BF]",
    colorBorder: "border-[#62C3BF]/40",
    colorBg: "bg-[#62C3BF]/10",
    dotClass: "bg-[#62C3BF]",
    titulo: "Intermedio",
    subtitulo: "Fluir con estilo propio",
    skills: [
      {
        title: "Hacer giros con fluidez (crossover)",
        desc: "Cambiás de dirección cruzando los pies, con flow y velocidad.",
      },
      {
        title: "Frenos de emergencia (powerslide, soul)",
        desc: "Podés detenerte con estilo, incluso girando o derrapando.",
      },
      {
        title: "Saltar en movimiento, con giro o en rampas",
        desc: "Tenés confianza para levantar vuelo con tus patines, sin miedo.",
      },
      {
        title: "Transiciones avanzadas (en una pierna o con salto)",
        desc: "Tu cuerpo responde a lo que querés hacer, incluso si es complejo.",
      },
      {
        title: "Equilibrarte sobre ruedas, incluso en reversa",
        desc: "Jugás con el balance, incluso cuando patinás hacia atrás o en zigzag.",
      },
    ],
    logros: [
      "Patinar con autonomía en calles o en la ciudad",
      "Crear tu propio estilo de patinaje",
      "Participar activamente de encuentros, clases técnicas y desafíos",
      "Integrarte a nuevas disciplinas con más confianza",
    ],
    disciplinas: [
      "Skate Park (básico-intermedio) – Rampas, saltos, técnicas aéreas",
      "Slalom Freestyle – Combinaciones creativas entre conos",
      "Slides – Técnicas de frenado en calle real",
      "Roller Fútbol grupal (competencia) – Participás activamente de juegos reales",
      "Salidas urbanas / Salidas de Comunidades – Salidas largas, intensas y memorables",
      "Urbano Intermedio – Para rodar en entornos reales con más ritmo",
    ],
    desafio: "Compartir un truco, participar en una demo o enseñarle algo a otra persona",
  },
];

const NivelCard = ({ nivel }: { nivel: (typeof NIVELES)[number] }) => {
  const [openSkills, setOpenSkills] = useState(false);

  return (
    <div
      className={`border ${nivel.colorBorder} bg-card overflow-hidden`}
    >
      {/* Header */}
      <div className={`${nivel.colorBg} px-6 py-5 flex items-center gap-4`}>
        <div
          className={`w-10 h-10 rounded-full ${nivel.dotClass} flex items-center justify-center shrink-0`}
        >
          <span className="text-[#111] font-black text-base">{nivel.num}</span>
        </div>
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${nivel.colorText} mb-0.5`}
          >
            Nivel {nivel.num}
          </p>
          <h3 className="font-black italic text-foreground text-xl leading-tight">
            {nivel.titulo}:{" "}
            <span className={nivel.colorText}>{nivel.subtitulo}</span>
          </h3>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Skills toggle */}
        <div>
          <button
            onClick={() => setOpenSkills(!openSkills)}
            className="flex items-center gap-2 text-foreground/80 font-bold text-sm uppercase tracking-wide mb-3 hover:text-foreground transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Lo que podrías estar dominando
            <ChevronDown
              className={`w-4 h-4 ml-auto transition-transform ${openSkills ? "rotate-180" : ""}`}
            />
          </button>
          {openSkills && (
            <ul className="space-y-3">
              {nivel.skills.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <ChevronRight
                    className={`w-4 h-4 mt-0.5 shrink-0 ${nivel.colorText}`}
                  />
                  <div>
                    <p className="text-foreground text-sm font-bold">{s.title}</p>
                    <p className="text-foreground/60 text-sm">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Logros */}
        <div>
          <p className="flex items-center gap-2 text-foreground/80 font-bold text-sm uppercase tracking-wide mb-3">
            <Rocket className="w-4 h-4 text-primary" />
            Lo que vas a poder lograr
          </p>
          <ul className="space-y-1.5">
            {nivel.logros.map((l) => (
              <li key={l} className="flex gap-2 text-sm text-foreground/70">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${nivel.dotClass}`} />
                {l}
              </li>
            ))}
          </ul>
        </div>

        {/* Disciplinas */}
        <div>
          <p className="flex items-center gap-2 text-foreground/80 font-bold text-sm uppercase tracking-wide mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Disciplinas que podés explorar
          </p>
          <ul className="space-y-1.5">
            {nivel.disciplinas.map((d) => (
              <li
                key={d}
                className={`text-sm px-3 py-1.5 border ${nivel.colorBorder} ${nivel.colorText} font-medium`}
              >
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Desafío */}
        <div
          className={`border-l-2 pl-4`}
          style={{ borderColor: nivel.color }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">
            Desafío simbólico
          </p>
          <p className={`text-sm font-bold ${nivel.colorText}`}>
            {nivel.desafio}
          </p>
        </div>

        {/* CTA nivel */}
        <Link
          to="/clase-gratis"
          className={`flex items-center justify-between text-sm font-bold border ${nivel.colorBorder} ${nivel.colorText} px-4 py-2.5 hover:bg-white/5 transition-colors`}
        >
          <span>¿Querés practicar este nivel? Probar una clase gratis</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
};

const LeadForm = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse({ name, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { ...parsed.data, website, ubicacion: "ruta-aprendizaje" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(
          data.alreadySubscribed
            ? "Ya estabas en la lista. ¡Nos vemos pronto!"
            : "¡Listo! Te avisamos cuando la guía esté disponible."
        );
        navigate("/registro-confirmado-newsletter?from=ruta");
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      {!compact && (
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-foreground/40"
            required
          />
          <Input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-foreground/40"
            required
          />
        </div>
      )}
      {compact && (
        <>
          <Input
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-foreground/40"
            required
          />
          <Input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-foreground/40"
            required
          />
        </>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-black italic text-sm uppercase tracking-[0.12em] py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Quiero la guía completa gratis
          </>
        )}
      </button>
      <p className="text-foreground/40 text-[11px] text-center">
        Sin spam. Podés darte de baja cuando quieras.
      </p>
    </form>
  );
};

const RutaDeAprendizaje = () => {
  return (
    <>
      <Helmet>
        <title>Ruta de Aprendizaje — Comunidad NM Roller</title>
        <meta
          name="description"
          content="Descubrí todo lo que podés aprender en patinaje aunque hoy no sepas ni frenar. Mapa de aprendizaje con 3 niveles: Inicial, Principiante e Intermedio."
        />
        <link rel="canonical" href="https://comunidadnmroller.com/ruta-de-aprendizaje" />
        <meta property="og:title" content="Ruta de Aprendizaje — Comunidad NM Roller" />
        <meta
          property="og:description"
          content="Tu progreso sobre ruedas, paso a paso. Mapa de aprendizaje de NM Roller."
        />
        <meta property="og:url" content="https://comunidadnmroller.com/ruta-de-aprendizaje" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <img src={logoNM} alt="NM Roller" className="h-8" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-[0.12em] bg-primary text-white px-4 py-2 hover:bg-primary/90 transition-colors shrink-0"
          >
            Consultas
          </a>
        </div>
      </nav>

      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="pt-16 pb-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-4">
              Ruta de Aprendizaje · NM Roller
            </p>
            <h1 className="font-black italic text-3xl sm:text-5xl leading-tight text-foreground mb-5">
              Descubrí todo lo que podés aprender{" "}
              <span className="text-primary">aunque hoy no sepas ni frenar</span>
            </h1>
            <p className="text-foreground/60 text-lg leading-relaxed mb-3">
              Este mapa es una guía para que reconozcas tu progreso en el patinaje. No es un examen,
              ni una etiqueta. Es una herramienta para motivarte, inspirarte y celebrar cada paso.
            </p>
            <p className="text-foreground/40 text-sm italic">
              "Podés estar en varias etapas a la vez. Tu proceso es personal."
            </p>
          </div>
        </section>

        {/* En construcción + lead capture */}
        <section className="py-14 border-b border-border bg-card">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-start gap-3 mb-6">
              <Construction className="w-5 h-5 text-[#F5B800] shrink-0 mt-1" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F5B800] mb-1">
                  En preparación
                </p>
                <h2 className="font-black italic text-2xl text-foreground leading-snug">
                  La guía completa + Bitácora personal se vienen
                </h2>
                <p className="text-foreground/60 text-sm mt-2 leading-relaxed">
                  Estamos preparando una guía visual descargable con el mapa completo, tu bitácora
                  personal de avances y desafíos para cada nivel. Dejá tu nombre y mail y te
                  avisamos cuando esté lista —{" "}
                  <span className="text-foreground font-semibold">sin costo, es un regalo.</span>
                </p>
              </div>
            </div>
            <LeadForm />
          </div>
        </section>

        {/* Lo que vas a descubrir */}
        <section className="py-14 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">
                Tu camino sobre ruedas
              </p>
              <h2 className="font-black italic text-3xl text-foreground">
                3 niveles. Tu propio ritmo.
              </h2>
              <p className="text-foreground/50 text-sm mt-3">
                Expandí cada nivel para ver las habilidades, lo que vas a lograr y las disciplinas
                disponibles.
              </p>
            </div>

            <div className="space-y-6">
              {NIVELES.map((nivel) => (
                <NivelCard key={nivel.num} nivel={nivel} />
              ))}
            </div>
          </div>
        </section>

        {/* Atrae a quienes */}
        <section className="py-14 border-b border-border bg-card">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="font-black italic text-2xl text-foreground">
                ¿Esto es para vos?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "🛼",
                  title: "Tenés rollers guardados",
                  desc: "Los compraste con entusiasmo pero nunca los usaste de verdad. Este mapa es tu punto de partida.",
                },
                {
                  icon: "🤔",
                  title: "Sentís curiosidad pero dudás",
                  desc: "No sabés si sos capaz, si te vas a caer, si es para tu edad. Spoiler: sí, sí podés.",
                },
                {
                  icon: "💳",
                  title: "Sos Socio SportClub",
                  desc: "Ya tenés el beneficio de clases incluido. El mapa te muestra todo lo que podés aprovechar.",
                },
                {
                  icon: "🏃",
                  title: "Buscás algo diferente al gym",
                  desc: "Querés moverte, divertirte y progresar sin que se sienta como una obligación.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-border p-5 flex gap-4">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{item.title}</p>
                    <p className="text-foreground/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Barrios / SEO local */}
        <section className="py-14 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">
              Dónde practicás
            </p>
            <h2 className="font-black italic text-2xl text-foreground mb-4">
              Clases de patinaje en +10 sedes de Buenos Aires
            </h2>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Podés recorrer esta ruta de aprendizaje en cualquiera de nuestras sedes outdoor en CABA y
              GBA:{" "}
              <span className="text-foreground font-medium">
                Palermo, Caballito, Belgrano, Colegiales, Villa Luro, Puerto Madero, Devoto, Villa
                Real, Plaza La Pampa y Vicente López.
              </span>{" "}
              Todas las clases se dictan al aire libre, con profesores del staff de NM Roller.
            </p>
            <Link
              to="/clase-gratis"
              className="inline-flex items-center gap-2 bg-primary text-white font-black italic text-sm uppercase tracking-[0.12em] px-6 py-3 hover:bg-primary/90 transition-colors"
            >
              Elegí tu sede y probá gratis
            </Link>
          </div>
        </section>

        {/* CTA final doble */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="font-black italic text-3xl text-foreground mb-4">
              El primer paso siempre es{" "}
              <span className="text-primary">el más importante</span>
            </h2>
            <p className="text-foreground/60 text-base mb-8 leading-relaxed">
              Registrate para recibir la guía completa cuando esté lista, o probá una clase gratis
              esta semana y empezá a descubrir en qué nivel estás.
            </p>

            <div className="max-w-sm mx-auto mb-8">
              <LeadForm compact />
            </div>

            <div className="flex items-center gap-3 justify-center text-foreground/30 text-sm mb-6">
              <div className="h-px flex-1 bg-border" />
              <span>o si preferís empezar ya</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Link
              to="/clase-gratis"
              className="inline-flex items-center gap-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold uppercase tracking-[0.12em] px-6 py-3"
            >
              Probá una clase gratis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default RutaDeAprendizaje;
