import { Button } from "@/components/ui/button";
import { DollarSign, CalendarCheck, CalendarDays, CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import turnosPhones from "@/assets/turnos-web-phones.png";
import turnosHand from "@/assets/turnos-web-hand.png";

const features = [
  {
    icon: DollarSign,
    title: "Compra tu plan en minutos",
    description: 'Comprá tu plan desde la pestaña "comprar créditos".',
  },
  {
    icon: CalendarCheck,
    title: "Reserva tus clases",
    description: 'Elegí tu sede y horario desde "Nueva reserva".',
  },
  {
    icon: CalendarDays,
    title: "Elegí tu horario ideal",
    description: "Estés donde estés vas a encontrar el lugar más cercano para entrenar.",
  },
  {
    icon: CheckCircle,
    title: "Accedé rápido y fácil",
    description: "Hacelo desde la App o entra a la versión web desde tu PC o celular.",
  },
];

const AppSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <>
      {/* Section 1: Red background - App promotion */}
      <section className="bg-primary py-20 overflow-hidden" ref={ref}>
        <div className="container mx-auto px-4">
          <div className={`flex flex-col lg:flex-row items-center gap-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Phone mockups */}
            <div className="lg:w-1/2 flex justify-center">
              <img
                src={turnosPhones}
                alt="App Turnos Web NM Roller"
                className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
              />
            </div>

            {/* Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                Al pedirte nombre de empresa poné <strong className="text-primary-foreground">NM ROLLER</strong>
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-primary-foreground italic uppercase leading-tight mb-8">
                Gestioná todo directamente en la APP Turnos Web
              </h2>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-10">
                {features.map((feat) => (
                  <div key={feat.title} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1.5 sm:gap-2">
                    <feat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" strokeWidth={1.5} />
                    <h3 className="text-xs sm:text-sm font-black italic uppercase tracking-wider text-primary-foreground leading-tight">
                      {feat.title}
                    </h3>
                    <p className="hidden sm:block text-xs text-primary-foreground/70 italic leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Store badges */}
              <div className="flex gap-4 justify-center lg:justify-start">
                <a
                  href="https://play.google.com/store/apps/details?id=com.turnosweb.lite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background text-foreground rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 3.458L16.8 9.79l-2.302 2.302L5.864 3.458z"/>
                  </svg>
                  <div className="text-left">
                    <span className="text-[8px] uppercase block leading-none">Get it on</span>
                    <span className="text-sm font-semibold leading-tight">Google Play</span>
                  </div>
                </a>
                <a
                  href="https://apps.apple.com/us/app/turnosweb-app/id1169566678?l=es&ls=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background text-foreground rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <span className="text-[8px] uppercase block leading-none">Download on the</span>
                    <span className="text-sm font-semibold leading-tight">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: White background - CTA to reserve */}
      <section className="bg-background py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-primary italic uppercase leading-tight mb-6">
                ¿Ya tenés la app y querés reservar?
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
                Si estás listo para reservar tu horario o comprar tu plan hacelo desde la aplicación. Y{" "}
                <strong className="text-foreground">podés hacerlo igual en la versión web</strong>{" "}
                siguiendo este botón. 👇
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-widest uppercase px-10 py-6 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              >
                <a href="https://nmroller.turnosweb.com" target="_blank" rel="noopener noreferrer">
                  RESERVAR
                </a>
              </Button>
            </div>

            {/* Phone in hand image */}
            <div className="lg:w-1/2 flex justify-center">
              <img
                src={turnosHand}
                alt="Reservá desde tu celular con NM Roller"
                className="w-full max-w-md lg:max-w-lg rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AppSection;
