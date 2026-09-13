import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Gift, Mail, Map, BookOpen, Medal } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import patinadores from "@/assets/patinadores-comunidad.png";

const beneficios = [
  { Icon: Mail, text: <>Tu primer mail llegará en los <strong>próximos minutos</strong>.</> },
  { Icon: Map, text: <>Acceso exclusivo al <strong>Mapa de Aprendizaje</strong>.</> },
  { Icon: BookOpen, text: <><strong>Bitácora</strong> para registrar tus avances <em>(próximo envío)</em>.</> },
  { Icon: Medal, text: <><strong>Desafíos</strong> que te impulsan paso a paso.</> },
];

const RegistroConfirmadoNewsletter = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const fromRuta = searchParams.get("from") === "ruta";
  return (
    <>
      <Helmet>
        <title>¡Ya estás en el camino! — Comunidad NM Roller</title>
        <meta name="description" content="Confirmación de tu suscripción a la Newsletter Desde Cero de NM Roller. Empezá a recibir tips, motivación y desafíos." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://comunidadnmroller.lovable.app/registro-confirmado-newsletter" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 flex justify-center bg-primary">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        {/* Hero rojo */}
        <section className="relative bg-primary text-primary-foreground pt-8 pb-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display italic uppercase leading-[0.95] text-2xl sm:text-3xl md:text-4xl font-black mb-8">
              ¡Ya estás en el camino!
            </h1>
            {fromRuta ? (
              <>
                <p className="font-bold text-lg md:text-xl mb-4">
                  La guía completa + Bitácora están en preparación.
                </p>
                <p className="text-base md:text-lg leading-relaxed mb-6 text-primary-foreground/95">
                  En cuanto esté lista, sos el primero en recibirla —{" "}
                  <strong>sin costo, directamente en tu mail</strong>. Mientras tanto, vas a recibir
                  contenido que te acompaña y te motiva en el camino.
                </p>
                <p className="font-bold text-base md:text-lg">
                  Tu ruta empieza ahora.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-lg md:text-xl mb-4">
                  Acabás de dar tu primer paso de compromiso.
                </p>
                <p className="text-base md:text-lg leading-relaxed mb-6 text-primary-foreground/95">
                  A partir de ahora vas a recibir correos que te acompañan, motivan y te muestran que{" "}
                  <strong>sí podés</strong>.
                </p>
                <p className="font-bold text-base md:text-lg">
                  Te esperamos. Desde cero. Con vos.
                </p>
              </>
            )}
          </div>

          {/* Wave inferior */}
          <svg
            className="absolute bottom-0 left-0 w-full h-16 md:h-24 text-background"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C360,120 1080,-20 1440,60 L1440,100 L0,100 Z" fill="currentColor" />
          </svg>
        </section>

        {/* ¿Qué vas a recibir? */}
        <section className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display italic uppercase text-2xl md:text-4xl font-black text-primary mb-10 flex items-center justify-center gap-3">
              <Gift className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              ¿Qué vas a recibir ahora mismo?
            </h2>

            <ul className="space-y-5 text-left md:text-center mb-12">
              {beneficios.map(({ Icon, text }, i) => (
                <li
                  key={i}
                  className="flex items-start md:items-center gap-3 md:justify-center text-base md:text-lg text-foreground/90"
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-1 md:mt-0" strokeWidth={2.5} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setVideoOpen(true)}
              className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.1em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
            >
              Ruta de aprendizaje
            </Button>
          </div>
        </section>

        {/* ¿Querés adelantar? */}
        <section className="bg-muted py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black text-primary leading-[0.95] mb-6">
                ¿Querés adelantar<br />tu primer paso real?
              </h2>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl">
                Vení a una <strong>clase gratuita</strong> antes de que llegue tu primer desafío.
                No necesitás experiencia. Te alquilamos el equipo.{" "}
                <strong>Te acompañamos de cero.</strong>
              </p>
              <Button
                asChild
                className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.1em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
              >
                <Link to="/clases-de-rollers-mas-alquiler">Probar una clase</Link>
              </Button>
            </div>

            <div className="relative">
              <img
                src={patinadores}
                alt="Grupo de personas patinando en comunidad"
                className="w-full h-auto object-cover shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center bg-background border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-[0.18em] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} Comunidad NM Roller
          </p>
        </footer>
      </main>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-primary rounded-none overflow-hidden">
          <DialogTitle className="sr-only">Ruta de Aprendizaje NM Roller</DialogTitle>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {videoOpen && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/RZd_UWVEx74?autoplay=1&rel=0"
                title="Ruta de Aprendizaje NM Roller"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegistroConfirmadoNewsletter;
