import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Smartphone,
  Mail,
  Users,
  Upload,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  Copy,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FlyFreePanel from "@/components/FlyFreePanel";
import AltaAlquilerForm from "@/components/alquiler/AltaAlquilerForm";
import { leerIntencionCompra, limpiarIntencionCompra } from "@/lib/intencionCompra";
import { getMasterclass, precioVigente } from "@/data/masterclasses";
import logoNM from "@/assets/Logo-NM-Rollers.png";

const PLAN_LABELS: Record<string, string> = {
  "clase-unica": "Clase Única",
  "clase-2x1": "Clase 2x1",
  "pack-4-clases": "Pack 4 Clases",
  "basic-fun": "Basic Fun",
  "black-free": "Black Free",
  "basic-fun-trimestral": "Basic Fun Trimestral",
  "black-trimestral": "Black Trimestral",
  "puerto-madero-27-septiembre": "Masterclass Puerto Madero",
  "puerto-madero-27-septiembre-alumnos": "Masterclass Puerto Madero (Alumnos)",
};

// El precio de Masterclass depende de la fecha (tramo Early Bird vs. regular,
// ver src/data/masterclasses.ts) — se calcula acá en vez de hardcodearlo para
// no repetir el número en un tercer lugar (ya está en masterclasses.ts y en
// crear-preferencia-pago). Si en el futuro hay más de una Masterclass activa
// a la vez, esto solo alcanza a la próxima — hoy es el único caso real.
const mcActual = getMasterclass("puerto-madero-27-septiembre");
const mcPrecios = mcActual ? precioVigente(mcActual) : null;

const TRANSFER_PLANS = {
  nm: [
    { slug: "clase-unica", label: "Clase Única", amount: 35000 },
    { slug: "basic-fun", label: "Basic Fun", amount: 69000 },
    { slug: "black-free", label: "Black Free", amount: 79000 },
    { slug: "basic-fun-trimestral", label: "Basic Fun Trimestral", amount: 186300 },
    { slug: "black-trimestral", label: "Black Free Trimestral", amount: 213300 },
  ],
  "clases-alquiler": [
    { slug: "clase-unica", label: "Clase Única + Alquiler", amount: 39000 },
    { slug: "clase-2x1", label: "Clase 2x1 + Alquiler", amount: 39000 },
    { slug: "pack-4-clases", label: "Pack 4 Clases + Alquiler", amount: 95000 },
  ],
  masterclass: mcPrecios
    ? [
        { slug: "puerto-madero-27-septiembre", label: "Masterclass Puerto Madero", amount: mcPrecios.generalNum },
        { slug: "puerto-madero-27-septiembre-alumnos", label: "Masterclass Puerto Madero (Alumnos)", amount: mcPrecios.alumnosNum },
      ]
    : [],
};

const MASTERCLASS_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/LpWq3IdfOVTIvyRvwFfLYx";

const TRANSFER_ALIAS = "nmroller25.mp";
const TRANSFER_OWNER = "Pisapco SRL";
const formatArs = (amount: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);

