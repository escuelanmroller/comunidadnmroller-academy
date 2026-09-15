import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, CreditCard, Banknote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { sedes } from "@/data/sedes";
import { guardarIntencionCompra } from "@/lib/intencionCompra";
import { calendlyUrl } from "@/lib/calendly";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Period = "mensual" | "trimestral";

interface Plan {
  name: string;
  subtitle: string;
  onlinePrice: string;
  efectivoPrice: string;
  perClassOnline?: string;
  perClassEfectivo?: string;
  vigencia?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  planSlug: string;
  ctaLink?: { label: string; href: string };
}

const monthlyPlans: Plan[] = [
  {
    name: "Clase Única",
    subtitle: "Ideal para quienes quieren descubrir si es lo suyo",
    onlinePrice: "$35.000",
    efectivoPrice: "$30.000",
    vigencia: "Vigencia 15 días",
    features: [
      "1 Clase grupal para cualquier sede y horario",
      "Podés reprogramar hasta 2 veces sin cargo",
      "Acceso a todos los niveles y disciplinas",
      "Uso de protecciones y casco obligatorio",
      "Bonificación del 100% si decidís migrar a un plan en plazo de 7 días",
    ],
    planSlug: "clase-unica",
    ctaLink: { label: "¿No tenés equipo? Comprá el tuyo", href: "https://www.flyfreeurban.com/protecciones/" },
  },
  {
    name: "Basic Fun",
    subtitle: "Ideal si querés progresar con ritmo y libertad",
    onlinePrice: "$69.000",
    efectivoPrice: "$55.000",
    perClassOnline: "$17.250/clase",
    perClassEfectivo: "$13.750/clase",
    features: [
      "Incluye 4 clases, una (1) por día en horario a elección",
      "Podés recuperar en caso de lluvia",
      "Seguro de pausar tu plan en caso de vacaciones o lesión",
      "Acceso a todos los niveles y disciplinas",
      "Acceso a experiencias como Salidas Urbanas y RaNMchadas",
    ],
    planSlug: "basic-fun",
  },
  {
    name: "Black Free",
    subtitle: "Para los que se enamoran del patinaje y quieren avanzar rápido",
    onlinePrice: "$79.000",
    efectivoPrice: "$65.000",
    highlighted: true,
    badge: "Mejor Opción",
    features: [
      "Clases ilimitadas. Hasta dos (2) por día de tu nivel",
      "Seguro de pausar tu plan en caso de vacaciones o lesión",
      "Acceso a todos los niveles y disciplinas",
      "Acceso prioritario a Masterclass y eventos GRATIS",
      "Acceso a experiencias como Salidas Urbanas y RaNMchadas",
    ],
    planSlug: "black-free",
  },
];

const quarterlyPlans: Plan[] = [
  {
    name: "Basic Fun",
    subtitle: "3 meses de progreso con ritmo y libertad",
    onlinePrice: "$186.300",
    efectivoPrice: "$148.500",
    perClassOnline: "$15.525/mes",
    perClassEfectivo: "$12.375/mes",
    features: [
      "4 clases por mes durante 3 meses",
      "Podés recuperar en caso de lluvia",
      "Seguro de pausar tu plan en caso de vacaciones o lesión",
      "Acceso a todos los niveles y disciplinas",
      "Acceso a experiencias como Salidas Urbanas y RaNMchadas",
    ],
    planSlug: "basic-fun-trimestral",
  },
  {
    name: "Black Free",
    subtitle: "3 meses sin límites para avanzar rápido",
    onlinePrice: "$213.300",
    efectivoPrice: "$175.500",
    highlighted: true,
    badge: "Mejor Opción",
    features: [
      "Clases ilimitadas durante 3 meses",
      "Seguro de pausar tu plan en caso de vacaciones o lesión",
      "Acceso a todos los niveles y disciplinas",
      "Acceso prioritario a Masterclass y eventos GRATIS",
      "Acceso a experiencias como Salidas Urbanas y RaNMchadas",
    ],
    planSlug: "black-trimestral",
  },
];

