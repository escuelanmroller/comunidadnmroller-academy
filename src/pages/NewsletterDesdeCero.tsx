import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowLeft, Loader2, Sparkles, Zap, Star, Mail, Rocket } from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";
import mockup from "@/assets/newsletter-mockup.png";

const FormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(100),
  email: z.string().trim().email("Email inválido").max(255),
});

const benefits = [
  "Tips simples para patinar con seguridad y confianza",
  "Mini desafíos y motivación semanal",
  "Historias reales de personas como vos",
  "Acceso a la Ruta de Aprendizaje + Bitácora",
];

const NewsletterDesdeCero = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse({ name, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { ...parsed.data, website, ubicacion: "landing-newsletter" },
      });
      if (error) throw error;
      if (data?.success) {
        setSuccess(true);
        toast.success(
          data.alreadySubscribed
            ? "Ya estabas en la lista. ¡Nos vemos pronto!"
            : "¡Listo! Revisá tu correo para empezar."
        );
        setName("");
        setEmail("");
        navigate("/registro-confirmado-newsletter");
      } else {
        throw new Error(data?.error ?? "Algo salió mal");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No pudimos sumarte. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Newsletter Desde Cero — Comunidad NM Roller</title>
        <meta
          name="description"
          content="La newsletter que te impulsa a dar tu primer paso sobre ruedas. Tips, motivación semanal y la Ruta de Aprendizaje, gratis."
        />
        <link rel="canonical" href="https://comunidadnmroller.lovable.app/newsletter-desde-cero" />
        <meta property="og:title" content="Newsletter Desde Cero — Comunidad NM Roller" />
        <meta property="og:description" content="Empezá a patinar desde cero con tips, motivación y desafíos suaves en tu inbox." />
        <meta property="og:url" content="https://comunidadnmroller.lovable.app/newsletter-desde-cero" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="pt-10 pb-4 flex justify-center">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        {/* Hero */}
        <section className="flex-1 flex items-center px-6 lg:px-16 py-10">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-foreground/70 mb-6">
                ¿Y sí sí podés empezar a patinar?
              </p>
              <h1 className="font-display italic uppercase leading-[0.95] text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-8">
                La newsletter que te<br />
                guía a dar<br />
                <span className="text-primary">tu primer paso</span>
              </h1>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl">
                Te mandamos un correo que te acompaña desde cero: con tips reales,
                motivación y desafíos suaves.{" "}
                <strong className="text-foreground">
                  Incluso si no sabés frenar o hace mucho que no patinás.
                </strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
                {/* Honeypot — hidden from users, bots fill it */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || success}
                    maxLength={100}
                    required
                    className="h-12 rounded-none bg-card border-border text-base"
                  />
                  <Input
                    type="email"
                    placeholder="Tu mejor correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    maxLength={255}
                    required
                    className="h-12 rounded-none bg-card border-border text-base"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    "¡Sumado! Revisá tu inbox"
                  ) : (
                    "Suscribirme"
                  )}
                </Button>
              </form>

              <p className="text-xs text-foreground/50 mt-4 max-w-xl">
                <span className="text-primary font-bold">¡ACEPTO!</span> Recibir contenido útil y promocional.
                Te esperamos. <strong>Desde cero. Con vos.</strong>
              </p>
            </div>

            {/* Right - mockup */}
            <div className="relative flex items-center justify-center min-h-[420px] sm:min-h-[520px] lg:min-h-[640px]">
              {/* Animated glow blobs */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[520px] lg:w-[620px] aspect-square bg-primary/30 blur-3xl rounded-full animate-pulse-glow"
                aria-hidden
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] sm:w-[380px] lg:w-[460px] aspect-square bg-accent/20 blur-3xl rounded-full animate-pulse-glow"
                style={{ animationDelay: "1.5s" }}
                aria-hidden
              />

              {/* Rotating dashed ring */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] lg:w-[560px] lg:h-[560px] rounded-full border-2 border-dashed border-primary/40 animate-spin-slow"
                aria-hidden
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[360px] sm:h-[360px] lg:w-[460px] lg:h-[460px] rounded-full border border-accent/30 animate-spin-slow"
                style={{ animationDirection: "reverse", animationDuration: "30s" }}
                aria-hidden
              />

              {/* Floating mockup */}
              <div className="relative animate-float drop-shadow-[0_25px_60px_hsl(var(--primary)/0.45)]">
                <img
                  src={mockup}
                  alt="Mockup del Mapa de Aprendizaje NM Roller en un celular"
                  width={1024}
                  height={1024}
                  className="relative w-[260px] sm:w-[340px] lg:w-[440px] h-auto mx-auto"
                />
              </div>

              {/* Floating decorative badges */}
              <div className="absolute top-6 left-2 sm:left-6 lg:left-0 animate-float-slow">
                <div className="bg-primary text-primary-foreground px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 shadow-red-glow -rotate-6">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">+1 Tip / semana</span>
                </div>
              </div>

              <div
                className="absolute bottom-10 right-0 sm:right-2 lg:right-0 animate-float-slow"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="bg-accent text-accent-foreground px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 shadow-md rotate-6">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">Inbox feliz</span>
                </div>
              </div>

              <div
                className="absolute top-1/3 right-4 sm:right-8 lg:right-6 animate-float"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-foreground text-primary border-2 border-primary flex items-center justify-center rotate-12">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
              </div>

              <div
                className="absolute bottom-6 left-4 sm:left-10 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-accent" strokeWidth={2.5} />
              </div>

              <div
                className="absolute top-1/2 left-0 sm:left-4 animate-float-slow"
                style={{ animationDelay: "0.3s" }}
              >
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-primary -rotate-45" strokeWidth={2.5} />
              </div>
            </div>

          </div>
        </section>

        {/* Benefits band */}
        <section className="bg-primary text-primary-foreground py-10 sm:py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center font-display italic uppercase text-xl sm:text-2xl md:text-4xl font-black mb-6 sm:mb-12 tracking-tight">
              Recibí en tu bandeja de entrada
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {benefits.map((b) => (
                <div key={b} className="flex sm:flex-col items-center gap-3 sm:gap-0 text-left sm:text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-foreground text-primary flex items-center justify-center shrink-0 sm:mb-4">
                    <Check className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-medium leading-snug sm:max-w-[220px]">
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer link */}
        <div className="py-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-[0.18em]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>
        </div>
      </main>
    </>
  );
};

export default NewsletterDesdeCero;
