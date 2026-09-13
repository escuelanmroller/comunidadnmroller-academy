import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

const handleClick = () => {
  window.scrollTo({ top: 0, behavior: "auto" });
};


const BannerAlquilerHome = () => {
  return (
    <section id="alquiler" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Link
          to="/clases-de-rollers-mas-alquiler"
          onClick={handleClick}
          className="group block bg-primary text-primary-foreground rounded-2xl p-6 md:p-10 shadow-lg hover:shadow-xl transition-all overflow-hidden relative"
        >

          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-primary-foreground/5 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <div className="bg-primary-foreground/15 rounded-2xl p-4 inline-flex shrink-0">
              <Package className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] opacity-80 mb-1">
                ¿No tenés equipo?
              </p>
              <h3 className="text-2xl md:text-3xl font-black italic tracking-tight leading-tight mb-1">
                Clases + alquiler de rollers
              </h3>
              <p className="text-sm md:text-base opacity-90 max-w-xl">
                Te damos rollers y protecciones. Vos solo traé las ganas.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-bold uppercase tracking-[0.15em] text-xs md:text-sm px-5 py-3 rounded-full self-start md:self-auto group-hover:gap-3 transition-all">
              Ver detalle
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default BannerAlquilerHome;
