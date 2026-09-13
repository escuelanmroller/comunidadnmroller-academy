import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import { Button } from "@/components/ui/button";

interface NavState {
  sede?: string;
  fechaLabel?: string;
}

const ListaEsperaConfirmada = () => {
  const location = useLocation();
  const { sede, fechaLabel } = (location.state as NavState) ?? {};

  return (
    <>
      <Helmet>
        <title>¡Ya estás en la lista! · Masterclass NM Roller</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 flex justify-center bg-primary">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground pt-12 pb-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            {(sede || fechaLabel) && (
              <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-4">
                {[fechaLabel, sede].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic leading-tight mb-6">
              ¡Ya estás en la lista prioritaria para la próxima Masterclass!
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Tomaste la mejor decisión para empezar (o seguir) tu camino sobre ruedas.
              Ahora te toca esperar la fecha, pero no quedarte quieto/a.{" "}
              <strong>Mirá todo lo que podés hacer desde ya 👇</strong>
            </p>
          </div>

          {/* Wave */}
          <svg
            className="absolute bottom-0 left-0 w-full h-16 md:h-24 text-background"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C360,120 1080,-20 1440,60 L1440,100 L0,100 Z" fill="currentColor" />
          </svg>
        </section>

        {/* Bloques de acción */}
        <section className="py-16 px-6 bg-background">
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">

            {/* Bloque 1: Clase gratis */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="text-2xl">🛼</span>
              </div>
              <h2 className="text-xl font-black uppercase italic leading-tight mb-3">
                ¿Querés arrancar antes de la Masterclass?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                Tomá una clase gratuita en sedes seleccionadas. Te mostramos cómo anotarte
                con 3 simples pasos.
              </p>
              <Link to="/clase-gratis" className="w-full">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 font-bold group"
                >
                  Quiero probar una clase
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Bloque 2: Newsletter */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="text-2xl">💌</span>
              </div>
              <h2 className="text-xl font-black uppercase italic leading-tight mb-3">
                ¿Querés recibir tips, novedades y beneficios por mail?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                Suscribite a nuestra newsletter{" "}
                <strong className="text-foreground">"Desde cero"</strong> para recibir
                consejos y recomendaciones.
              </p>
              <Link to="/newsletter-desde-cero" className="w-full">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full font-bold group"
                >
                  Quiero sumarme a "Desde cero"
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer mínimo */}
        <footer className="mt-auto py-8 text-center bg-background border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-widest mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al sitio
          </Link>
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} Comunidad NM Roller
          </p>
        </footer>
      </main>
    </>
  );
};

export default ListaEsperaConfirmada;
