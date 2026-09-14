import { useState } from "react";
import { Check, Sparkles, ClipboardList } from "lucide-react";
import ComprarPlanDialog from "@/components/sportclub/ComprarPlanDialog";

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const WHATSAPP = "5491165920600";
const wa = (txt: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;

interface UserData {
  name?: string;
  dni?: string;
}

// Arma el WhatsApp de "Comprar plan" ya pre-llenado con nombre + DNI del form.
// Sin datos (visita directa) usa placeholders.
const buildPlanWa = (waPlan: string | undefined, user?: UserData) => {
  const nombre = user?.name?.trim() || "[tu nombre]";
  const dni = user?.dni?.trim() || "[tu DNI]";
  return wa(
    `[LP|PC|SS] ¡Hola! Soy ${nombre}. Mis datos registrados en turnos web son DNI ${dni}. ` +
      `Quiero el plan ${waPlan ?? ""} de Socio SportClub.`,
  );
};

interface Plan {
  tag: string;
  nombre: string;
  sub?: string;
  ideal?: React.ReactNode;
  precioTachado?: string;
  precio: string;
  periodo?: string;
  destacado?: boolean;
  actual?: boolean;
  /** El pack ya incluye el equipo — el modal de compra pide confirmar con un
   *  checkbox en vez de preguntar si necesita alquiler. */
  esPackAlquiler?: boolean;
  features: string[];
  /** Frase del plan para el WhatsApp de compra (ej: "de acceso full"). */
  waPlan?: string;
  cta?: { label: string; href: string };
}

const PLANES: Plan[] = [
  {
    tag: "Beneficio actual",
    nombre: "Exclusivo Socio SportClub",
    sub: "Requerís una membresía activa",
    ideal: "Ideal si recién empezás y todavía no tenés ningún conocimiento.",
    precio: "Gratis",
    actual: true,
    features: [
      "Clases ilimitadas",
      "1 clase por día",
      "Acceso a 11 sedes outdoor",
      "Nivel inicial y principiante",
    ],
  },
  {
    tag: "Plan Full",
    nombre: "Plan Full Socio SportClub",
    ideal: "Ideal si querés acelerar tu aprendizaje, acceder a nivel intermedio y disciplinas, y tomar hasta 2 clases por día.",
    precioTachado: "$79.000",
    precio: "45 mil",
    periodo: "Mensual",
    destacado: true,
    features: [
      "Clases ilimitadas",
      "Hasta 2 clases por día",
      "Sin cupo por turno",
      "Todos los niveles y disciplinas",
    ],
    waPlan: "de acceso full",
  },
  {
    tag: "Alquiler + Clases",
    nombre: "4 Clases + Alquiler",
    sub: "$13.750 por clase",
    ideal: (
      <>
        Ideal si todavía no estás seguro/a de si te va a gustar: probás 4 clases con el
        equipo incluido. Solo abonás el alquiler —{" "}
        <strong className="text-primary-foreground">las clases son gratis</strong>.
      </>
    ),
    precioTachado: "$95.000",
    precio: "50 mil",
    periodo: "Mensual",
    esPackAlquiler: true,
    features: [
      "4 clases por mes",
      "Patines, protecciones y casco",
      "Acceso a 8 sedes outdoor",
      "Nivel inicial y principiante",
    ],
    waPlan: "de Alquiler + Clases (4 clases)",
  },
];

interface PlanesSportclubProps {
  /** "landing": los planes pagos llevan al formulario de alta + leyenda.
   *  "confirmacion": solo planes pagos, copy persuasivo, CTA directo a comprar. */
  variant?: "landing" | "confirmacion";
  /** Datos del form (confirmación) para pre-llenar el WhatsApp de "Comprar plan". */
  userData?: UserData;
  /** Filtra la oferta solo en confirmación según la respuesta de equipo. */
  alquiler?: string;
}

const PlanesSportclub = ({ variant = "landing", userData, alquiler }: PlanesSportclubProps) => {
  const esConfirmacion = variant === "confirmacion";
  const planes = esConfirmacion
    ? PLANES.filter((p) => {
        if (p.actual) return false;
        if (alquiler === "si") return p.esPackAlquiler;
        if (alquiler === "no") return !p.esPackAlquiler;
        return true;
      })
    : PLANES;
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);

  return (
    <section id="planes" className="px-6 lg:px-16 py-16 md:py-20 bg-background border-t border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-4">
          {esConfirmacion ? (
            <>
              <div className="inline-flex items-center gap-2 bg-[#F5B800] text-[#111] px-4 py-1.5 mb-5 text-[11px] md:text-xs font-black uppercase tracking-[0.18em]">
                Opciones para vos
              </div>
              <h2 className="font-display italic uppercase text-2xl md:text-3xl font-black leading-tight mb-4">
                {alquiler === "si" ? "Probá con el equipo incluido" : "Más disciplinas y horarios"}
              </h2>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                {alquiler === "si" ? (
                  <>Con <strong>4 Clases + Alquiler</strong> tenés patines, casco y protecciones para empezar. Coordiná la sede y el turno con alquiler antes de reservar.</>
                ) : (
                  <>Con <strong>Plan Full</strong> sumás horarios, disciplinas y hasta 2 clases por día, sin el cupo por turno del beneficio gratuito. Para disciplinas técnicas necesitás el nivel de base.
                    {alquiler !== "no" && <> Si necesitás equipo, también podés elegir <strong>4 Clases + Alquiler</strong>.</>}
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 mb-5 text-[11px] md:text-xs font-black uppercase tracking-[0.18em]">
                Abonás extra
              </div>
              <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black leading-[0.95] mb-4">
                ¿Querés más disciplinas, horarios y clases por día?
              </h2>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                Tu beneficio gratuito ya cubre <strong>las 11 sedes</strong>,{" "}
                <strong>nivel inicial y principiante</strong>, 1 clase por día con el cupo de tu
                turno. Estos planes suman <strong>otras disciplinas</strong>,{" "}
                <strong>más horarios</strong> y <strong>hasta 2 clases por día</strong>, sin ese
                cupo. Para disciplinas técnicas como Skatepark seguís necesitando el nivel de
                base — es un requisito lógico, no del plan. Y si no tenés equipo, el pack 4
                clases + alquiler te deja probar con todo incluido.
              </p>
            </>
          )}
        </div>

        {/* Tarjetas */}
        <div
          className={`grid gap-5 mt-12 items-stretch ${
            esConfirmacion ? (planes.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-2 max-w-3xl mx-auto") : "md:grid-cols-3"
          }`}
        >
          {planes.map((p) => {
            const paid = !p.actual;
            return (
              <div
                key={p.nombre}
                className={`relative flex flex-col p-7 border ${
                  p.destacado
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)] md:-translate-y-2"
                    : p.actual
                      ? "bg-card border-border"
                      : "bg-primary/95 text-primary-foreground border-primary/70"
                }`}
              >
                {p.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5B800] text-[#111] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1">
                    Más elegido
                  </div>
                )}

                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
                    paid ? "text-primary-foreground/80" : "text-primary"
                  }`}
                >
                  {p.tag}
                </div>

                <h3 className="font-display italic uppercase font-black text-xl leading-tight mb-1">
                  {p.nombre}
                </h3>
                {p.sub && (
                  <p
                    className={`text-xs mb-4 ${
                      paid ? "text-primary-foreground/70" : "text-foreground/55"
                    }`}
                  >
                    {p.sub}
                  </p>
                )}

                {/* Precio */}
                <div className="mt-2 mb-6">
                  {p.precioTachado && (
                    <span className="block text-sm line-through text-[#F5B800] font-bold mb-1">
                      {p.precioTachado}
                    </span>
                  )}
                  <span
                    className={`font-display italic font-black leading-none ${
                      p.actual ? "text-primary text-5xl" : "text-primary-foreground text-5xl md:text-6xl"
                    }`}
                  >
                    {p.precio}
                  </span>
                  {p.periodo && (
                    <span className="block text-sm font-semibold mt-1 opacity-90">{p.periodo}</span>
                  )}
                </div>

                {/* Leyenda: para qué perfil es ideal */}
                {p.ideal && (
                  <div
                    className={`mb-6 text-xs leading-relaxed border-l-2 pl-3 ${
                      paid
                        ? "border-primary-foreground/40 text-primary-foreground/90"
                        : "border-primary/50 text-foreground/70"
                    }`}
                  >
                    {p.ideal}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${paid ? "text-primary-foreground" : "text-primary"}`}
                        strokeWidth={3}
                      />
                      <span className={paid ? "text-primary-foreground/95" : "text-foreground/80"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {p.actual ? (
                  <button
                    onClick={() => scrollTo("form")}
                    className="mt-auto inline-flex items-center justify-center gap-2 min-h-[3rem] px-6 py-3 border border-primary/40 text-primary font-bold uppercase tracking-[0.16em] text-sm text-center leading-tight cursor-pointer transition-colors hover:bg-primary/5"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" /> Quiero darme de alta
                  </button>
                ) : esConfirmacion ? (
                  <a
                    href={buildPlanWa(p.waPlan, userData)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center min-h-[3rem] px-6 py-3 bg-primary-foreground text-primary font-bold uppercase tracking-[0.16em] text-sm text-center leading-tight transition-all hover:opacity-90"
                  >
                    Comprar plan
                  </a>
                ) : (
                  <button
                    onClick={() => setModalPlan(p)}
                    className="mt-auto inline-flex items-center justify-center min-h-[3rem] px-6 py-3 bg-primary-foreground text-primary font-bold uppercase tracking-[0.14em] text-xs md:text-sm text-center leading-tight transition-all hover:opacity-90"
                  >
                    Quiero darme de alta y comprar el plan
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda del flujo de alta (solo landing) */}
        {!esConfirmacion && (
          <div className="mt-10 max-w-3xl mx-auto border border-primary/30 bg-primary/5 p-5 flex items-start gap-3">
            <ClipboardList className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              <strong className="text-foreground">¿Cómo comprás un plan?</strong> Para el{" "}
              <strong>beneficio gratis</strong>, completá el formulario de alta de arriba.
              Para <strong>Plan Full</strong> o <strong>4 Clases + Alquiler</strong>, tocá el
              botón de la tarjeta correspondiente y completá el formulario corto que se abre —
              te contactamos por WhatsApp para coordinar el pago.
            </p>
          </div>
        )}

        <p className="text-center text-foreground/45 text-xs mt-8 max-w-2xl mx-auto">
          Tarifas de referencia (Dic 2025). El alquiler requiere solicitarse con 24 hs de
          anticipación a la sede elegida. Consultá tarifas por más o menos clases por WhatsApp.
        </p>
      </div>

      {modalPlan && (
        // key por plan: si se pasa de un plan a otro sin pasar por el estado
        // cerrado (ej. click directo a otra tarjeta), fuerza un remount limpio
        // en vez de arrastrar los datos ya tipeados del plan anterior.
        <ComprarPlanDialog
          key={modalPlan.nombre}
          open={!!modalPlan}
          onOpenChange={(o) => !o && setModalPlan(null)}
          planNombre={modalPlan.nombre}
          esPackAlquiler={modalPlan.esPackAlquiler}
        />
      )}
    </section>
  );
};

export default PlanesSportclub;
