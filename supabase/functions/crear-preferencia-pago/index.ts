import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const schema = z.object({
  plan_slug: z.string().trim().min(1).max(60),
  origen: z.enum(["nm", "clases-alquiler", "masterclass"]).optional().default("nm"),
});

// Precios espejados de PricingSection.tsx (onlinePrice) y
// PricingAlquilerSection.tsx (transferenciaPrice). "clase-unica" existe en
// los dos catálogos con precios distintos, por eso la clave es (origen, slug).
const CATALOG: Record<string, Record<string, { title: string; unit_price: number }>> = {
  nm: {
    "clase-unica": { title: "Clase Única", unit_price: 35000 },
    "basic-fun": { title: "Basic Fun", unit_price: 69000 },
    "black-free": { title: "Black Free", unit_price: 79000 },
    "basic-fun-trimestral": { title: "Basic Fun Trimestral", unit_price: 186300 },
    "black-trimestral": { title: "Black Trimestral", unit_price: 213300 },
  },
  "clases-alquiler": {
    "clase-unica": { title: "Clase Única + Alquiler", unit_price: 39000 },
    "clase-2x1": { title: "Clase 2x1 + Alquiler", unit_price: 39000 },
    "pack-4-clases": { title: "Pack 4 Clases + Alquiler", unit_price: 95000 },
  },
};

// Masterclass tiene precio por tramo de fecha (Early Bird vs. regular) — no
// puede vivir en el CATALOG estático de arriba. Espejar cualquier cambio acá
// también en src/data/masterclasses.ts (precioVigente) — no comparten código
// porque corren en runtimes/deploys distintos (frontend vs. Edge Function).
const MASTERCLASS_EARLY_BIRD_HASTA = new Date("2026-09-20T23:59:59-03:00"); // el 20-sep incluido
const MASTERCLASS_TITLES: Record<string, string> = {
  "puerto-madero-27-septiembre": "Masterclass Puerto Madero — 27 Sep",
  // Precio alumnos NM/SportClub. Es un link público sin verificación de que
  // quien paga sea alumno de verdad — mismo nivel de confianza que ya tenía
  // el botón directo a WhatsApp de esta card.
  "puerto-madero-27-septiembre-alumnos": "Masterclass Puerto Madero — Alumnos NM/SportClub",
};

function precioMasterclass(plan_slug: string): number | null {
  const esEarlyBird = Date.now() <= MASTERCLASS_EARLY_BIRD_HASTA.getTime();
  if (plan_slug === "puerto-madero-27-septiembre") return esEarlyBird ? 29000 : 35000;
  if (plan_slug === "puerto-madero-27-septiembre-alumnos") return esEarlyBird ? 20000 : 25000;
  return null;
}

const BACK_URL = "https://comunidadnmroller.com/pago-confirmado";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "invalid_input", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { plan_slug, origen } = parsed.data;

    let item: { title: string; unit_price: number } | undefined;
    if (origen === "masterclass") {
      const title = MASTERCLASS_TITLES[plan_slug];
      const unit_price = precioMasterclass(plan_slug);
      if (title && unit_price != null) item = { title, unit_price };
    } else {
      item = CATALOG[origen]?.[plan_slug];
    }
    if (!item) {
      return new Response(
        JSON.stringify({ error: "unknown_plan", plan_slug, origen }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Si "nm" y "clases-alquiler" cobran en cuentas de Mercado Pago distintas
    // (a confirmar), cada origen usa su propio token. Si terminan siendo la
    // misma cuenta, alcanza con cargar el genérico MP_ACCESS_TOKEN.
    const specificVar = origen === "clases-alquiler" ? "MP_ACCESS_TOKEN_ALQUILER" : "MP_ACCESS_TOKEN_NM";
    const MP_ACCESS_TOKEN = Deno.env.get(specificVar) ?? Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      console.error(`crear-preferencia-pago: falta secret (${specificVar} o MP_ACCESS_TOKEN)`);
      return new Response(
        JSON.stringify({ error: "missing_secret" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const notificationUrl = SUPABASE_URL
      ? `${SUPABASE_URL}/functions/v1/mercado-pago-webhook?source_news=webhooks`
      : undefined;

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: item.title,
            quantity: 1,
            unit_price: item.unit_price,
            currency_id: "ARS",
          },
        ],
        external_reference: `${origen}:${plan_slug}`,
        notification_url: notificationUrl,
        back_urls: {
          success: BACK_URL,
          failure: BACK_URL,
          pending: BACK_URL,
        },
        auto_return: "approved",
      }),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      console.error("crear-preferencia-pago: error de Mercado Pago", mpRes.status, JSON.stringify(mpData));
      return new Response(
        JSON.stringify({ error: "mercadopago_error", status: mpRes.status, details: mpData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ init_point: mpData.init_point, sandbox_init_point: mpData.sandbox_init_point }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("crear-preferencia-pago fatal", e);
    return new Response(
      JSON.stringify({ error: "internal_error", message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
