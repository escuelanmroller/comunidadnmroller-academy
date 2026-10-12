import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import EcosistemaNM from "@/components/academy/EcosistemaNM";
import logo from "@/assets/Logo-NM-Rollers.png";

const PROGRAMAS = [
  {
    nombre: "STARTER",
    duracion: "3 meses",
    descripcion: "Formación técnica completa para comenzar a enseñar.",
    features: ["Curso pregrabado completo", "Acceso 3 meses", "Comunidad general", "Plantillas + recursos"],
    cta: "Elegir Starter",
    destacado: false,
  },
  {
    nombre: "VIP",
    duracion: "6 meses",
    descripcion: "Acompañamiento estructurado + mentoría individual.",
    features: [
      "Todo de STARTER",
      "6 mentorías 1:1",
      "Grupo VIP exclusivo",
      "Consultas por WhatsApp (3 meses)",
      "Grabaciones de clases",
    ],
    cta: "Elegir VIP",
    destacado: true,
  },
  {
    nombre: "ELITE",
    duracion: "6 meses",
    descripcion: "Transformación completa: técnica + negocio.",
    features: ["Todo de VIP", "Masterclass mensual", "Mentoría de Nico incluida", "Plantillas de negocio", "1 año de acceso"],
    cta: "Elegir Elite",
    destacado: false,
  },
];

const INCLUYE = [
  ["Curso pregrabado completo", "Todo el contenido de patinaje + metodología de enseñanza."],
  ["Clases en vivo (VIP+)", "Sesiones quincenales sobre temas específicos con Nico."],
  ["Mentoría individual (VIP+)", "6 encuentros 1:1 focalizados en tu caso y progreso."],
  ["Comunidad exclusiva", "Grupo VIP para compartir experiencias y aprender juntos."],
  ["Plantillas profesionales", "Guiones de clase, estructura de sesión, horarios."],
  ["Masterclass mensuales (ELITE)", "Temas avanzados: retención, precios, liderazgo."],
];

const STATS = [
  ["87+", "Candidatos inscritos"],
  ["6", "Meses de acompañamiento"],
  ["17+", "Años de experiencia"],
  ["20+", "Países representados"],
];

const WHATSAPP =
  "https://wa.me/5491165920600?text=" +
  encodeURIComponent("[ACADEMY-LANDING] Hola Nico, me interesa NM Academy");

export default function Academy() {
  const navigate = useNavigate();
  const inscribirse = () => navigate("/academy/inscribirse");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-12 text-center sm:pt-16">
        <img src={logo} alt="NM Roller" className="mx-auto mb-5 h-16 w-16 rounded-full object-contain" />
        <span className="mb-5 inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
          Formación profesional de instructores
        </span>
        <h1 className="mb-4 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
          Convertite en <span className="text-primary">Instructor de Patinaje</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Programa completo de formación técnica para enseñar patinaje con metodología NM Roller. Aprendé a patinar,
          enseñá con confianza.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#programas"
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-border px-8 text-sm font-extrabold uppercase tracking-widest hover:bg-card sm:w-auto"
          >
            Ver programas
          </a>
          <button
            onClick={inscribirse}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            Inscribirme <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(([valor, texto]) => (
            <div key={texto} className="rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-2xl font-extrabold text-primary sm:text-3xl">{valor}</p>
              <p className="mt-1 text-xs text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-6 text-center text-xl font-extrabold sm:text-2xl">¿Qué incluye la formación?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUYE.map(([titulo, texto]) => (
            <div key={titulo} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold">{titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="programas" className="mx-auto max-w-5xl px-4 pb-14 pt-4">
        <h2 className="mb-8 text-center text-xl font-extrabold sm:text-2xl">Elegí tu programa</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROGRAMAS.map((p) => (
            <div
              key={p.nombre}
              className={`relative flex min-w-0 flex-col rounded-3xl border bg-card p-6 ${
                p.destacado ? "border-primary" : "border-border"
              }`}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
                  Más popular
                </span>
              )}
              <h3 className="text-xl font-extrabold tracking-wide">{p.nombre}</h3>
              <span className="mt-2 self-start rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                {p.duracion}
              </span>
              <p className="mt-4 text-sm text-muted-foreground">{p.descripcion}</p>
              <ul className="mb-6 mt-5 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={inscribirse}
                className="h-12 w-full rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14">
        <EcosistemaNM excluirIds={["instructor"]} />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <div className="rounded-3xl border border-border bg-card p-8">
          <h2 className="mb-2 text-xl font-extrabold sm:text-2xl">¿Dudas sobre el programa?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Escribile a Nico por WhatsApp para consultar qué programa se adapta mejor a tu caso.
          </p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-white hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
