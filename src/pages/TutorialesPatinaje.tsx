import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Instagram, Heart, ExternalLink, Play, X, ChevronRight } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import Footer from "@/components/Footer";

type Categoria = "Primeros pasos" | "Elegir equipo" | "Mejorar técnica";

interface Tutorial {
  shortcode: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  likes: number;
}

const TUTORIALES: Tutorial[] = [
  // ── Primeros pasos ──────────────────────────────────────────────────────
  {
    shortcode: "DXzUMAGu_1e",
    titulo: "¿Alquilar o comprar tus primeros rollers?",
    descripcion:
      "Cuándo tiene sentido arrancar con alquiler y cuándo ya es el momento de invertir en tu propio equipo.",
    categoria: "Primeros pasos",
    likes: 1999,
  },
  {
    shortcode: "C8Up1aiOn8m",
    titulo: "Qué disciplinas podés aprender",
    descripcion:
      "Primeros pasos, slalom, urbano y más. Conocé todas las disciplinas y encontrá la que más se adapta a vos.",
    categoria: "Primeros pasos",
    likes: 464,
  },
  {
    shortcode: "DXSaObNj8lv",
    titulo: "Protecciones: qué es obligatorio usar",
    descripcion:
      "Nunca salgas a patinar sin tus protecciones. Qué elementos son indispensables y cómo colocártelos bien.",
    categoria: "Primeros pasos",
    likes: 417,
  },
  {
    shortcode: "DYzaFG1xhil",
    titulo: "Consejos esenciales para empezar",
    descripcion:
      "No necesitás comprar de entrada. Lo importante es el equipo correcto, buena asesoría y arrancar acompañado.",
    categoria: "Primeros pasos",
    likes: 270,
  },
  {
    shortcode: "DY92HuTxxCQ",
    titulo: "¿Querés empezar? Esto es lo que necesitás saber",
    descripcion:
      "No necesitás experiencia previa. Lo clave es el equipo adecuado, protecciones que te cuiden y una comunidad que te acompañe.",
    categoria: "Primeros pasos",
    likes: 247,
  },

  // ── Elegir equipo ────────────────────────────────────────────────────────
  {
    shortcode: "DXVHJaXj7ly",
    titulo: "TOP 5 modelos de rollers recomendados",
    descripcion:
      "Los 5 modelos que más recomendamos según tu nivel y presupuesto. La respuesta definitiva a la pregunta más frecuente.",
    categoria: "Elegir equipo",
    likes: 2403,
  },
  {
    shortcode: "DXMi6c_DjGw",
    titulo: "Mejor bota rígida extensible del mercado",
    descripcion:
      "Análisis completo: para quién sirve, cuándo conviene elegirla y cuáles son sus ventajas sobre la bota fija.",
    categoria: "Elegir equipo",
    likes: 2241,
  },
  {
    shortcode: "DYKYtrXOGRv",
    titulo: "¿No sabés qué roller elegir? Las claves que sí importan",
    descripcion:
      "Bota rígida siempre. Las características técnicas clave para que el roller sea de buena calidad y aprendas con seguridad.",
    categoria: "Elegir equipo",
    likes: 451,
  },
  {
    shortcode: "DVtLl5EOUYF",
    titulo: "3 ruedas vs 4 ruedas: cuál te conviene",
    descripcion:
      "4 ruedas = más estabilidad (ideal para empezar o slalom). 3 ruedas = más velocidad y fluidez (para urbano y rutas).",
    categoria: "Elegir equipo",
    likes: 376,
  },
  {
    shortcode: "DXiK1OTESqi",
    titulo: "RS600: ficha técnica completa",
    descripcion:
      "Bota rígida reforzada con fibra de vidrio, guía aluminio CNC, ruedas 80mm 85A y rodamientos ABEC-9. Todo antes de comprar.",
    categoria: "Elegir equipo",
    likes: 261,
  },
  {
    shortcode: "DXPkw4BD4MH",
    titulo: "Análisis en profundidad: rollers RS600",
    descripcion:
      "Review detallado: prestaciones, precio, para qué perfil de patinador es ideal y cómo se compara con la competencia.",
    categoria: "Elegir equipo",
    likes: 713,
  },
  {
    shortcode: "DYKvWyjOIvy",
    titulo: "Señales de que ya es hora de cambiar tus rollers",
    descripcion:
      "Incomodidad, inseguridad, sensación de que algo no cierra. A veces no es entrenar más — es dejar un equipo que ya cumplió su ciclo.",
    categoria: "Elegir equipo",
    likes: 128,
  },
  {
    shortcode: "DXRoc1aDq6-",
    titulo: "RSK Kids: el primer roller para peques",
    descripcion:
      "Bota firme que sostiene el tobillo, ajuste fácil, extensible hasta 4 talles. Todo lo que necesitás para el primer roller de tu hijo/a.",
    categoria: "Elegir equipo",
    likes: 125,
  },
  {
    shortcode: "DYqMG3FOhug",
    titulo: "RSK Kids vs RSJ: rollers para peques y adultos",
    descripcion:
      "RSK Kids del talle 28 al 35 para arrancar. RSJ disponible hasta talle 40, apto tanto para niños como adultos.",
    categoria: "Elegir equipo",
    likes: 70,
  },

  // ── Mejorar técnica ──────────────────────────────────────────────────────
  {
    shortcode: "DYiYHg0ScYr",
    titulo: "Postura y equilibrio: la base de todo",
    descripcion:
      "Aprendé a pararte bien, flexionar y mantener el equilibrio. El primer paso que define todo lo que viene después.",
    categoria: "Mejorar técnica",
    likes: 2508,
  },
  {
    shortcode: "DX9Wr4ZNca_",
    titulo: "Técnica de patinaje urbano",
    descripcion:
      "Postura, frenada y cómo leer el terreno. Lo que necesitás para moverte con seguridad en la calle.",
    categoria: "Mejorar técnica",
    likes: 1227,
  },
  {
    shortcode: "DY0GPbQSEzL",
    titulo: "Cómo bajar un cordón (varias técnicas)",
    descripcion:
      "Bajar un cordón puede dar miedo al principio. Acá te mostramos distintas maneras según tu nivel actual.",
    categoria: "Mejorar técnica",
    likes: 834,
  },
  {
    shortcode: "DZGrmVOKqWH",
    titulo: "Cómo frenar correctamente",
    descripcion:
      "Dos métodos de frenada, cuándo usar cada uno y los errores más comunes que hay que evitar desde el principio.",
    categoria: "Mejorar técnica",
    likes: 458,
  },
  {
    shortcode: "DYZ-H0INFOK",
    titulo: "El proceso real de aprender a patinar",
    descripcion:
      "No todo te sale a la primera, y eso está perfecto. Aprender también es caerte, reírte y volver a intentarlo.",
    categoria: "Mejorar técnica",
    likes: 422,
  },
  {
    shortcode: "DX2OvWEuH_M",
    titulo: "Medias para patinar: por qué importan",
    descripcion:
      "Usar buenas medias marca la diferencia en comodidad y ajuste dentro del patín. Cómo elegirlas y qué tener en cuenta.",
    categoria: "Mejorar técnica",
    likes: 72,
  },
];