const PricingSection = () => {
  const [period, setPeriod] = useState<Period>("mensual");
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  const plans = period === "mensual" ? monthlyPlans : quarterlyPlans;

  const handleComprar = async (plan: Plan) => {
    guardarIntencionCompra({ plan: plan.planSlug, origen: "nm" });
    setLoadingPlan(plan.planSlug);
    try {
      const { data, error } = await supabase.functions.invoke("crear-preferencia-pago", {
        body: { plan_slug: plan.planSlug, origen: "nm" },
      });
      if (error || !data?.init_point) throw error ?? new Error("Sin init_point");
      window.location.href = data.init_point;
    } catch (err) {
      console.error("crear-preferencia-pago failed", err);
      toast({
        title: "No pudimos iniciar el pago",
        description: "Probá de nuevo en unos segundos o escribinos por WhatsApp.",
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  return (
    <section id="planes" className="py-24 bg-background text-foreground" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Planes</p>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight mb-4">
            Elegí tu plan ideal
          </h2>
          <p className="text-primary-foreground/60 text-lg mb-8">
            Todos los planes incluyen acceso a nuestras +{sedes.length} sedes
          </p>

          <div className="inline-flex bg-primary-foreground/10 rounded-full p-1">
            {(["mensual", "trimestral"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-primary-foreground/60 hover:text-primary-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-6 max-w-5xl mx-auto ${plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl"}`}>
          {plans.map((plan, i) => (
            <div
              key={`${period}-${plan.name}`}
              className={`relative rounded-2xl p-5 md:p-8 flex flex-col transition-all duration-500 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground ring-2 ring-primary md:scale-[1.02]"
                  : "bg-primary-foreground/5 border border-primary-foreground/10"
              } ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background font-bold px-4 py-1">
                  <Star className="w-3 h-3 mr-1" /> {plan.badge}
                </Badge>
              )}

              <h3 className="text-xl font-bold italic mb-1">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/70" : "text-primary-foreground/50"}`}>
                {plan.subtitle}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.ctaLink && (
                <a
                  href={plan.ctaLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block text-xs font-bold underline underline-offset-2 mb-6 -mt-4 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`}
                >
                  {plan.ctaLink.label} →
                </a>
              )}

              <div className="space-y-3 border-t border-primary-foreground/10 pt-6">
                {/* Pago Online - compacto */}
                <div className="rounded-xl bg-primary-foreground/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground">Pago Online</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black text-primary-foreground">{plan.onlinePrice}</span>
                    {plan.perClassOnline && (
                      <span className="text-xs text-primary-foreground/60">
                        ({plan.perClassOnline})
                      </span>
                    )}
                  </div>
                  {plan.vigencia && (
                    <p className="text-xs mb-2 text-primary-foreground/60">
                      {plan.vigencia}
                    </p>
                  )}
                  <Button
                    onClick={() => handleComprar(plan)}
                    disabled={loadingPlan === plan.planSlug}
                    className="w-full font-bold rounded-full py-6 text-sm bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm"
                  >
                    {loadingPlan === plan.planSlug ? "Redirigiendo…" : "COMPRAR PLAN"}
                  </Button>
                  <p className="text-[10px] text-center mt-2 text-primary-foreground/50">
                    Serás redirigido a Mercado Pago
                  </p>
                </div>

                {/* Pago en Efectivo - destacado */}
                <div className="rounded-xl bg-foreground p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Pago en Efectivo</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black text-background">{plan.efectivoPrice}</span>
                    {plan.perClassEfectivo && (
                      <span className="text-xs text-muted-foreground">
                        ({plan.perClassEfectivo})
                      </span>
                    )}
                  </div>
                  {plan.vigencia && (
                    <p className="text-xs mb-2 text-muted-foreground">
                      {plan.vigencia}
                    </p>
                  )}
                  <Button
                    onClick={() => setCalendlyOpen(true)}
                    className="w-full font-bold rounded-full py-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  >
                    AGENDAR TURNO
                  </Button>
                  <p className="text-[10px] text-center mt-2 text-muted-foreground">
                    Turno para pago presencial en nuestra oficina
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={calendlyOpen} onOpenChange={setCalendlyOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[98vh] sm:max-h-[95vh] p-0 overflow-hidden border-0 bg-background rounded-2xl gap-0">
          <DialogTitle className="sr-only">Agendá tu turno para pago presencial</DialogTitle>
          <div className="flex flex-col items-center pt-4 pb-3 px-4 sm:pt-6 sm:pb-4 sm:px-6 text-center">
            <img src={logoNM} alt="NM Roller" className="h-12 sm:h-16 mb-2 sm:mb-3" />
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-primary mb-2 leading-tight">
              Agendá tu turno para pago presencial
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md space-y-1.5">
              <p>📍 Te esperamos en la oficina, a dos cuadras del Rosedal.</p>
              <p>⚠️ <strong className="text-foreground">Importante:</strong> completá todos los pasos del calendario.</p>
              <p>✅ Tu turno queda reservado únicamente cuando veas el mensaje: <em className="text-foreground">"Tu cita fue programada"</em></p>
            </div>
          </div>
          <iframe
            src={calendlyUrl('planes-home')}
            className="w-full h-[60vh] sm:h-[55vh] border-0"
            title="Agendá tu turno para pago presencial - Calendly"
          />
          <div className="bg-primary px-4 py-2 sm:py-3 text-center">
            <p className="text-primary-foreground text-xs sm:text-sm">
              <strong className="font-bold">¿Ya reservaste?</strong>
              <br />
              Podés avisarnos por{" "}
              <a
                href={`https://wa.me/5491165920600?text=${encodeURIComponent("[LP-NM-PP-Cdly] Ya agendé mi turno vía calendly, solo quiero confirmar que lo hayan recibido. Mi nombre es XXX")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold italic underline text-primary-foreground hover:opacity-80"
              >
                WhatsApp
              </a>{" "}
              para verificar que recibimos tu turno.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PricingSection;