const MAX_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const PagoConfirmado = () => {
  const [searchParams] = useSearchParams();

  // external_reference viaja pegado al pago mismo (lo arma crear-preferencia-pago
  // y Mercado Pago lo devuelve solo al volver) — es la fuente confiable. El
  // query param suelto y la intención en localStorage quedan como respaldo.
  const intencion = useMemo(() => leerIntencionCompra(), []);
  const externalRef = searchParams.get("external_reference") ?? "";
  const refSepIdx = externalRef.indexOf(":");
  const refOrigen = refSepIdx > -1 ? externalRef.slice(0, refSepIdx) : null;
  const refPlan = refSepIdx > -1 ? externalRef.slice(refSepIdx + 1) : null;
  const planSlug = refPlan || searchParams.get("plan") || intencion?.plan || "";
  const planLabel = PLAN_LABELS[planSlug] ?? "";
  const origen =
    (refOrigen ?? searchParams.get("origen") ?? intencion?.origen ?? "nm").trim() || "nm";
  const isAlquiler = origen === "clases-alquiler";
  const esMasterclass = origen === "masterclass";
  const nombrePlan = esMasterclass ? "pase" : "plan";
  // Alumnos NM/SportClub ya tienen la app instalada — se salta ese paso.
  const esMasterclassAlumnos = planSlug === "puerto-madero-27-septiembre-alumnos";
  // "Volver a intentarlo" debe volver a la página de origen de la compra, no
  // siempre a los planes de la Home — cada origen tiene su propia sección de precios.
  const volverAIntentarUrl = esMasterclass
    ? `/masterclass-de-patinaje/${(planSlug || "").replace(/-alumnos$/, "")}#pases`
    : isAlquiler
      ? "/clases-de-rollers-mas-alquiler#planes-alquiler"
      : "/#planes";
  const displayPlanLabel = planLabel
    ? (isAlquiler ? `${planLabel} + Alquiler` : planLabel)
    : "";
  const returnedStatus = (searchParams.get("status") ?? searchParams.get("collection_status") ?? "").toLowerCase();
  const isRejected = returnedStatus === "rejected" || returnedStatus === "failure";
  const isPending = returnedStatus === "pending" || returnedStatus === "in_process";
  const isApproved = returnedStatus === "approved" || returnedStatus === "success";
  // Mercado Pago devuelve status=null (string literal) cuando el comprador toca
  // "Volver a la tienda" sin pagar. Sin este caso, el estado caía por descarte en
  // "aprobado" y le mostraba "¡Pago recibido!" a alguien que no pagó nada.
  const vieneDeMercadoPago =
    searchParams.has("status") || searchParams.has("collection_status") || searchParams.has("preference_id");
  const isIncompleto = vieneDeMercadoPago && !isApproved && !isRejected && !isPending;
  // Rechazado e incompleto comparten la misma salida: recuperar la venta por transferencia.
  const ofreceTransferencia = isRejected || isIncompleto;
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id") ?? "";
  const availablePlans =
    TRANSFER_PLANS[origen as keyof typeof TRANSFER_PLANS] ?? TRANSFER_PLANS.nm;
  const initialFinalPlan = availablePlans.some((plan) => plan.slug === planSlug)
    ? planSlug
    : availablePlans[0].slug;

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dni, setDni] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [finalPlanSlug, setFinalPlanSlug] = useState(initialFinalPlan);
  const finalPlan = availablePlans.find((plan) => plan.slug === finalPlanSlug) ?? availablePlans[0];
  const finalPlanLabel = finalPlan.label;

  // Mensaje de WhatsApp ya pre-llenado con los datos cargados (sin que el usuario escriba).
  const waAcreditar =
    `https://wa.me/5491165920600?text=` +
    encodeURIComponent(
      `[LP|NM|CC] ¡Hola! Soy ${nombre.trim() || "[tu nombre]"} (DNI ${dni.trim() || "[tu DNI]"}). ` +
        `Realicé el pago del ${nombrePlan} ${ofreceTransferencia ? finalPlanLabel : (displayPlanLabel || `[${nombrePlan}]`)}. ` +
        `Adjunto el comprobante y quiero que me acrediten el ${nombrePlan}. ` +
        `Mi correo ${email.trim() || "[correo]"} y WhatsApp ${telefono.trim() || "[whatsapp]"}.`,
    );

  const fileError = useMemo(() => {
    if (!file) return null;
    if (!ACCEPTED.includes(file.type)) return "Formato no permitido (usá JPG, PNG, WEBP o PDF).";
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera los ${MAX_MB}MB.`;
    return null;
  }, [file]);

  const canSubmit =
    nombre.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    telefono.trim().length >= 6 &&
    dni.trim().length >= 6 &&
    file !== null &&
    !fileError &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !file) return;
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const safeName = nombre.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const path = `${Date.now()}-${safeName}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("comprobantes-pago")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("comprobantes_pago").insert({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        plan: ofreceTransferencia ? finalPlanLabel : (displayPlanLabel || planSlug || null),
        file_path: path,
        origen,
        metodo_pago: ofreceTransferencia ? "transferencia" : "mercado-pago",
        payment_id_intento: paymentId || null,
        plan_intentado: displayPlanLabel || planSlug || null,
        plan_final_slug: ofreceTransferencia ? finalPlanSlug : planSlug || null,
        monto_final: ofreceTransferencia ? finalPlan.amount : null,
      });
      if (insErr) throw insErr;

      // Disparar GetResponse + webhook Make (no bloqueante)
      supabase.functions
        .invoke("notify-comprobante", {
          body: {
            nombre: nombre.trim(),
            email: email.trim(),
            telefono: telefono.trim(),
            plan: ofreceTransferencia ? finalPlanLabel : (displayPlanLabel || planSlug || null),
            file_path: path,
            origen,
            metodo_pago: ofreceTransferencia ? "transferencia" : "mercado-pago",
            payment_id_intento: paymentId || null,
            plan_intentado: displayPlanLabel || planSlug || null,
            plan_final_slug: ofreceTransferencia ? finalPlanSlug : planSlug || null,
            monto_final: ofreceTransferencia ? finalPlan.amount : null,
          },
        })
        .catch((e) => console.error("notify-comprobante failed", e));

      limpiarIntencionCompra();
      setDone(true);
      toast({
        title: "¡Comprobante recibido!",
        description: `Te vamos a contactar dentro de las próximas 24hs hábiles para activar tu ${nombrePlan}.`,
      });
    } catch (err: any) {
      toast({
        title: "Algo falló al subir el comprobante",
        description: err?.message ?? "Probá de nuevo en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{ofreceTransferencia ? "Completá tu compra por transferencia" : isPending ? "Pago en proceso" : "¡Pago recibido! Subí tu comprobante"} — Comunidad NM Roller</title>
        <meta
          name="description"
          content="Confirmá tu inscripción a NM Roller: adjuntá el comprobante de Mercado Pago y activamos tu plan."
        />
        <meta name="robots" content="noindex,follow" />
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
              {ofreceTransferencia ? <XCircle className="w-4 h-4" strokeWidth={3} /> : isPending ? <Clock className="w-4 h-4 animate-pulse" strokeWidth={3} /> : <AlertCircle className="w-4 h-4" strokeWidth={3} />}
              {isRejected ? "Pago rechazado" : isIncompleto ? "Pago no completado" : isPending ? "Pago en proceso" : "Pago recibido"}
            </div>
            <h1 className="font-display italic uppercase leading-[0.95] text-2xl md:text-3xl font-black mb-6">
              {isRejected ? "No pudimos procesar el pago" : isIncompleto ? "Todavía no completaste tu pago" : isPending ? "Tu pago está siendo procesado" : "¡Gracias por sumarte!"}
            </h1>
            {displayPlanLabel && (
              <p className="font-bold text-lg md:text-xl mb-4">
                {esMasterclass ? "Pase elegido" : "Plan elegido"}:{" "}
                <span className="underline decoration-primary-foreground/40 underline-offset-4">
                  {displayPlanLabel}
                </span>
              </p>
            )}
            <p className="text-base md:text-lg leading-relaxed mb-6 text-primary-foreground/95 max-w-xl mx-auto">
              {isRejected ? (
                <>Mercado Pago rechazó la operación. Evitá hacer varios intentos seguidos con la misma tarjeta: podés <strong>completar la compra por transferencia</strong> ahora mismo.</>
              ) : isIncompleto ? (
                <>Volviste sin terminar el pago en Mercado Pago, así que <strong>todavía no hay nada acreditado</strong>. Podés <Link to={volverAIntentarUrl} className="underline font-bold">volver a intentarlo</Link> o <strong>pagar por transferencia</strong> acá abajo.</>
              ) : isPending ? (
                <>Mercado Pago todavía está procesando la operación. <strong>No transfieras ni vuelvas a pagar todavía</strong> para evitar un cobro duplicado.</>
              ) : (
                esMasterclass ? (
                  <>Para <strong>reservar tu pase</strong> necesitamos un último paso: <strong>adjuntá el comprobante</strong> de Mercado Pago. Con eso confirmamos tu lugar y te enviamos las instrucciones para elegir tus 2 clases.</>
                ) : (
                  <>Para <strong>activar tu plan</strong> necesitamos un último paso: <strong>adjuntá el comprobante</strong> de Mercado Pago. Con eso te damos de alta y te enviamos las instrucciones para reservar tu primera clase.</>
                )
              )}
            </p>
            {!isPending && !isIncompleto && <p className="font-bold text-base md:text-lg">Aprendé, rolleá y disfrutá.</p>}
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

        {ofreceTransferencia && (
          <section className="pt-12 md:pt-16 px-6 bg-background">
            <div className="max-w-2xl mx-auto border-2 border-primary bg-card">
              <div className="p-6 md:p-8 pb-0">
                <p className="text-xs uppercase tracking-[0.18em] font-black text-primary mb-3">Alternativa inmediata</p>
                <h2 className="font-display italic uppercase text-xl md:text-3xl font-black mb-4">Completá tu compra por transferencia</h2>
                <p className="text-foreground/70 leading-relaxed mb-6">Podés mantener el {nombrePlan} original o elegir otro. El importe se actualiza automáticamente antes de transferir.</p>
                <label htmlFor="transfer-plan" className="block uppercase tracking-[0.12em] text-xs font-bold mb-2">
                  {esMasterclass ? "Pase que vas a comprar" : "Plan que vas a comprar"}
                </label>
                <select id="transfer-plan" value={finalPlanSlug} onChange={(event) => setFinalPlanSlug(event.target.value)} className="w-full h-12 px-3 bg-background border border-foreground/20 font-bold">
                  {availablePlans.map((plan) => <option key={plan.slug} value={plan.slug}>{plan.label} — {formatArs(plan.amount)}</option>)}
                </select>
              </div>

              {/* Datos de la transferencia — una sola tarjeta con filas, en vez de cajas sueltas */}
              <div className="mt-6 divide-y divide-foreground/10 border-y border-foreground/10">
                <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-4">
                  <span className="text-xs uppercase tracking-wider text-foreground/60">Importe</span>
                  <strong className="text-xl text-primary">{formatArs(finalPlan.amount)}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-4">
                  <span className="text-xs uppercase tracking-wider text-foreground/60">Titular</span>
                  <strong>{TRANSFER_OWNER}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 md:px-8 py-4 bg-muted">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground/60 mb-0.5">Alias</span>
                    <strong className="text-lg">{TRANSFER_ALIAS}</strong>
                  </div>
                  <Button type="button" onClick={() => { navigator.clipboard.writeText(TRANSFER_ALIAS); toast({ title: "Alias copiado", description: TRANSFER_ALIAS }); }} className="rounded-full shrink-0"><Copy className="w-4 h-4 mr-2" /> Copiar alias</Button>
                </div>
              </div>

              <p className="text-sm text-foreground/65 p-6 md:p-8 pt-5">Después de transferir, completá tus datos y subí el comprobante en el formulario de esta misma página.</p>
            </div>
          </section>
        )}

        {isPending && (
          <section className="pt-12 md:pt-16 px-6 bg-background text-center">
            <div className="max-w-2xl mx-auto border-2 border-[#F5B800] bg-[#F5B800]/10 p-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-[#F5B800]" />
              <h2 className="font-display italic uppercase text-xl md:text-3xl font-black mb-4">Esperá la confirmación</h2>
              <p className="text-foreground/75 mb-6">No realices otra transferencia por ahora. Si necesitás ayuda, escribinos y revisamos el estado de la operación.</p>
              <a href={`https://wa.me/5491165920600?text=${encodeURIComponent(`[LP-MP-PENDIENTE] Hola, mi pago del ${nombrePlan} ${displayPlanLabel || planSlug} figura pendiente. ID: ${paymentId || "sin ID"}. ¿Pueden ayudarme?`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center min-h-12 py-3 px-6 bg-[#25D366] text-white font-bold uppercase tracking-[0.12em] text-xs whitespace-normal leading-tight text-center">Consultar por WhatsApp</a>
            </div>
          </section>
        )}

        {/* 3 Pasos del pago aprobado. Se muestra siempre ANTES de subir el
            comprobante (`done` false) — recién cuando ya se subió y es
            Clases + Alquiler se oculta, porque ahí el paso siguiente real
            es el formulario de alta de equipo/turno, no estos 3 pasos
            genéricos. Para NM/Masterclass sigue igual en los dos estados. */}
        {!ofreceTransferencia && !isPending && !(isAlquiler && done) && <section className="pt-12 md:pt-16 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display italic uppercase text-xl md:text-3xl font-black text-primary text-center mb-10">
              ¿Cómo seguimos?
            </h2>
            <ol className={`grid gap-6 ${esMasterclassAlumnos ? "md:grid-cols-1 max-w-md mx-auto" : esMasterclass ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {[
                esMasterclassAlumnos ? null : {
                  Icon: Smartphone,
                  title: "Registrate en la app",
                  state: "active" as const,
                  body: (
                    <>
                      <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                        Desde <strong>Turnos Web</strong> vas a gestionar tus clases y
                        elegir horarios. Elegí tu sistema operativo para descargar 👇
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="https://play.google.com/store/apps/details?id=com.turnosweb.lite"
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
                          href="https://apps.apple.com/ar/app/turnosweb-app-2-0/id1169566678"
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

                    </>
                  ),
                },
                {
                  Icon: Mail,
                  title: "Cargá tu comprobante",
                  state: "active" as const,
                  body: (
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      💡 Una vez validado, cargaremos tu {nombrePlan} en sistema y{" "}
                      <strong>recibirás una confirmación vía WhatsApp</strong>.
                    </p>
                  ),
                },
                // Para Masterclass todavía no hay secuencia de mail armada — no prometer ese paso.
                esMasterclass ? null : {
                  Icon: Users,
                  title: "Revisá tu correo",
                  state: "next" as const,
                  body: (
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      Por allí te <strong>compartimos detalles de los pasos siguientes</strong>{" "}
                      que tenés que tomar en cuenta para una mejor experiencia.
                    </p>
                  ),
                },
              ].filter((s): s is NonNullable<typeof s> => s !== null).map((s, i) => (
                <li
                  key={i}
                  className={`relative border-2 p-6 transition-all ${
                    s.state === "active"
                      ? "border-primary bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.15)] md:-translate-y-1"
                      : "border-foreground/10 bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full font-black text-xl shrink-0 ${
                        s.state === "active"
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/10 text-foreground/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <s.Icon
                      className={`w-6 h-6 ${
                        s.state === "active" ? "text-primary" : "text-foreground/40"
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <h3 className="font-display italic uppercase font-black text-lg mb-2 leading-tight underline decoration-primary decoration-2 underline-offset-4">
                    {s.title}
                  </h3>
                  {s.body}
                </li>
              ))}

            </ol>
          </div>
        </section>}

        {/* Form upload — un solo bloque de conversión: "qué falta" + form. La advertencia
            de "es indispensable" vive DENTRO del mismo intro, no en una caja aparte, y
            todo el intro desaparece una vez `done` (ya no aplica avisar de un paso cumplido). */}
        {!isPending && <section id="seccion-comprobante" className="pt-10 pb-16 md:pb-24 px-6 bg-muted">
          <div className="max-w-2xl mx-auto">
            {!done && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.18em]">
                <AlertCircle className="w-4 h-4" /> Paso final
              </div>
              <h2 className="font-display italic uppercase text-xl md:text-2xl font-black text-primary leading-[0.95] mb-4">
                {ofreceTransferencia ? "Transferí y adjuntá tu comprobante" : "Adjuntá tu comprobante"}
              </h2>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed max-w-xl mx-auto mb-3">
                {ofreceTransferencia && (
                  <>Cuando completes la transferencia, subí el comprobante para que podamos validar el pago y activar el {nombrePlan} final que elegiste.{" "}</>
                )}
                Es <strong className="text-primary">indispensable</strong>: sin él no podemos {esMasterclass ? "reservar tu pase" : "acreditar tu plan"}.
              </p>
              <p className="text-sm md:text-base text-foreground/60 leading-relaxed max-w-xl mx-auto">
                💡 Si entrás a la app antes de que validemos tu pago, te va a figurar que{" "}
                <strong className="text-foreground/80">no tenés créditos</strong>. Es normal: tu {nombrePlan}{" "}
                se {esMasterclass ? "confirma" : "habilita"} en cuanto confirmamos el comprobante.
              </p>
            </div>
            )}

            {done ? (
              <div className="border-2 border-primary bg-background p-8 md:p-10 text-center">
                <FileCheck className="w-16 h-16 text-primary mx-auto mb-4" strokeWidth={2} />
                <h3 className="font-display italic uppercase font-black text-xl md:text-2xl text-primary mb-4">
                  ¡Comprobante recibido!
                </h3>

                <p className="uppercase tracking-[0.18em] text-xs font-black text-foreground/70 mb-3">
                  Último paso 👇
                </p>

                {/* Masterclass todavía no tiene secuencia de mail — el corazón del paso
                    final es sumarse al grupo de WhatsApp. Bloque de correo respaldado
                    (no borrado) en la rama de abajo para cuando exista esa secuencia. */}
                {esMasterclass ? (
                  <div className="border-2 border-[#25D366] bg-[#25D366]/10 p-6 md:p-7 text-center mb-8">
                    <p className="text-base md:text-lg font-bold text-foreground leading-relaxed mb-5 max-w-xl mx-auto">
                      Para una mejor experiencia, asegurate de estar en el{" "}
                      <strong>grupo de WhatsApp de la Masterclass</strong>. Ahí se informa la
                      ubicación exacta, cómo llegar, y cualquier cambio de horario, cancelación o
                      reprogramación por lluvia que pueda surgir ese día.
                    </p>
                    <a
                      href={MASTERCLASS_WHATSAPP_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-12 py-3 px-6 bg-[#25D366] text-white font-bold uppercase tracking-[0.12em] text-xs whitespace-normal leading-tight text-center"
                    >
                      Unirme al grupo de WhatsApp
                    </a>
                  </div>
                ) : (
                  <p className="text-foreground/85 leading-relaxed mb-6 max-w-md mx-auto">
                    Revisá tu correo en <strong>{email}</strong>: ahí te pasamos
                    todo lo que tenés que saber antes de empezar a rolear.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                  {!esMasterclass && (
                    <a
                      href="https://mail.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 min-h-12 py-3 px-6 bg-primary text-primary-foreground font-bold uppercase tracking-[0.18em] text-xs transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] whitespace-normal leading-tight text-center"
                    >
                      <Mail className="w-4 h-4 shrink-0" /> Abrir mi correo
                    </a>
                  )}
                  <a
                    href={waAcreditar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-12 py-3 px-6 bg-background border-2 border-[#25D366] text-[#25D366] font-bold uppercase tracking-[0.18em] text-xs transition-all hover:bg-[#25D366] hover:text-white whitespace-normal leading-tight text-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Escribinos por WhatsApp
                  </a>
                </div>

                <div className="border-t border-foreground/10 pt-5">
                  <p className="text-sm text-foreground/60 leading-relaxed max-w-md mx-auto">
                    Enviar el comprobante es <strong className="text-foreground/80">por única vez</strong>. Desde ahora
                    gestionás todo desde la app <strong className="text-foreground/80">Turnos Web</strong>:
                    comprá planes, reservá clases, cancelá turnos y enterate de novedades.
                  </p>
                </div>

                {/* Recordatorio no bloqueante: equipo y protecciones para la primera clase.
                    Para Clases + Alquiler este mismo bloque se movió a la pantalla final
                    del formulario de alta (después de confirmar turno) — acá no aplica,
                    el equipo ya viene incluido en el pack. */}
                {!isAlquiler && (
                  <div className="border-t border-foreground/10 pt-6 mt-6 text-left">
                    <div className="flex items-start gap-2 mb-3">
                      <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold uppercase text-sm tracking-wide text-foreground mb-1">
                          Preparate para tu primera clase
                        </h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          Para subirte a los rollers vas a necesitar <strong>casco y protecciones</strong>{" "}
                          (muñequeras, coderas y rodilleras). Son <strong>obligatorias</strong> — el seguro
                          solo cubre si las usás. ¿Todavía no las tenés? Alquilá tu equipo en la sede o armá
                          el tuyo 👇
                        </p>
                      </div>
                    </div>
                    <FlyFreePanel />
                  </div>
                )}

                {/* Alta de equipo/turno — solo para Clases + Alquiler, único origen
                    donde el pack incluye equipo y necesita un turno fijo asignado. */}
                {(() => {
                  const planSlugFinal = ofreceTransferencia ? finalPlanSlug : planSlug;
                  const planLabelFinal = ofreceTransferencia ? finalPlanLabel : displayPlanLabel;
                  if (!isAlquiler) return null;
                  if (planSlugFinal !== "clase-unica" && planSlugFinal !== "clase-2x1" && planSlugFinal !== "pack-4-clases") return null;
                  return (
                    <div className="border-t border-foreground/10 pt-6 mt-6">
                      <AltaAlquilerForm
                        nombre={nombre}
                        email={email}
                        telefono={telefono}
                        dni={dni}
                        planSlug={planSlugFinal}
                        planLabel={planLabelFinal || planSlugFinal}
                      />
                    </div>
                  );
                })()}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-background border-2 border-foreground/10 p-6 md:p-8 space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="uppercase tracking-[0.12em] text-xs font-bold">
                    Nombre y apellido *
                  </Label>
                  <Input
                    id="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Laura Pérez"
                    maxLength={100}
                    className="rounded-none border-foreground/20 h-12"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="uppercase tracking-[0.12em] text-xs font-bold">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      maxLength={150}
                      className="rounded-none border-foreground/20 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="telefono"
                      className="uppercase tracking-[0.12em] text-xs font-bold"
                    >
                      Teléfono / WhatsApp *
                    </Label>
                    <Input
                      id="telefono"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="11 5555 5555"
                      maxLength={30}
                      className="rounded-none border-foreground/20 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni" className="uppercase tracking-[0.12em] text-xs font-bold">
                    DNI *
                  </Label>
                  <Input
                    id="dni"
                    required
                    inputMode="numeric"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="DNI (sin puntos)"
                    maxLength={20}
                    className="rounded-none border-foreground/20 h-12"
                  />
                </div>

                {ofreceTransferencia ? (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-[0.12em] text-xs font-bold">
                      {esMasterclass ? "Pase final por transferencia" : "Plan final por transferencia"}
                    </Label>
                    <div className="min-h-12 px-3 py-3 flex items-center justify-between gap-3 bg-muted border border-foreground/10 font-bold text-foreground"><span>{finalPlanLabel}</span><span className="text-primary">{formatArs(finalPlan.amount)}</span></div>
                  </div>
                ) : displayPlanLabel && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-[0.12em] text-xs font-bold">
                      {esMasterclass ? "Pase" : "Plan"}
                    </Label>
                    <div className="h-12 px-3 flex items-center bg-muted border border-foreground/10 font-bold text-foreground">
                      {displayPlanLabel}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="comprobante"
                    className="uppercase tracking-[0.12em] text-xs font-bold"
                  >
                    Comprobante de pago *
                  </Label>
                  <label
                    htmlFor="comprobante"
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed p-6 cursor-pointer transition-colors ${
                      fileError
                        ? "border-destructive bg-destructive/5"
                        : file
                          ? "border-primary bg-primary/5"
                          : "border-foreground/20 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {file ? (
                      <>
                        <FileCheck className="w-8 h-8 text-primary" />
                        <span className="font-bold text-sm break-all text-center">
                          {file.name}
                        </span>
                        <span className="text-xs text-foreground/60">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · Tocá para cambiar
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-foreground/40" />
                        <span className="font-bold text-sm">
                          Tocá para seleccionar archivo
                        </span>
                        <span className="text-xs text-foreground/60">
                          JPG, PNG, WEBP o PDF · máx. {MAX_MB}MB
                        </span>
                      </>
                    )}
                    <input
                      id="comprobante"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {fileError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {fileError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full min-h-14 py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.18em] text-sm transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] disabled:opacity-50 whitespace-normal leading-tight"
                >
                  {submitting ? "Enviando..." : `Enviar comprobante y activar ${nombrePlan}`}
                </Button>
                <p className="text-xs text-center text-foreground/50">
                  Al enviar aceptás que te contactemos para confirmar tu inscripción.
                </p>
              </form>
            )}
          </div>
        </section>}

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
    </>
  );
};

export default PagoConfirmado;
