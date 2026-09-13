import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { Button } from "@/components/ui/button";

const ATAJOS = [
  { emoji: "📍", label: "Sedes y horarios", to: "/#horarios" },
  { emoji: "🛼", label: "Clase gratis", to: "/clase-gratis" },
  { emoji: "💳", label: "Planes", to: "/#planes" },
  { emoji: "❓", label: "Preguntas frecuentes", to: "/preguntas-frecuentes" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Página no encontrada · NM Roller</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="pt-8 pb-4 flex justify-center">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-12" />
          </Link>
        </header>

        <section className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center max-w-md">
            <p className="font-display italic text-6xl md:text-7xl font-black text-primary mb-4">
              404
            </p>
            <h1 className="font-display italic uppercase text-2xl md:text-3xl font-black leading-tight mb-3">
              Esta página se cayó de la pista
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              El enlace que seguiste no existe o cambió de lugar. Volvé al inicio o probá
              alguno de estos atajos.
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 font-bold group mb-10">
                Volver al inicio
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-3 text-left">
              {ATAJOS.map(({ emoji, label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 text-sm font-semibold hover:border-primary/50 transition-colors"
                >
                  <span className="text-lg">{emoji}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;
