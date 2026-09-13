import { useEffect, useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { differenceInSeconds } from "date-fns";
import {
  AlertCircle,
  Clock,
  Smartphone,
  UserPlus,
  Wallet,
  Send,
  Check,
  ArrowLeft,
} from "lucide-react";
import logoNM from "@/assets/Logo-NM-Rollers.png";

// ── Config ──
const WHATSAPP = "5491165920600";
const ALIAS = "nmroller25.mp";
const RAZON = "Pisapco SRL";
const APP_STORE = "https://apps.apple.com/ar/app/turnosweb-app-2-0/id1169566678";
const GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=com.turnosweb.lite";
const EVERGREEN_HOURS = 48;
const STORAGE_KEY = "cg_deadline";

const wa = (txt: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;

interface FormState {
  name?: string;
  email?: string;
  phone?: string;
  dni?: string;
  sede?: string;
  nivel?: string;
}

// Arma el mensaje de WhatsApp ya pre-llenado con los datos del formulario.
// Si se entra sin datos (visita directa), usa el texto con placeholders.
const buildWaEnviarDatos = (st: FormState | null) => {
  if (!st?.name) {
    return wa(
      "¡Hola! Reservé mi clase de prueba en NM Roller 🛼. Te paso mis datos para acreditarla 👉 Nombre completo: , DNI: . (Si transferí la seña, adjunto el comprobante.)",
    );
  }
  const sedeLine = st.sede ? ` Sede: ${st.sede}.` : "";
  return wa(
    `¡Hola! Reservé mi clase de prueba en NM Roller 🛼. Te paso mis datos para acreditarla 👉 Nombre completo: ${st.name}, DNI: [completá tu DNI].${sedeLine} (Si transferí la seña, adjunto el comprobante.)`,
  );
};

const waDudas = wa("¡Hola! Tengo una duda sobre mi clase de prueba 🛼");

// ── Contador evergreen (48 hs por visitante, persistido en localStorage) ──
const getDeadline = (): number => {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (stored && !Number.isNaN(stored)) return stored;
    const fresh = Date.now() + EVERGREEN_HOURS * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(fresh));
    return fresh;
  } catch {
    return Date.now() + EVERGREEN_HOURS * 60 * 60 * 1000;
  }
};

