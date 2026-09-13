import { Instagram } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import InstagramEmbed from "@/components/InstagramEmbed";

const REELS = [
  {
    url: "https://www.instagram.com/p/DZdmTedKT5u/",
    titulo: "Empezaron desde cero",
    bajada: "Hoy hacen trucos de slalom que parecían imposibles. Todos arrancaron sin saber patinar.",
  },
  {
    url: "https://www.instagram.com/p/DZGrmVOKqWH/",
    titulo: "Aprendé a frenar",
    bajada: "+22.000 reproducciones. El método con el que dejás de abrazar postes para frenar de verdad.",
  },
  {
    url: "https://www.instagram.com/p/DY0GPbQSEzL/",
    titulo: "Perdé el miedo, paso a paso",
    bajada: "Bajar un cordón da miedo… hasta que lo aprendés bien. Avanzás a tu ritmo, sin presión.",
  },
];

const VideoSocialProof = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-muted" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <a
            href="https://www.instagram.com/roller_nm/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-4 text-primary hover:opacity-80 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]">
              @roller_nm · +117 mil seguidores
            </span>
          </a>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground mb-3">
            La comunidad en acción
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No te lo contamos: te lo mostramos. Alumnos reales aprendiendo, animándose y superándose
            cada semana.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {REELS.map((reel, i) => (
            <div
              key={reel.url}
              className={`flex flex-col ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{reel.titulo}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-1">{reel.bajada}</p>
              </div>
              <InstagramEmbed url={reel.url} className="w-full" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/roller_nm/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold uppercase tracking-[0.12em] px-6 py-3"
          >
            <Instagram className="w-4 h-4" />
            Ver más en Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoSocialProof;