// ── Categorías ────────────────────────────────────────────────────────────

const CATEGORIAS: Array<Categoria | "Todos"> = [
  "Primeros pasos",
  "Elegir equipo",
  "Mejorar técnica",
  "Todos",
];

const CATEGORIA_STYLE: Record<Categoria, string> = {
  "Primeros pasos": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Elegir equipo":  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Mejorar técnica":"bg-primary/10 text-primary border border-primary/20",
};

const CATEGORIA_ACTIVE: Record<Categoria, string> = {
  "Primeros pasos": "bg-emerald-500 text-white border-emerald-500",
  "Elegir equipo":  "bg-blue-500 text-white border-blue-500",
  "Mejorar técnica":"bg-primary text-primary-foreground border-primary",
};

// ── CTAs por categoría ────────────────────────────────────────────────────

interface CtaData {
  eyebrow: string;
  titulo: string;
  descripcion: string;
  cta1Label: string;
  cta1Href: string;
  cta1IsInternal: boolean;
  cta2Label?: string;
  cta2Href?: string;
  accentClass: string;
}

const CTAS: Record<Categoria, CtaData> = {
  "Primeros pasos": {
    eyebrow: "¿Listo para dar el primer paso?",
    titulo: "Probá una clase de prueba gratis",
    descripcion:
      "Sin experiencia previa, sin equipo propio. Venís, te equipamos y vivís la experiencia de primera mano. Sin presión.",
    cta1Label: "Reservar mi clase gratis",
    cta1Href: "/clase-gratis",
    cta1IsInternal: true,
    cta2Label: "Consultarnos por WhatsApp",
    cta2Href:
      "https://wa.me/5491165920600?text=Hola%21+Quiero+empezar+a+patinar+pero+tengo+dudas.+%C2%BFMe+pueden+ayudar%3F",
    accentClass: "from-emerald-500/10 to-transparent border-emerald-500/20",
  },
  "Elegir equipo": {
    eyebrow: "¿No sabés cuál elegir?",
    titulo: "Asesoramiento personalizado sin costo",
    descripcion:
      "Contestamos todas tus dudas antes de que compres. Modelo, talle, presupuesto — te ayudamos a elegir el que más se adapta a vos.",
    cta1Label: "Escribirnos por WhatsApp",
    cta1Href:
      "https://wa.me/5491151097151?text=%5BLP-TT-NM%5D+Hola%21+Te+escribo+desde+los+tutoriales+de+Comunidad+NM+Roller.+Quiero+asesoramiento+para+elegir+mis+rollers.+%C2%BFPueden+ayudarme%3F",
    cta1IsInternal: false,
    cta2Label: "Ver equipamiento · Fly Free",
    cta2Href: "https://www.flyfreeurban.com/marcas/",
    accentClass: "from-blue-500/10 to-transparent border-blue-500/20",
  },
  "Mejorar técnica": {
    eyebrow: "¿Querés acelerar tu progreso?",
    titulo: "Subí de nivel con una Masterclass",
    descripcion:
      "En una Masterclass avanzás más en un día que en semanas de práctica sola. Con profes, correcciones y un grupo que te empuja.",
    cta1Label: "Ver próxima Masterclass",
    cta1Href: "/masterclass-de-patinaje",
    cta1IsInternal: true,
    cta2Label: "Ver planes de clases",
    cta2Href: "/#planes",
    accentClass: "from-primary/10 to-transparent border-primary/20",
  },
};

