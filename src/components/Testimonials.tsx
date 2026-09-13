import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Camila R.",
    nivel: "Nivel intermedio · Palermo",
    text: "Llegué sin saber ni frenar. En 3 meses ya patino salidas urbanas todos los sábados. Los profes son patinadores de verdad, no instructores de manual.",
  },
  {
    name: "Martín G.",
    nivel: "Nivel principiante · Caballito",
    text: "Me compré rollers hace años y los tenía guardados. Me animé a venir y no lo puedo creer. En 4 clases ya rodaba solo en el parque.",
  },
  {
    name: "Valentina S.",
    nivel: "Nivel inicial · Belgrano",
    text: "Pensaba que era muy grande para aprender. Tengo 42 años y arrancé desde cero. Hoy voy a clases dos veces por semana y me siento otra persona.",
  },
];

const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="testimonios" className="py-24" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-3xl md:text-4xl font-black italic text-foreground mb-2">4.9/5</p>
          <p className="text-muted-foreground text-lg">
            Valoración promedio de más de <span className="font-bold text-foreground">3.000 alumnos</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-muted rounded-2xl p-8 flex flex-col ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed flex-1">"{t.text}"</p>
              <div>
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.nivel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
