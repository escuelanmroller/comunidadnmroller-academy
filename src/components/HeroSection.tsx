import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Zap, ShieldCheck } from "lucide-react";
import { sedes } from "@/data/sedes";

const stats: {
  icon: React.ElementType;
  label: string;
  value: string;
  scrollTo?: string;
}[] = [
  {
    icon: MapPin,
    label: "Sedes activas",
    value: `+${sedes.length}`,
    scrollTo: "sedes",
  },
  {
    icon: Calendar,
    label: "Clases semanales",
    value: "40+",
    scrollTo: "horarios",
  },
  {
    icon: Zap,
    label: "Cancelá cuando querás",
    value: "Sin contrato",
  },
  {
    icon: ShieldCheck,
    label: "Seguro médico",
    value: "Incluido",
  },
];

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-16">
      {/* Subtle decorative blurs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/[0.06] rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-primary/[0.04] rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/[0.03] rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — Text */}
          <div className="flex flex-col min-w-0">
            {/* Badge */}
            <div className="self-start animate-fade-up mb-5 sm:mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Escuela #1 de Patinaje en Argentina
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05] mb-4 sm:mb-6 animate-fade-up-delay-1">
              Aprendé a patinar{" "}
              <span className="text-primary">desde cero</span>, sin equipo ni
              experiencia
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8 sm:mb-10 leading-relaxed animate-fade-up-delay-2">
              Con profes que te guían y acompañan, y compañeros que te apoyan. Te
              alquilamos el equipo, sin contratos, y te sumás a una comunidad que ya
              patea las calles de Buenos Aires. 🛼
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 animate-fade-up-delay-3 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto whitespace-normal bg-primary hover:bg-primary/90 text-primary-foreground font-semibold sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 group"
                onClick={() =>
                  document
                    .getElementById("planes")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Reservá tu primera clase
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto whitespace-normal border-foreground/30 bg-foreground/5 text-foreground hover:bg-foreground/10 hover:border-foreground/50 font-semibold text-base px-8 py-5 sm:py-6 rounded-full transition-all duration-200"
                onClick={() => navigate("/clases-de-rollers-mas-alquiler")}
              >
                Clases + Alquiler
              </Button>
            </div>

            {/* Social proof numbers */}
            <div className="mt-10 hidden sm:flex items-center gap-6 animate-fade-up-delay-3 flex-wrap">
              {[
                { eyebrow: "★ en el último año", value: "+3.000", label: "alumnos han superado el desafío" },
                { value: "+400", label: "activos por mes" },
                { value: "+200", label: "salidas urbanas" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  {"eyebrow" in s && <span className="text-[9px] uppercase tracking-[0.15em] text-primary font-bold mb-0.5">{s.eyebrow}</span>}
                  <span className="text-xl font-black text-foreground leading-tight">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Stats cards */}
          <div className="relative animate-fade-up-delay-2">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => {
                const inner = (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <p className="text-xl sm:text-3xl font-black text-foreground mb-1 tracking-tight leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-snug">
                      {stat.label}
                    </p>
                  </>
                );

                const baseClass = `group bg-card border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${
                  i === 1 ? "lg:translate-y-6" : ""
                } ${i === 2 ? "lg:-translate-y-2" : ""}`;

                if (stat.scrollTo) {
                  return (
                    <button
                      key={stat.label}
                      onClick={() => scrollTo(stat.scrollTo!)}
                      className={`${baseClass} border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 text-left cursor-pointer`}
                    >
                      {inner}
                    </button>
                  );
                }

                return (
                  <div key={stat.label} className={`${baseClass} border-border hover:shadow-md`}>
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* Floating accent card */}
            <div className="hidden lg:block absolute -bottom-4 -left-6 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-lg shadow-primary/25 animate-fade-up-delay-3">
              <p className="text-sm font-bold">🛼 ¡Clases todos los días!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
