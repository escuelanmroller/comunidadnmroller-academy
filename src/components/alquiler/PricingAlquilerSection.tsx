import { useState } from "react";
import { Check, Gift, Star, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { guardarIntencionCompra } from "@/lib/intencionCompra";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AlquilerPlan {
  name: string;
  subtitle: string;
  efectivoPrice: string;
  transferenciaPrice: string;
  perClassEfectivo?: string;
  perClassTransferencia?: string;
  vigencia?: string;
  features: string[];
  bonus?: string;
  highlighted?: boolean;
  badge?: string;
  ctaLabel: string;
  planSlug: string;
}

const plans: AlquilerPlan[] = [
  {
    name: "Clase Única",
    subtitle: "Vigencia de un mes · Único pago",
    efectivoPrice: "$35.000",
    transferenciaPrice: "$39.000",
    features: [
      "1 Clase grupal",
      "Incluye rollers, casco y protecciones",
      "Ideal para probar sin compromiso",
      "Entrega y retiro del equipo en la sede, sin costo",
      "Abonás $10 mil por reprogramar",
    ],
    ctaLabel: "Reservar lugar",
    planSlug: "clase-unica",
  },
  {
    name: "Clase 2x1",
    subtitle: "Compartí la experiencia · Sede sujeto a disponibilidad (consultar)",
    efectivoPrice: "$35.000",
    transferenciaPrice: "$39.000",
    features: [
      "1 Clase grupal para vos + alguien más",
      "Incluye rollers, casco y protecciones",
      "Ideal para probar sin compromiso",
      "Entrega y retiro del equipo en la sede, sin costo",
      "Abonás $10 mil para reprogramar en otra sede a elección por persona",
    ],
    ctaLabel: "Reservar 2x1",
    planSlug: "clase-2x1",
  },
  {
    name: "Pack 4 Clases",
    subtitle: "El plan más elegido para arrancar en serio · Mensual",
    efectivoPrice: "$85.000",
    transferenciaPrice: "$95.000",
    perClassEfectivo: "$21.250/clase",
    perClassTransferencia: "$23.750/clase",
    features: [
      "Incluye rollers, casco y protecciones en cada clase",
      "Entrega y retiro del equipo sin cargo en cada clase",
      "Podés reprogramar hasta 2 veces tu clase sin costo extra",
      "Asesoría personalizada sobre equipo por patinadores",
      "Acceso prioritario a horarios y sedes con alquiler",
    ],
    bonus: "Usás el 50% de este pack como parte de pago para la compra de tu propio kit (hasta la 2da clase).",
    highlighted: true,
    badge: "Mejor Opción",
    ctaLabel: "Comprar pack",
    planSlug: "pack-4-clases",
  },
];

const PricingAlquilerSection = ({ onReserve }: { onReserve: () => void }) => {
  const { ref, isVisible } = useScrollAnimation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleComprar = async (plan: AlquilerPlan) => {
    guardarIntencionCompra({ plan: plan.planSlug, origen: "clases-alquiler" });
    setLoadingPlan(plan.planSlug);
    try {
      const { data, error } = await supabase.functions.invoke("crear-preferencia-pago", {
        body: { plan_slug: plan.planSlug, origen: "clases-alquiler" },
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
    <section id="planes-alquiler" className="py-24 bg-background text-foreground" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Packs disponibles</p>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight mb-4">
            Opciones para empezar sin excusas
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
            Clases + alquiler de equipo completo. Elegí el plan que mejor se adapta a vos.
          </p>
        </div>

        <div className="grid gap-6 max-w-6xl mx-auto md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground ring-2 ring-primary scale-[1.02]"
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

              {plan.bonus && (
                <div className={`flex items-start gap-2 mb-6 pb-6 border-b ${plan.highlighted ? "border-primary-foreground/20" : "border-primary-foreground/10"}`}>
                  <Gift className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                  <p className={`text-xs leading-snug ${plan.highlighted ? "text-primary-foreground/90" : "text-primary-foreground/70"}`}>
                    {plan.bonus}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {/* Pago Online (Transferencia) - compacto */}
                <div className="rounded-xl bg-primary-foreground/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground">Pago Online</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black text-primary-foreground">{plan.transferenciaPrice}</span>
                    {plan.perClassTransferencia && (
                      <span className="text-xs text-primary-foreground/60">
                        ({plan.perClassTransferencia})
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleComprar(plan)}
                    disabled={loadingPlan === plan.planSlug}
                    className="w-full font-bold rounded-full py-6 text-sm bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm mt-2"
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
                  <Button
                    onClick={onReserve}
                    className="w-full font-bold rounded-full py-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md mt-2"
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
    </section>
  );
};

export default PricingAlquilerSection;
