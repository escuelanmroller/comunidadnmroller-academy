import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  MapPin,
  Clock,
  Check,
  ShieldCheck,
  Users,
  Sparkles,
  Timer,
  Wrench,
  GraduationCap,
  Gift,
  Route,
  ArrowRight,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CountdownBanner from "@/components/CountdownBanner";
import InstagramEmbed from "@/components/InstagramEmbed";
import { getMasterclass, getProximaMasterclass, precioVigente } from "@/data/masterclasses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import fotoUbicacionPuertoMadero from "@/assets/masterclass-ubicacion-puerto-madero.jpg";

// Marca aliada — asesoramiento y venta de equipo (protecciones obligatorias).
const FLYFREE_WHATSAPP_URL =
  "https://wa.me/5491151097151?text=" +
  encodeURIComponent(
    "[LP-MC-NM] Hola! Voy a la Masterclass de NM Roller y quiero completar mi equipo. ¿Me asesoran?",
  );
const FLYFREE_KIT_URL = "https://www.flyfreeurban.com/kits/kit-completos-para-arrancar-a-patinar/";

// Mismo hecho real que ValueProposition.tsx (Home) — por qué el seguro no es
// automático, para reforzarlo también acá en vez de dejarlo en "seguro incluido".
const SEGURO_NOTE =
  "Para acceder a la cobertura del seguro, debés usar tus protecciones completas en cada clase: rodilleras, coderas, muñequeras y casco. Es un requisito básico de seguridad — y la forma en que nos aseguramos de cuidarte bien.";

// Las 2 clases a elección salen siempre de este mismo set de disciplinas.
const DISCIPLINAS_MASTERCLASS = ["Primeros pasos", "Frenadas", "Rampas o saltos", "Slalom"];

const objetivos = [
  "Probar técnicas básicas desde cero",
  "Aprender a frenar de forma segura",
  "Dar tus primeros saltos",
  "Salir a la calle con el grupo",
];

const miedos = [
  {
    title: '"Tengo miedo a lastimarme"',
    body: "Te enseñamos según tu nivel, con ejercicios pensados para que avances sin riesgo. Las protecciones son obligatorias justamente para eso: que patines tranquilo.",
  },
  {
    title: '"No tengo rollers, ¿cómo voy a empezar?"',
    body: "No es un obstáculo. Te asesoramos para elegir tu equipo con Fly Free, marca aliada, antes del encuentro.",
  },
  {
    title: '"¿Y si no progreso como quiero?"',
    body: "Acá no hay competencia. Enseñamos a tu ritmo: te vas a sentir seguro/a desde el primer momento.",
  },
];

const logros = [
  {
    icon: ShieldCheck,
    title: "Confianza y seguridad",
    body: "Vas con casco y protecciones completas puestas — es justo lo que activa la cobertura de tu seguro médico incluido.",
  },
  {
    icon: Sparkles,
    title: "2 disciplinas a tu elección",
    body: "Elegís 2 de 4 disciplinas, de primeros pasos a slalom — a tu ritmo, no al de otro.",
  },
  {
    icon: Users,
    title: "Hasta 8 instructores",
    body: "Más manos para ayudarte en la jornada, menos tiempo haciendo fila esperando tu turno.",
  },
  {
    icon: Route,
    title: "Experiencia real",
    body: "Cerramos con una salida urbana o una ranchada — mate y charla con el grupo, no solo clase y listo.",
  },
];

const incluye = [
  {
    icon: Timer,
    title: "Hasta 4 horas de aprendizaje",
    body: "Entrenamiento práctico y progresivo que vas a sentir como una evolución real.",
  },
  {
    icon: GraduationCap,
    title: "Todos los niveles",
    body: "Desde quienes nunca se subieron a unos rollers hasta los que buscan dominar slalom, frenadas o rampas.",
  },
  {
    icon: Wrench,
    title: "Traé tu equipo propio",
    body: "Rollers y protecciones (uso obligatorio). ¿Te falta algo? Comprá tu equipo con Fly Free, marca aliada, antes del encuentro.",
  },
  {
    icon: Users,
    title: "Hasta 8 instructores especializados",
    body: "Equipo entrenado para enseñar con paciencia, técnica y buena onda.",
  },
  {
    icon: Gift,
    title: "Beneficios exclusivos para alumnos",
    body: "Con el Plan Black Free, esta Masterclass es gratis. Con otros planes, 40% OFF.",
  },
  {
    icon: Route,
    title: "Salida urbana (opcional)",
    body: "Cerramos saliendo a la calle. Acompañado/a por instructores, sentí lo que se siente dominar los rollers.",
  },
];

const MasterclassPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const mc = getMasterclass(slug);
  const [modalPase, setModalPase] = useState<'general' | 'alumnos-transferencia' | null>(null);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [seguroOpen, setSeguroOpen] = useState(false);

  useEffect(() => {
    if (mc) {
      document.title = `Masterclass de Patinaje — ${mc.sede} | ${mc.fechaLabel}`;
      // Si la venta ya cerró al cargar la página, redirigir a lista de espera
      if (new Date() > new Date(mc.ventaHasta)) {
        navigate(`/masterclass-de-patinaje/${mc.slug}/lista-de-espera`, { replace: true });
      }
    }
  }, [mc, navigate]);

  const handleCountdownExpired = useCallback(() => {
    if (mc) {
      navigate(`/masterclass-de-patinaje/${mc.slug}/lista-de-espera`, { replace: true });
    }
  }, [mc, navigate]);

  if (!slug) {
    const next = getProximaMasterclass();
    return <Navigate to={`/masterclass-de-patinaje/${next.slug}`} replace />;
  }

  if (!mc) {
    return <Navigate to="/" replace />;
  }

  const precios = precioVigente(mc);
  // Calculado desde mc.earlyBirdHasta, no hardcodeado — así no queda vieja la
  // fecha cuando cambie la edición de Masterclass en src/data/masterclasses.ts.
  const earlyBirdHastaFecha = new Date(mc.earlyBirdHasta).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleComprarOnline = async (planSlugOverride?: string) => {
    setLoadingOnline(true);
    try {
      const { data, error } = await supabase.functions.invoke("crear-preferencia-pago", {
        body: { plan_slug: planSlugOverride ?? mc.slug, origen: "masterclass" },
      });
      if (error || !data?.init_point) throw error ?? new Error("Sin init_point");
      window.location.href = data.init_point;
    } catch (err) {
      console.error("crear-preferencia-pago (masterclass) failed", err);
      toast({
        title: "No pudimos iniciar el pago",
        description: "Probá de nuevo en unos segundos o escribinos por WhatsApp.",
        variant: "destructive",
      });
      setLoadingOnline(false);
    }
  };

  const ogTitle = `Sumate a la Masterclass | ${mc.fechaLabel} en ${mc.sede}`;
  const ogDescription = `Aprende técnicas avanzadas el ${mc.fechaLabel} a las ${mc.hora}. Cupos limitados. Incluye 2 clases a elección + seguro médico.`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content="/og-masterclass.png" />
        <meta property="og:url" content={`https://comunidadnmroller.com/masterclass-de-patinaje/${mc.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={`En ${mc.sede} — Cupos limitados. Asegurá tu lugar.`} />
        <meta name="twitter:image" content="/og-masterclass.png" />
      </Helmet>
      <Navbar />

      {/* HERO */}
      <section
        className="relative min-h-screen sm:min-h-[90vh] flex items-center overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-16"
        style={{
          backgroundImage: `url('/patinadores-comunidad.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute top-10 -left-20 sm:top-20 sm:-left-32 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-5 -right-10 sm:right-0 w-40 sm:w-80 h-40 sm:h-80 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 w-full text-center">
          {/* Fecha/sede/hora ya viven en la grilla "Datos clave" de abajo (que además suma
              el link a cómo llegar y el seguro) — evitar repetirlo acá arriba. */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-[1.05] mb-6">
            Hasta 8 instructores, un solo día:{" "}
            <span className="text-primary">la confianza que buscabas sobre rollers</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Una oportunidad para quienes siempre tuvieron curiosidad por patinar
            y nunca se animaron — o quieren dar el siguiente paso.{" "}
            <span className="text-white font-semibold">
              Necesitás tu propio equipo — rollers y protecciones (uso obligatorio).
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-start justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 group"
              onClick={() => scrollTo("pases")}
            >
              Quiero elegir mi pase
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex flex-col items-center gap-1.5">
              <a href={FLYFREE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="rounded-full text-black hover:opacity-90 text-xs tracking-normal px-8 py-6 w-full"
                  style={{ backgroundColor: "#F5C400" }}
                >
                  <Wrench className="w-4 h-4 mr-1 shrink-0" /> Comprar mi equipo con Fly Free
                </Button>
              </a>
              <p className="text-xs text-white/70">Tienda oficial · asesoran patinadores, no un mostrador</p>
            </div>
          </div>

          {/* Datos clave */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {[
              { icon: Calendar, label: mc.fechaLabel },
              { icon: Clock, label: mc.hora, note: "Llegá 30 min antes" },
              { icon: MapPin, label: mc.sede, href: mc.mapsUrl, sublabel: "Cómo llegar" },
              { icon: ShieldCheck, label: "Seguro incluido", onToggle: () => setSeguroOpen((v) => !v) },
            ].map((d, i) => {
              const Wrapper = d.href ? "a" : "div";
              return (
                <Wrapper
                  key={i}
                  {...(d.href ? { href: d.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 ${d.href ? "hover:border-primary/50 transition-colors" : ""}`}
                >
                  <d.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-foreground text-center">
                    {d.label}
                  </span>
                  {d.sublabel && (
                    <span className="text-[11px] font-semibold text-primary underline underline-offset-2">
                      {d.sublabel}
                    </span>
                  )}
                  {d.note && (
                    <span className="text-[11px] text-foreground/50 text-center">
                      {d.note}
                    </span>
                  )}
                  {d.onToggle && (
                    <button
                      onClick={d.onToggle}
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary underline underline-offset-2"
                    >
                      ¿Cómo aplica?
                      <ChevronDown className={`w-3 h-3 transition-transform ${seguroOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </Wrapper>
              );
            })}
          </div>
          {seguroOpen && (
            <p className="mt-3 text-xs text-white/70 max-w-xl mx-auto text-center leading-relaxed">
              {SEGURO_NOTE}
            </p>
          )}
        </div>
      </section>

      {/* OBJETIVOS BAR */}
      <section className="bg-primary text-primary-foreground py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {objetivos.map((o) => (
            <div
              key={o}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-10 h-10 rounded-full border-2 border-primary-foreground flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wide leading-tight">
                {o}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MIEDOS */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4 text-center">
            ¿Te gustaría aprender a patinar, pero{" "}
            <span className="text-primary">te frena el miedo</span>?
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Esta Masterclass intensiva está pensada para que no te dejes dominar
            por tus miedos y salgas a la calle con confianza y seguridad.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {miedos.map((m) => (
              <div
                key={m.title}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <p className="text-primary font-black mb-3 text-lg">
                  {m.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOGROS */}
      <section className="py-12 sm:py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-cta text-primary text-center mb-3">
            Te preguntarás
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-12 text-center">
            ¿Qué voy a lograr en esta Masterclass?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {logros.map((l) => (
              <div
                key={l.title}
                className="bg-background border border-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <l.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-black text-lg mb-2">{l.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECAP REAL — Prueba social de la última Masterclass */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-cta text-primary text-center mb-3">
            No te lo contamos, te lo mostramos
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4 text-center">
            Así se vivió la <span className="text-primary">última Masterclass</span>
          </h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">
            Aprendizajes, desafíos, risas y un montón de gente animándose a probar
            algo nuevo. Esto es lo que te espera.
          </p>
          <div className="max-w-sm mx-auto">
            <InstagramEmbed url="https://www.instagram.com/p/Db-2BAqR2Yh/" className="w-full" />
          </div>
        </div>
      </section>

      {/* COUNTDOWN — Urgencia de venta */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <CountdownBanner
            ventaHasta={new Date(mc.ventaHasta)}
            cupos={mc.cupos}
            onExpired={handleCountdownExpired}
          />
        </div>
      </section>

      {/* PASES */}
      <section id="pases" className="py-12 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 text-center">
            Tres formas de dar tu primer paso
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-6">
            Elegí tu pase — incluye{" "}
            <span className="text-foreground font-semibold">
              dos (2) clases a elección
            </span>
            . Recordá traer tu propio equipo: rollers y protecciones son de uso obligatorio.
          </p>

          {/* Disciplinas entre las que se eligen las 2 clases */}
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-cta text-primary mb-3">
              Elegís 2 de estas 4 disciplinas
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {DISCIPLINAS_MASTERCLASS.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-4 py-1.5 text-sm font-semibold text-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* General */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-cta text-muted-foreground mb-2">
                Público general
              </p>
              <p className="text-4xl font-black text-foreground mb-1">
                {precios.general}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                {precios.esEarlyBird ? `Tarifa Early Bird · hasta el ${earlyBirdHastaFecha}` : "Precio general"}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-8 flex-1">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{" "}
                  Acceso completo a la jornada
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 2
                  clases a elección
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{" "}
                  Seguro médico incluido
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-xs tracking-normal"
                  onClick={() => handleComprarOnline()}
                  disabled={loadingOnline}
                >
                  {loadingOnline ? "Redirigiendo…" : "Pagar con Mercado Pago"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full text-xs tracking-normal"
                  onClick={() => setModalPase('general')}
                >
                  Comprar por la app
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Más rápido y con menos fricción
                </p>
              </div>
            </div>

            {/* Comprar protecciones — Fly Free (reemplaza el viejo "Pase + Alquiler") */}
            <div className="bg-card border-2 rounded-2xl p-8 flex flex-col relative shadow-xl md:-translate-y-4" style={{ borderColor: "#F5C400" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-black text-xs font-bold uppercase tracking-cta px-3 py-1 rounded-full" style={{ backgroundColor: "#F5C400" }}>
                ¿Te falta equipo?
              </div>
              <p className="text-xs font-bold uppercase tracking-cta mb-2" style={{ color: "#F5C400" }}>
                Comprá tus protecciones
              </p>
              <p className="text-2xl font-black text-foreground mb-1">
                Con Fly Free
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Marca aliada — las protecciones son obligatorias para participar
              </p>

              {/* Bono: comprar el equipo regala el pase a ESTA Masterclass (no
                  clases sueltas — confirmado con Gumercindo). Usa precios.general
                  (no un valor fijo) para que el tachado no quede desactualizado
                  cuando pase el tramo early bird. */}
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-6"
                style={{ backgroundColor: "#F5C4001A", border: "1px solid #F5C40055" }}
              >
                <Gift className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5C400" }} />
                <p className="text-xs text-foreground leading-snug">
                  Comprando acá te regalamos tu pase a esta Masterclass —{" "}
                  <span className="line-through text-muted-foreground">{precios.general}</span>{" "}
                  <strong>gratis</strong>.
                </p>
              </div>

              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5C400" }} />{" "}
                  Rollers, casco y protecciones
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5C400" }} />{" "}
                  Comprá antes del encuentro, sin apuro el día de la clase
                </li>
              </ul>

              {/* Diferenciador de autoridad — mismo copy ya validado en
                  FlyFreePanel.tsx, para no repetir "con Fly Free" en cada botón. */}
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-4"
                style={{ backgroundColor: "#F5C4001A", border: "1px solid #F5C40040" }}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F5C400" }} />
                <p className="text-[11px] leading-snug text-muted-foreground">
                  <span className="font-bold text-foreground">
                    Los asesores de Fly Free son profes de NM Roller
                  </span>{" "}
                  — enseñan, patinan y te asesoran desde la cancha, no desde un mostrador.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <a href={FLYFREE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="w-full rounded-full text-black hover:opacity-90"
                    style={{ backgroundColor: "#F5C400" }}
                  >
                    Quiero asesorarme
                  </Button>
                </a>
                <a href={FLYFREE_KIT_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full hover:bg-transparent"
                    style={{ borderColor: "#F5C400", color: "#F5C400" }}
                  >
                    Ver kit de iniciación
                  </Button>
                </a>
              </div>
            </div>

            {/* Alumnos */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-cta text-muted-foreground mb-2">
                Alumnos Activos
              </p>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                <p className="text-4xl font-black text-foreground">
                  {precios.alumnos}
                </p>
                <span className="text-sm text-muted-foreground line-through">
                  {precios.general}
                </span>
              </div>
              <p className="text-xs text-primary font-bold mb-6">
                {precios.descuentoPct}% OFF para alumnos activos
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-8 flex-1">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{" "}
                  Acceso completo a la jornada
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{" "}
                  Plan Black Free: <strong>gratis</strong>
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{" "}
                  Transferencia o Mercado Pago — sin descargar nada nuevo
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-xs tracking-normal"
                  onClick={() => handleComprarOnline('puerto-madero-27-septiembre-alumnos')}
                  disabled={loadingOnline}
                >
                  {loadingOnline ? "Redirigiendo…" : "Pagar con Mercado Pago"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full text-xs tracking-normal"
                  onClick={() => setModalPase('alumnos-transferencia')}
                >
                  Pagar con transferencia
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Suele confirmarte un humano más rápido
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INCLUYE */}
      <section className="py-12 sm:py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-12 text-center">
            Una experiencia pensada para que{" "}
            <span className="text-primary">aprendas y te diviertas</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {incluye.map((i) => (
              <div
                key={i.title}
                className="bg-background border border-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <i.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-black text-lg mb-2">{i.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {i.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-cta text-primary mb-3">
            Si querés avanzar más rápido
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4">
            Desbloqueá el <span className="text-primary">Plan Black</span>
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Acceso total a todas las clases regulares y Masterclass gratis.
          </p>
          {/* Precios Black Free — mantener sincronizado a mano con PricingSection.tsx (monthlyPlans, plan "Black Free") */}
          <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 mb-8">
            <span className="text-base sm:text-lg text-muted-foreground line-through">$79.000</span>
            <span className="text-xl sm:text-2xl font-black text-primary">$65.000</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-muted-foreground">en efectivo</span>
          </div>
          <Link to="/#planes">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6"
            >
              Quiero el Plan Black
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* RESUMEN EVENTO */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black mb-6">Resumen del encuentro</h2>

          <a
            href={mc.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl overflow-hidden border border-border mb-8 relative"
          >
            <img
              src={fotoUbicacionPuertoMadero}
              alt={`Vista de ${mc.direccion}`}
              className="w-full h-56 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-3">
              <p className="text-white text-sm font-bold text-left leading-tight">
                📍 {mc.direccion}
              </p>
              <span className="shrink-0 inline-flex items-center gap-1 bg-white/90 text-[#111] text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
                Cómo llegar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>

          {/* Fecha/hora/sede ya están en la grilla "Datos clave" del hero — no repetirlas
              acá por tercera vez, esta sección se queda solo con la foto + el CTA. */}
          {/* Evitamos mandar a WhatsApp a "reservar" desde acá — los dos caminos de
              compra real son la sección de pases (arriba) o la asesoría de Fly Free.
              Paralelismo deliberado con el botón rojo ("comprar mi pase" / "comprar mi
              equipo") + recordatorio del bono ya explicado en la card de precios, para
              no perder el dato más fuerte de la página justo en el cierre. */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6"
              onClick={() => scrollTo("pases")}
            >
              Quiero comprar mi pase
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <div className="flex flex-col items-center gap-1.5">
              <a href={FLYFREE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="rounded-full text-black hover:opacity-90 px-8 py-6 w-full"
                  style={{ backgroundColor: "#F5C400" }}
                >
                  <Wrench className="w-4 h-4 mr-1 shrink-0" /> Quiero comprar mi equipo
                </Button>
              </a>
              <p className="text-muted-foreground text-xs">
                Comprando acá, esta Masterclass es gratis
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Modal "Cómo comprar" ── */}
      <Dialog open={modalPase !== null} onOpenChange={(open) => !open && setModalPase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic tracking-tight">
              {modalPase === 'alumnos-transferencia'
                ? `🏦 Pagar con transferencia — ${precios.alumnos}`
                : `🎫 Pase General — ${precios.general}`}
            </DialogTitle>
          </DialogHeader>

          {modalPase === 'alumnos-transferencia' && (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted rounded-lg p-2.5">
                  <span className="block text-muted-foreground uppercase tracking-wide mb-0.5">Alias</span>
                  <strong>nmroller25.mp</strong>
                </div>
                <div className="bg-muted rounded-lg p-2.5">
                  <span className="block text-muted-foreground uppercase tracking-wide mb-0.5">Monto</span>
                  <strong>{precios.alumnos}</strong>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Mandanos el comprobante junto con tu{" "}
                <strong className="text-foreground">nombre y apellido</strong> y tu{" "}
                <strong className="text-foreground">DNI o email</strong> — los mismos con los que estás
                dado de alta en TurnoWeb, así te acreditamos el pase.
              </p>
              <a
                href={
                  "https://wa.me/5491165920600?text=" +
                  encodeURIComponent(
                    `[LP-MC-ALUMNO] Hola! Soy alumno activo y ya transferí mi pase para la Masterclass del 27 de septiembre (${precios.alumnos}).\n\nMis datos de TurnoWeb:\n• Nombre y apellido: \n• DNI o email: \n\nAdjunto el comprobante 👇`,
                  )
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 whitespace-normal leading-tight gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Enviar comprobante
                </Button>
              </a>
            </>
          )}

          {/* Pasos numerados — solo pase general */}
          {modalPase === 'general' && <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-none w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">1</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Descargá la app TurnoWeb</p>
                <div className="flex gap-2 mt-2">
                  <a
                    href="https://apps.apple.com/us/app/turnosweb-app/id1169566678?l=es&ls=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> App Store
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.turnosweb.lite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Google Play
                  </a>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">2</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Creá tu cuenta o ingresá</p>
                <p className="text-xs text-muted-foreground mt-0.5">Con tu email y una contraseña. Es gratis y toma menos de un minuto.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">3</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Buscá la Masterclass</p>
                <p className="text-xs text-muted-foreground mt-0.5">Encontrá la MasterClass en Comprar Créditos.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">4</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Elegí la fecha y completá el pago</p>
                <p className="text-xs text-muted-foreground mt-0.5">Podés abonar con Mercado Pago utilizando todas las tarjetas.</p>
              </div>
            </li>
          </ol>}

          {/* Placeholder capturas / video — solo pase general */}
          {modalPase === 'general' && (
            <div className="bg-muted rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                📸 Próximamente: capturas paso a paso y video tutorial
              </p>
            </div>
          )}

          {/* Pedir acceso al grupo de WhatsApp — solo pase general */}
          {modalPase === 'general' && (
            <div className="border border-[#25D366]/40 bg-[#25D366]/10 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Para vivir una mejor experiencia, pedí tu acceso al grupo de
                WhatsApp de la Masterclass: ahí te avisamos de cualquier
                reprogramación, cambio de último momento o si necesitás soporte.
              </p>
              <a
                href={
                  "https://wa.me/5491165920600?text=" +
                  encodeURIComponent(
                    "[LP-MC-GRUPO] Hola! Compré mi pase para la Masterclass del 27 de septiembre por la app. ¿Me pueden agregar al grupo de WhatsApp del encuentro?",
                  )
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-semibold text-sm hover:underline"
              >
                Pedir acceso al grupo →
              </a>
            </div>
          )}

          {/* Footer: dudas → WhatsApp */}
          <p className="text-xs text-muted-foreground text-center">
            ¿Tenés dudas?{' '}
            <a
              href={mc.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Escribinos por WhatsApp →
            </a>
          </p>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MasterclassPage;
