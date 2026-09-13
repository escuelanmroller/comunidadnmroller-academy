import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { notifySlack } from "../_shared/slack.ts";

const schema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  telefono: z.string().trim().min(3).max(40),
  plan: z.string().trim().max(80).optional().nullable(),
  file_path: z.string().trim().min(1).max(500),
  origen: z.enum(["nm", "clases-alquiler", "masterclass"]).optional().default("nm"),
  metodo_pago: z.enum(["mercado-pago", "transferencia"]).optional().default("mercado-pago"),
  payment_id_intento: z.string().trim().max(80).optional().nullable(),
  plan_intentado: z.string().trim().max(100).optional().nullable(),
  plan_final_slug: z.string().trim().max(80).optional().nullable(),
  monto_final: z.number().positive().optional().nullable(),
});

const BUCKET = "comprobantes-pago";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 días

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
    const { nombre, email, telefono, plan, file_path, origen, metodo_pago, payment_id_intento, plan_intentado, plan_final_slug, monto_final } = parsed.data;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GR_API_KEY = Deno.env.get("GETRESPONSE_API_KEY");
    const GR_CAMPAIGN_ID = origen === "clases-alquiler"
      ? Deno.env.get("GETRESPONSE_CAMPAIGN_ID_COMPROBANTES_ALQUILER")
      : origen === "masterclass"
        ? Deno.env.get("GETRESPONSE_CAMPAIGN_ID_MASTERCLASS")
        : Deno.env.get("GETRESPONSE_CAMPAIGN_ID_COMPROBANTES");
    const MAKE_URL = origen === "clases-alquiler"
      ? Deno.env.get("MAKE_WEBHOOK_COMPROBANTES_ALQUILER_URL")
      : Deno.env.get("MAKE_WEBHOOK_COMPROBANTES_URL");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1) Signed URL del comprobante (7 días)
    let comprobante_url: string | null = null;
    let signedErr: string | null = null;
    const { data: signed, error: signErr } = await admin
      .storage
      .from(BUCKET)
      .createSignedUrl(file_path, SIGNED_URL_TTL);
    if (signErr) {
      signedErr = signErr.message;
      console.error("signed url error", signErr);
    } else {
      comprobante_url = signed?.signedUrl ?? null;
    }

    // 2) GetResponse + Make en paralelo
    const tasks: Promise<{ target: string; ok: boolean; status?: number; body?: unknown; error?: string }>[] = [];

    // GetResponse
    if (GR_API_KEY && GR_CAMPAIGN_ID) {
      tasks.push((async () => {
        try {
          const res = await fetch("https://api.getresponse.com/v3/contacts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Auth-Token": `api-key ${GR_API_KEY}`,
            },
            body: JSON.stringify({
              email,
              name: nombre,
              campaign: { campaignId: GR_CAMPAIGN_ID },
              note: [
                origen === "clases-alquiler"
                  ? "Comprobante · Clases + Alquiler"
                  : origen === "masterclass"
                    ? "Comprobante · Masterclass"
                    : "Comprobante · Plan NM",
                plan ? `Plan: ${plan}` : null,
                telefono ? `Tel: ${telefono}` : null,
              ].filter(Boolean).join(" · "),
            }),
          });
          const text = await res.text();
          return { target: "getresponse", ok: res.ok, status: res.status, body: text };
        } catch (e) {
          return { target: "getresponse", ok: false, error: (e as Error).message };
        }
      })());
    } else {
      tasks.push(Promise.resolve({ target: "getresponse", ok: false, error: "missing_secrets" }));
    }

    // Make webhook
    if (MAKE_URL) {
      tasks.push((async () => {
        try {
          const res = await fetch(MAKE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre,
              email,
              telefono,
              plan: plan ?? null,
              origen,
              metodo_pago,
              payment_id_intento,
              plan_intentado,
              plan_final_slug,
              monto_final,
              comprobante_url,
              comprobante_path: file_path,
              created_at: new Date().toISOString(),
              source: "comunidadnmroller.lovable.app",
            }),
          });
          const text = await res.text();
          return { target: "make", ok: res.ok, status: res.status, body: text };
        } catch (e) {
          return { target: "make", ok: false, error: (e as Error).message };
        }
      })());
    } else {
      tasks.push(Promise.resolve({ target: "make", ok: false, error: "missing_secret" }));
    }

    const settled = await Promise.allSettled(tasks);
    const results = settled.map((s) => s.status === "fulfilled" ? s.value : { target: "unknown", ok: false, error: String(s.reason) });
    console.log("notify-comprobante results", JSON.stringify({ email, plan, origen, signedErr, results }));

    // --- Slack (no bloqueante) ---
    const iconoMetodo = metodo_pago === "transferencia" ? "🏦" : "💳";
    const tipo = origen === "clases-alquiler"
      ? `${iconoMetodo} Compra confirmada · Clases + Alquiler`
      : origen === "masterclass"
        ? `${iconoMetodo} Compra confirmada · Masterclass`
        : `${iconoMetodo} Compra confirmada · Plan NM`;
    const slackText = [
      `*${tipo}*`,
      ``,
      `*Nombre:* ${nombre}`,
      `*Email:* ${email}`,
      `*Tel:* ${telefono}`,
      plan ? `*Plan:* ${plan}` : null,
      `*Método final:* ${metodo_pago === "transferencia" ? "Transferencia" : "Mercado Pago"}`,
      monto_final ? `*Monto final:* $${monto_final.toLocaleString("es-AR")}` : null,
      plan_intentado && plan_intentado !== plan ? `*Plan intentado en MP:* ${plan_intentado}` : null,
      payment_id_intento ? `*Payment ID original:* ${payment_id_intento}` : null,
      comprobante_url ? `*Comprobante:* <${comprobante_url}|Ver comprobante (7 días)>` : `*Comprobante:* ${file_path}`,
    ].filter(Boolean).join("\n");
    const slackChannel = origen === "clases-alquiler"
      ? "venta-alquiler-clases"
      : origen === "masterclass"
        ? "venta-pase-masterclass"
        : "venta-de-planes";
    await notifySlack({ channel: slackChannel, text: slackText, logTag: `[comprobante:${origen}]` });

    return new Response(
      JSON.stringify({ ok: true, comprobante_url_generated: !!comprobante_url, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("notify-comprobante fatal", e);
    return new Response(
      JSON.stringify({ error: "internal_error", message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