// ── Componente ────────────────────────────────────────────────────────────

const TutorialesPatinaje = () => {
  const [filtro, setFiltro] = useState<Categoria | "Todos">("Primeros pasos");
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  const visibles =
    filtro === "Todos"
      ? TUTORIALES
      : TUTORIALES.filter((t) => t.categoria === filtro);

  const ctaActivo = filtro !== "Todos" ? CTAS[filtro as Categoria] : null;

  const toggleEmbed = (shortcode: string) => {
    setActiveEmbed((prev) => (prev === shortcode ? null : shortcode));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Tutoriales de Patinaje | Comunidad NM Roller</title>
        <meta
          name="description"
          content="Tutoriales de técnica, equipo y primeros pasos para patinadores de todos los niveles. NM Roller + Fly Free Urban."
        />
      </Helmet>

      {/* Header */}
      <header className="pt-10 pb-4 flex justify-center relative">
        <Link
          to="/"
          aria-label="Volver al inicio"
          className="absolute left-4 top-1/2 -translate-y-1/2 mt-5 flex items-center gap-1.5 text-foreground/50 hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
        <Link to="/" aria-label="Volver al inicio">
          <img src={logoNM} alt="NM Roller" className="h-14" />
        </Link>
      </header>

      {/* Hero */}
      <section className="text-center px-4 pt-10 pb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
          <Instagram className="w-3.5 h-3.5" />
          @roller_nm · @flyfreeurban
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold italic mb-3">
          Tutoriales de Patinaje
        </h1>
        <p className="text-foreground/60 max-w-lg mx-auto text-base">
          Desde tu primer paso hasta mejorar tu técnica. Lo mejor de nuestro
          Instagram y el de nuestros aliados de Fly Free Urban.
        </p>
      </section>

      {/* Filtros */}
      <div className="flex justify-center gap-2 flex-wrap px-4 pb-10">
        {CATEGORIAS.map((cat) => {
          const isActive = filtro === cat;
          const count =
            cat === "Todos"
              ? TUTORIALES.length
              : TUTORIALES.filter((t) => t.categoria === cat).length;
          const activeStyle =
            cat !== "Todos"
              ? CATEGORIA_ACTIVE[cat as Categoria]
              : "bg-foreground text-background border-foreground";

          return (
            <button
              key={cat}
              onClick={() => {
                setFiltro(cat);
                setActiveEmbed(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                isActive
                  ? cat === "Todos"
                    ? "bg-foreground text-background border-foreground"
                    : CATEGORIA_ACTIVE[cat as Categoria]
                  : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {cat}
              <span className="ml-1.5 opacity-70 text-xs font-normal">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <main className="container mx-auto px-4 pb-16 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibles.map((t) => {
            const isOpen = activeEmbed === t.shortcode;
            const igUrl = `https://www.instagram.com/p/${t.shortcode}/`;

            return (
              <div
                key={t.shortcode}
                className={`flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? "border-primary/50 shadow-lg shadow-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* Preview / Embed */}
                {isOpen ? (
                  <div className="relative bg-black">
                    <button
                      onClick={() => toggleEmbed(t.shortcode)}
                      aria-label="Cerrar previsualización"
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <iframe
                      src={`https://www.instagram.com/p/${t.shortcode}/embed/`}
                      className="w-full border-0"
                      style={{ height: 480 }}
                      loading="lazy"
                      scrolling="no"
                      allowTransparency
                      title={t.titulo}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => toggleEmbed(t.shortcode)}
                    aria-label={`Ver previsualización: ${t.titulo}`}
                    className="relative w-full overflow-hidden group/play"
                    style={{ height: 160 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-foreground/[0.03] to-background" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-background/80 border border-border flex items-center justify-center group-hover/play:scale-110 group-hover/play:border-primary/50 transition-transform duration-200">
                        <Play className="w-6 h-6 text-primary fill-primary" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[11px] text-foreground/40 group-hover/play:text-primary transition-colors whitespace-nowrap">
                      Ver previsualización
                    </span>
                  </button>
                )}

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${CATEGORIA_STYLE[t.categoria]}`}
                    >
                      {t.categoria}
                    </span>
                    <span className="flex items-center gap-1 text-foreground/40 text-xs shrink-0">
                      <Heart className="w-3 h-3" />
                      {t.likes.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <h2 className="font-bold text-base leading-snug">{t.titulo}</h2>
                  <p className="text-foreground/55 text-sm leading-relaxed flex-1">
                    {t.descripcion}
                  </p>
                </div>

                {/* Card footer */}
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-t border-border/50 px-5 py-3 flex items-center justify-between text-xs text-foreground/40 hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" />
                    Abrir en Instagram
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>

        {/* CTA por categoría */}
        {ctaActivo && (
          <div
            className={`mt-10 rounded-2xl border bg-gradient-to-br ${ctaActivo.accentClass} p-8 text-center`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50 mb-2">
              {ctaActivo.eyebrow}
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold italic mb-3">
              {ctaActivo.titulo}
            </h3>
            <p className="text-foreground/60 text-sm max-w-md mx-auto mb-6">
              {ctaActivo.descripcion}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {ctaActivo.cta1IsInternal ? (
                <Link
                  to={ctaActivo.cta1Href}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
                >
                  {ctaActivo.cta1Label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <a
                  href={ctaActivo.cta1Href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
                >
                  {ctaActivo.cta1Label}
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
              {ctaActivo.cta2Label && ctaActivo.cta2Href && (
                <a
                  href={ctaActivo.cta2Href}
                  target={ctaActivo.cta2Href.startsWith("http") ? "_blank" : undefined}
                  rel={ctaActivo.cta2Href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 border border-border text-foreground/70 font-semibold px-6 py-3 rounded-full hover:border-primary/40 hover:text-foreground transition-colors text-sm"
                >
                  {ctaActivo.cta2Label}
                </a>
              )}
            </div>
          </div>
        )}

        {/* CTA seguir en Instagram */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/roller_nm/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border text-foreground/60 font-semibold px-5 py-2.5 rounded-full hover:border-primary/40 hover:text-foreground transition-colors text-sm"
          >
            <Instagram className="w-4 h-4" />
            @roller_nm
          </a>
          <a
            href="https://www.instagram.com/flyfreeurban/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border text-foreground/60 font-semibold px-5 py-2.5 rounded-full hover:border-primary/40 hover:text-foreground transition-colors text-sm"
          >
            <Instagram className="w-4 h-4" />
            @flyfreeurban
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorialesPatinaje;