const useCountdown = () => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const deadline = getDeadline();
    const tick = () => {
      const diff = Math.max(0, differenceInSeconds(deadline, new Date()));
      setT({
        d: Math.floor(diff / 86400),
        h: Math.floor((diff % 86400) / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
};

const pad = (n: number) => String(n).padStart(2, "0");

const AppButtons = () => (
  <div className="flex flex-wrap items-center gap-3 mt-4">
    <a
      href={GOOGLE_PLAY}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-foreground text-background rounded-full shadow-lg px-4 py-2 flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 3.458L16.8 9.79l-2.302 2.302L5.864 3.458z" />
      </svg>
      <div className="text-left">
        <span className="text-[8px] uppercase block leading-none">Get it on</span>
        <span className="text-xs font-semibold leading-tight">Google Play</span>
      </div>
    </a>
    <a
      href={APP_STORE}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-foreground text-background rounded-full shadow-lg px-4 py-2 flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div className="text-left">
        <span className="text-[8px] uppercase block leading-none">Download on the</span>
        <span className="text-xs font-semibold leading-tight">App Store</span>
      </div>
    </a>
  </div>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface Paso {
  Icon: typeof Smartphone;
  title: string;
  body: ReactNode;
}

const buildPasos = (waEnviarDatos: string): Paso[] => [
  {
    Icon: Smartphone,
    title: 'Descargá la app "TurnosWeb"',
    body: (
      <>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Cuando te pida nombre de empresa poné <strong>NM Roller</strong>. Elegí tu
          sistema operativo 👇
        </p>
        <AppButtons />
      </>
    ),
  },
  {
    Icon: UserPlus,
    title: "Registrate en la app",
    body: (
      <p className="text-sm text-foreground/70 leading-relaxed">
        Ingresá tus datos correctos (o los de quien vaya a asistir) para que podamos
        asignarte la clase.
      </p>
    ),
  },
  {
    Icon: Wallet,
    title: "(Si aplica) Pagá la seña",
    body: (
      <p className="text-sm text-foreground/70 leading-relaxed">
        Si tu sede requiere seña: transferí <strong>$35.000</strong> al alias{" "}
        <strong className="text-primary">{ALIAS}</strong> ({RAZON}), o abonás{" "}
        <strong>$32.000</strong> en efectivo en la oficina. La seña se bonifica si
        comprás un plan dentro de los 7 días.
      </p>
    ),
  },
  {
    Icon: Send,
    title: "Envianos tu DNI y nombre completo",
    body: (
      <>
        <p className="text-sm text-foreground/70 leading-relaxed mb-4">
          Mandanos tu nombre completo y DNI. Si transferiste la seña, adjuntá el
          comprobante.
        </p>
        <a
          href={waEnviarDatos}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-[#25D366] text-white font-bold uppercase tracking-[0.14em] text-xs transition-all hover:opacity-90 rounded-full"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current" /> Enviar datos
        </a>
      </>
    ),
  },
];

const despues = [
  { emoji: "🔒", text: <>Tu clase se acredita cuando te <strong>confirmemos por WhatsApp</strong>.</> },
  { emoji: "📧", text: <><strong>Revisá tu correo</strong> (y la carpeta de spam): ahí te mandamos los detalles para empezar.</> },
  { emoji: "📲", text: <>Ingresá a la app y confirmá tu reserva en la pestaña <strong>"Nueva Reserva"</strong>.</> },
  { emoji: "👥", text: <>Sumate al <strong>grupo de WhatsApp de tu sede</strong>.</> },
  { emoji: "💬", text: <>¿Dudas? Escribinos por WhatsApp y te ayudamos al instante.</> },
];

// Lee los datos del form desde el router state o, si se recargó, desde sessionStorage.
const readFormState = (navState: unknown): FormState | null => {
  const fromNav = navState as FormState | null;
  if (fromNav?.name) return fromNav;
  try {
    const raw = sessionStorage.getItem("clasegratis_form");
    return raw ? (JSON.parse(raw) as FormState) : null;
  } catch {
    return null;
  }
};

const ClaseGratisConfirmada = () => {
  const t = useCountdown();
  const location = useLocation();
  const st = readFormState(location.state);
  const waEnviarDatos = buildWaEnviarDatos(st);
  const pasos = buildPasos(waEnviarDatos);

  return (
    <>
      <Helmet>
        <title>Clase de prueba reservada · NM Roller</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-4 flex justify-center bg-primary">
          <Link to="/" aria-label="Volver al inicio">
            <img src={logoNM} alt="NM Roller" className="h-14" />
          </Link>
        </header>

        {/* Hero rojo */}
        <section className="relative bg-primary text-primary-foreground pt-10 pb-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#F5B800] text-[#111] border-2 border-[#F5B800] px-5 py-2 mb-6 text-xs md:text-sm font-black uppercase tracking-[0.18em] shadow-[0_0_24px_rgba(245,184,0,0.45)]">
              <AlertCircle className="w-4 h-4 animate-pulse" strokeWidth={3} /> Tu clase aún NO está acreditada
            </div>

            <h1 className="font-display italic uppercase leading-[0.95] text-2xl sm:text-3xl md:text-4xl font-black mb-6">
              ¡Recibimos tu solicitud!
            </h1>

            {/* Contador */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[
                { v: t.d, l: "Días" },
                { v: t.h, l: "Horas" },
                { v: t.m, l: "Min" },
                { v: t.s, l: "Seg" },
              ].map((u) => (
                <div key={u.l} className="flex flex-col items-center">
                  <div className="bg-[#F5B800] text-[#111] font-black text-2xl md:text-4xl px-3 py-2 min-w-[3rem] md:min-w-[4rem]">
                    {pad(u.v)}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide mt-1">
                    {u.l}
                  </span>
                </div>
              ))}
            </div>
            <p className="flex items-center justify-center gap-2 font-bold text-base md:text-lg mb-3">
              <Clock className="w-5 h-5" /> Tiempo restante para canjear tu beneficio
            </p>
            <p className="text-base md:text-lg leading-relaxed text-primary-foreground/95 max-w-xl mx-auto">
              Para no perder tu lugar, completá estos <strong>4 pasos</strong>. Es rápido —
              en un rato estás listo/a para patinar. 🛼
            </p>
          </div>

          <svg
            className="absolute bottom-0 left-0 w-full h-16 md:h-24 text-background"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C360,120 1080,-20 1440,60 L1440,100 L0,100 Z" fill="currentColor" />
          </svg>
        </section>

        {/* 4 pasos */}
        <section className="py-16 md:py-20 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display italic uppercase text-2xl md:text-4xl font-black text-primary text-center mb-12">
              Completá estos 4 pasos
            </h2>
            <ol className="grid md:grid-cols-2 gap-6">
              {pasos.map((s, i) => (
                <li
                  key={i}
                  className="relative border-2 border-primary/30 bg-primary/5 p-6 transition-all hover:border-primary hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 font-black text-lg bg-primary text-primary-foreground">
                      {i + 1}
                    </span>
                    <s.Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display italic uppercase font-black text-lg mb-2 leading-tight underline decoration-primary decoration-2 underline-offset-4">
                    {s.title}
                  </h3>
                  {s.body}
                </li>
              ))}
            </ol>

            {/* Advertencia: punto clave */}
            <div className="mt-10 max-w-3xl mx-auto bg-[#F5B800]/10 border-2 border-[#F5B800] p-6 md:p-7 text-center">
              <div className="inline-flex items-center gap-2 bg-[#F5B800] text-[#111] px-4 py-1.5 mb-4 text-xs font-black uppercase tracking-[0.18em]">
                <AlertCircle className="w-4 h-4" strokeWidth={3} /> Paso clave
              </div>
              <p className="text-base md:text-lg font-bold text-foreground leading-relaxed mb-5 max-w-xl mx-auto">
                El <span className="text-primary">paso 4 es indispensable</span>: si no nos enviás
                tu nombre y DNI (y el comprobante, si pagaste la seña),{" "}
                <span className="text-primary">tu clase NO queda acreditada</span>.
              </p>
              <p className="text-sm md:text-base text-foreground/70 leading-relaxed mb-5 max-w-xl mx-auto">
                💡 Si intentás reservar en la app antes de que te acreditemos, te va a figurar que{" "}
                <strong className="text-foreground">no tenés créditos</strong>. Es normal: tu clase
                se habilita en cuanto confirmamos tus datos por WhatsApp.
              </p>
              <a
                href={waEnviarDatos}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#25D366] text-white font-bold uppercase tracking-[0.16em] text-sm transition-all hover:opacity-90 rounded-full"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" /> Enviar mis datos ahora
              </a>
            </div>
          </div>
        </section>

        {/* ¿Qué pasa después? */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display italic uppercase text-3xl md:text-5xl font-black leading-[0.95] mb-4">
              ¿Qué pasa después?
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-primary-foreground/95 max-w-xl mx-auto mb-12">
              💰 La seña se bonifica si comprás un plan dentro de los próximos{" "}
              <strong>7 días</strong>. Tu clase tiene vigencia para usar en ese lapso.
            </p>

            <ul className="grid sm:grid-cols-2 gap-5 text-left mb-12">
              {despues.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full border-2 border-primary-foreground/70 flex items-center justify-center">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base leading-relaxed pt-1">
                    {d.emoji} {d.text}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={waDudas}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-primary-foreground text-primary font-bold uppercase tracking-[0.16em] text-sm transition-all hover:opacity-90 rounded-full"
            >
              <WhatsAppIcon className="w-5 h-5 fill-current" /> Hablar por WhatsApp
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center bg-background border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-[0.18em] mb-3"
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

export default ClaseGratisConfirmada;
