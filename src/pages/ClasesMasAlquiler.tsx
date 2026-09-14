import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { calendlyUrl } from "@/lib/calendly";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  HardHat,
  Hand,
  CalendarCheck,
  MapPin,
  Sparkles,
  Check,
  Footprints,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlquilerSedesGrid from "@/components/alquiler/AlquilerSedesGrid";
import AlquilerHorariosGrid from "@/components/alquiler/AlquilerHorariosGrid";
import PricingAlquilerSection from "@/components/alquiler/PricingAlquilerSection";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import logoNM from "@/assets/Logo-NM-Rollers.png";

const incluye = [
  { icon: Footprints, title: "Rollers", desc: "Bota rígida que cuida y sostiene tus pies." },
  { icon: HardHat, title: "Casco", desc: "Uso obligatorio en todas las clases." },
  { icon: Hand, title: "Muñequeras", desc: "Protección clave para tus primeras caídas." },
  { icon: ShieldCheck, title: "Rodilleras + Coderas", desc: "Set completo de protecciones." },
];

const pasos = [
  {
    n: "01",
    title: "Reservás tu lugar",
    desc: "Elegís sede y horario y avisás que necesitás equipo. Reservá con 24hs de anticipación.",
  },
  {
    n: "02",
    title: "Venís sin nada",
    desc: "Llegás 15 minutos antes. Te entregamos rollers y todas las protecciones listas para usar.",
  },
  {
    n: "03",
    title: "Patinás con un profe",
    desc: "Clase grupal con acompañamiento real, desde primer paso hasta soltarte por tu cuenta.",
  },
];

const faq = [
  {
    q: "¿Qué incluye exactamente el alquiler?",
    a: "Patines en línea de tu talle más set completo de protecciones: casco, muñequeras, rodilleras y coderas. Todo listo cuando llegás a la sede.",
  },
  {
    q: "¿Hay rollers de mi talle?",
    a: "Tenemos un rango amplio de talles para adultos y adolescentes. Al reservar te pedimos tu talle para asegurar disponibilidad.",
  },
  {
    q: "¿Cómo reservo el equipo?",
    a: "Indicá al momento de inscribirte que necesitás alquiler. Es importante avisar con al menos 24hs de anticipación para garantizar tu equipo.",
  },
  {
    q: "¿Puedo cambiar o cancelar mi reserva?",
    a: "Sí. Podés reprogramar avisando con 24hs de anticipación. En caso de lluvia, se reprograma automáticamente.",
  },
  {
    q: "¿Es higiénico?",
    a: "Sí. Limpiamos y desinfectamos rollers, casco y protecciones después de cada uso. Si querés podés traer tus propias medias largas.",
  },
  {
    q: "¿Necesito experiencia previa?",
    a: "Para nada. Estas clases están pensadas justamente para quienes empiezan desde cero. Tu profe te va a guiar paso a paso.",
  },
];

