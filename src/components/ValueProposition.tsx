import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Infinity, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { sedes } from "@/data/sedes";

const SEGURO_NOTE =
  "Para acceder a la cobertura del seguro, debés usar tus protecciones completas en cada clase: rodilleras, coderas, muñequeras y casco. Es un requisito básico de seguridad — y la forma en que nos aseguramos de cuidarte bien.";

const ValueProposition = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [seguroOpen, setSeguroOpen] = useState(false);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const baseCard = `bg-background rounded-2xl p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 ${
    isVisible ? "animate-fade-up" : "opacity-0"
  }`;
  const interactiveCard = `${baseCard} hover:shadow-lg hover:ring-1 hover:ring-primary/20 cursor-pointer text-left w-full`;

  return (
    <section id="propuesta" className="py-24 bg-muted" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">¿Por qué NM?</p>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground">
            Todo lo que necesitás para patinar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* 1. Clases Ilimitadas → scroll a #planes */}
          <button
            onClick={() => scrollTo("planes")}
            className={interactiveCard}
            style={{ animationDelay: "0s" }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Infinity className="w-7 h-7 text-primary" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">Clases Ilimitadas</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary border border-primary/40 px-1.5 py-0.5 rounded-full">
                Plan Black
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
              Entrená todas las veces que quieras con tu plan mensual, sin límites ni restricciones.
            </p>
            <p className="text-primary text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1">
              Ver planes <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          {/* 2. Sedes Outdoor → scroll a #sedes */}
          <button
            onClick={() => scrollTo("sedes")}
            className={interactiveCard}
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 text-center">+{sedes.length} Sedes Outdoor</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
              Elegí la sede que más te convenga. Tenemos puntos en toda la ciudad de Buenos Aires.
            </p>
            <p className="text-primary text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1">
              Ver mapa <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          {/* 3. Aprendizaje Progresivo → /ruta-de-aprendizaje */}
          <Link
            to="/ruta-de-aprendizaje"
            className={interactiveCard + " block"}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 text-center">Aprendizaje Progresivo</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
              Metodología diseñada para que avances a tu ritmo, desde cero hasta nivel avanzado.
            </p>
            <p className="text-primary text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1">
              Ver ruta de aprendizaje <ChevronRight className="w-3 h-3" />
            </p>
          </Link>

          {/* 4. Seguro Médico → expandable note */}
          <div
            className={`${baseCard} flex flex-col`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 text-center">Seguro Médico</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center flex-1">
              Patiná tranquilo. Todos nuestros planes incluyen cobertura médica durante las clases.
            </p>
            <button
              onClick={() => setSeguroOpen(!seguroOpen)}
              className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide text-foreground/50 hover:text-foreground transition-colors mx-auto"
            >
              ¿Cómo aplica?
              <ChevronDown className={`w-3 h-3 transition-transform ${seguroOpen ? "rotate-180" : ""}`} />
            </button>
            {seguroOpen && (
              <p className="text-foreground/60 text-xs leading-relaxed mt-3 border-t border-border pt-3 text-center">
                {SEGURO_NOTE}
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
