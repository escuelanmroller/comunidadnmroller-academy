import { Rocket, ArrowRight } from "lucide-react";

// Callout de upgrade que aparece cuando el usuario elige el perfil intermedio/avanzado
// en el filtro. Convierte el filtro en una guía: le marca la ruta para subir de nivel.
const UpgradeNivelCallout = ({ variant }: { variant: "sportclub" | "clase-gratis" }) => {
  const esSportclub = variant === "sportclub";

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="max-w-3xl mx-auto border border-primary/40 bg-primary/5 p-6 md:p-8">
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-10 h-10 bg-primary/15 text-primary shrink-0">
          <Rocket className="w-5 h-5" />
        </span>
        <div>
          <h3 className="font-display italic uppercase text-xl md:text-2xl font-black leading-tight">
            {esSportclub ? "Subí al siguiente nivel" : "Buscás avanzar más rápido"}
          </h3>
          <p className="text-foreground/75 text-sm md:text-base leading-relaxed mt-2">
            {esSportclub ? (
              <>
                Tu beneficio cubre <strong>nivel inicial y principiante</strong>. Para acceder a{" "}
                <strong>nivel intermedio, todas las disciplinas y hasta 2 clases por día</strong>,
                sumá el <strong className="text-primary">Plan Full</strong> abonando solo una
                diferencia sobre tu beneficio — no pagás como alguien que recién llega a NM Roller.
              </>
            ) : (
              <>
                La clase de prueba es de <strong>nivel inicial y principiante</strong>. Si ya tenés
                base y querés <strong>acelerar tu aprendizaje</strong>, sumar disciplinas (slalom,
                frenadas, urbano) o tomar <strong>más clases por semana</strong>, te armamos un{" "}
                <strong className="text-primary">plan a tu medida</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {esSportclub ? (
          <>
            <button
              onClick={() => scrollTo("planes")}
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-[0.14em] text-xs md:text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
            >
              Ver Plan Full
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("equipo")}
              className="group inline-flex items-center justify-center gap-2 border border-primary/50 text-foreground/80 px-6 py-3 font-bold uppercase tracking-[0.14em] text-xs md:text-sm transition-all hover:border-primary hover:text-foreground"
            >
              Comprar o alquilar equipo
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        ) : (
          <a
            href="/#planes"
            className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-[0.14em] text-xs md:text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
          >
            Quiero un plan a mi medida
            <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>

      {!esSportclub && (
        <p className="text-foreground/50 text-xs leading-relaxed mt-4">
          ¿Todavía no tenés tu equipo?{" "}
          <a
            href="/clases-de-rollers-mas-alquiler"
            className="font-bold text-foreground/70 underline underline-offset-2 hover:text-primary"
          >
            Mirá nuestras clases con alquiler incluido
          </a>
          .
        </p>
      )}
    </div>
  );
};

export default UpgradeNivelCallout;