const ClasesMasAlquiler = () => {
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Clases de rollers + alquiler de equipo | NM Roller</title>
        <meta
          name="description"
          content="Tomá clases de rollers en Buenos Aires sin necesidad de tener equipo. Te alquilamos patines, casco y todas las protecciones. Sedes y horarios disponibles."
        />
        <link
          rel="canonical"
          href="https://comunidadnmroller.lovable.app/clases-de-rollers-mas-alquiler"
        />
        <meta
          property="og:title"
          content="Clases de rollers + alquiler de equipo | NM Roller"
        />
        <meta
          property="og:description"
          content="No tenés rollers? Te los damos. Clases grupales en +8 sedes con todo el equipo incluido."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* HERO */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/[0.08] rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-primary/[0.05] rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 mb-6">
                <Package className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Clases + Alquiler de equipo
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tight leading-[1.05] mb-6">
                ¿No tenés equipo?
                <br />
                <span className="text-primary">Te lo alquilamos.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Aprendé a patinar en clases grupales con todo el equipo incluido:
                rollers, casco y protecciones. Ideal si querés probar sin invertir
                primero en tus propios patines.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    document.getElementById("planes-alquiler")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.15em] text-sm px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                >
                  Reservar mi lugar
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("sedes-alquiler")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="border-border text-foreground hover:bg-muted font-medium text-base px-8 py-6 rounded-full"
                >
                  Ver sedes
                </Button>
              </div>
              <button
                onClick={() =>
                  document.getElementById("sedes-alquiler")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-xs text-muted-foreground mt-3 underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Aplica solo en algunas sedes y horarios — ver grilla
              </button>
            </div>

            {/* Visual */}
            <div className="relative flex items-center justify-center min-h-[360px] lg:min-h-[480px] animate-fade-up-delay-2">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-primary/20 blur-3xl rounded-full" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full border-2 border-dashed border-primary/40 animate-spin-slow" />

              <div className="relative grid grid-cols-2 gap-4 max-w-md">
                {incluye.map((item, i) => (
                  <div
                    key={item.title}
                    className={`bg-card border border-border rounded-2xl p-5 shadow-md animate-float ${i % 2 === 0 ? "" : "mt-8"}`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                  </div>
                ))}
              </div>

              <div className="absolute top-4 right-2 bg-primary text-primary-foreground px-3 py-2 flex items-center gap-2 shadow-lg -rotate-6 animate-float-slow">
                <Sparkles className="w-4 h-4" strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                  Todo incluido
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* QUÉ INCLUYE — banda */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-bold text-sm tracking-[0.18em] uppercase mb-2">
                Qué incluye
              </p>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground">
                Te damos todo el kit
              </h2>
              <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">
                Vos solo traé ropa cómoda y muchas ganas. Del resto nos ocupamos nosotros.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {incluye.map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-primary font-bold text-sm tracking-[0.18em] uppercase mb-2">
                Cómo funciona
              </p>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground">
                Empezar es fácil
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pasos.map((p) => (
                <div
                  key={p.n}
                  className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <span className="absolute -top-5 left-6 bg-primary text-primary-foreground font-black italic text-xl px-4 py-1 rounded-md shadow-md">
                    {p.n}
                  </span>
                  <h3 className="font-black italic text-xl text-foreground mb-3 mt-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEDES CON ALQUILER */}
        <section id="sedes-alquiler" className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-bold text-sm tracking-[0.18em] uppercase mb-2">
                Dónde
              </p>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground mb-3">
                Sedes con alquiler
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Estas sedes ofrecen alquiler de rollers y protecciones. Reservá con
                al menos 24hs de antelación.
              </p>
            </div>

            <AlquilerSedesGrid />

            {/* Grilla horaria de sedes con alquiler */}
            <div className="mt-14">
              <div className="text-center mb-6">
                <p className="text-primary font-bold text-xs tracking-[0.18em] uppercase mb-1">
                  Horarios
                </p>
                <h3 className="text-2xl md:text-3xl font-black italic tracking-tight text-foreground">
                  Turnos con alquiler por sede
                </h3>
              </div>
              <AlquilerHorariosGrid />
            </div>



            <div className="text-center mt-10">
              <Link
                to="/#horarios"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary hover:gap-3 transition-all"
              >
                Ver todos los horarios
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* PRECIOS */}
        <PricingAlquilerSection onReserve={() => setCalendlyOpen(true)} />

        {/* FAQ */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <p className="text-primary font-bold text-sm tracking-[0.18em] uppercase mb-2">
                FAQ
              </p>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-foreground">
                Preguntas frecuentes
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-card border border-border rounded-xl px-5"
                >
                  <AccordionTrigger className="text-left font-bold text-foreground text-base hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tight mb-4">
              ¿Listo para tu primera clase?
            </h2>
            <p className="text-base md:text-lg opacity-90 mb-8">
              Reservá tu lugar y te esperamos con todo el equipo listo para
              empezar.
            </p>
            <Button
              size="lg"
              onClick={() =>
                document.getElementById("planes-alquiler")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold uppercase tracking-[0.15em] text-sm px-10 py-6 rounded-full shadow-lg group"
            >
              Reservar ahora
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>

        <Footer />

        {/* Calendly modal */}
        <Dialog open={calendlyOpen} onOpenChange={setCalendlyOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[98vh] sm:max-h-[95vh] p-0 overflow-hidden border-0 bg-background rounded-2xl gap-0">
            <DialogTitle className="sr-only">Agendá tu turno para pago presencial</DialogTitle>
            <div className="flex flex-col items-center pt-4 pb-3 px-4 sm:pt-6 sm:pb-4 sm:px-6 text-center">
              <img src={logoNM} alt="NM Roller" className="h-12 sm:h-16 mb-2 sm:mb-3" />
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-primary mb-2 leading-tight">
                Agendá tu turno para pago presencial
              </h2>
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md space-y-1.5">
                <p>📍 Te esperamos en la oficina, a dos cuadras del Rosedal.</p>
                <p>⚠️ <strong className="text-foreground">Importante:</strong> completá todos los pasos del calendario.</p>
                <p>✅ Tu turno queda reservado únicamente cuando veas el mensaje: <em className="text-foreground">"Tu cita fue programada"</em></p>
              </div>
            </div>
            <iframe
              src={calendlyUrl('clases-alquiler')}
              className="w-full h-[60vh] sm:h-[55vh] border-0"
              title="Agendá tu turno para pago presencial - Calendly"
            />
            <div className="bg-primary px-4 py-2 sm:py-3 text-center">
              <p className="text-primary-foreground text-xs sm:text-sm">
                <strong className="font-bold">¿Ya reservaste?</strong>
                <br />
                Podés avisarnos por{" "}
                <a
                  href={`https://wa.me/5491165920600?text=${encodeURIComponent("[LP-NM-PP-Cdly] Ya agendé mi turno vía calendly, solo quiero confirmar que lo hayan recibido. Mi nombre es XXX")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold italic underline text-primary-foreground hover:opacity-80"
                >
                  WhatsApp
                </a>{" "}
                para verificar que recibimos tu turno.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ClasesMasAlquiler;
