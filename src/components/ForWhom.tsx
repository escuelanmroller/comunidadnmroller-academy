import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import patinadorescomunidad from "@/assets/patinadores-comunidad.png";

const points = [
  "Nunca patinaste y querés aprender desde cero",
  "Buscás una actividad social al aire libre",
  "Querés mejorar tu técnica y subir de nivel",
  "Te interesa una comunidad activa y motivadora",
  "Necesitás un deporte flexible, sin horarios rígidos",
];

const ForWhom = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`relative rounded-3xl overflow-hidden aspect-[4/3] ${
              isVisible ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <img
              src={patinadorescomunidad}
              alt="Grupo de patinadores disfrutando al aire libre"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className={isVisible ? "animate-fade-up-delay-2" : "opacity-0"}>
            <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">
              Para vos
            </p>
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground mb-8">
              ¿Es para mí?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Si te identificás con alguno de estos puntos, NM Roller es tu lugar:
            </p>

            <ul className="space-y-4 mb-10">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{point}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="bg-primary hover:bg-secondary text-primary-foreground font-bold px-8 rounded-full"
              onClick={() => document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" })}
            >
              Quiero Empezar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
