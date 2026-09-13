import { createClient } from "npm:@supabase/supabase-js@2";

type MpNotification = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

const PLAN_LABELS: Record<string, string> = {
  "clase-unica": "Clase Única",
  "clase-2x1": "Clase 2x1",
  "pack-4-clases": "Pack 4 Clases",
  "basic-fun": "Basic Fun",
  "black-free": "Black Free",
  "basic-fun-trimestral": "Basic Fun Trimestral",
  "black-trimestral": "Black Trimestral",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const hexToBytes = (hex: string) => {
  if (!/^[a-f0-9]{64}$/i.test(hex)) return null;
  return new Uint8Array(hex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
};

const hasValidSignature = async (
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
) => {
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => part.trim().split("=", 2)),
  );
  const ts = parts.ts;
  const signature = parts.v1 ? hexToBytes(parts.v1) : null;
  if (!ts || !signature || !xRequestId || !dataId) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  return crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(manifest));
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const url = new URL(req.url);
    const body = await req.json() as MpNotification;
    const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "").trim();
    const type = url.searchParams.get("type") ?? body.type ?? "";

    // Mercado Pago puede notificar otros tópicos a la misma URL.
    if (type !== "payment" || !dataId) return json({ ok: true, ignored: true });

    const webhookSecret = Deno.env.get("MP_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("mercado-pago-webhook: falta MP_WEBHOOK_SECRET");
      return json({ error: "missing_webhook_secret" }, 500);
    }

    const signatureIsValid = await hasValidSignature(
      req.headers.get("x-signature") ?? "",
      req.headers.get("x-request-id") ?? "",
      dataId,
      webhookSecret,
    );
    if (!signatureIsValid) {
      console.warn("mercado-pago-webhook: firma inválida", dataId);
      return json({ error: "invalid_signature" }, 401);
    }

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) return json({ error: "missing_access_token" }, 500);

    // La notificación solo trae el ID: siempre consultar el recurso real.
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!paymentRes.ok) {
      const details = await paymentRes.text();
      console.error("mercado-pago-webhook: GET payment falló", paymentRes.status, details);
      return json({ error: "payment_lookup_failed" }, 502);
    }

    const payment = await paymentRes.json();
    const externalReference = typeof payment.external_reference === "string"
      ? payment.external_reference
      : null;
    const separator = externalReference?.indexOf(":") ?? -1;
    const origen = separator > -1 ? externalReference!.slice(0, separator) : null;
    const planSlug = separator > -1 ? externalReference!.slice(separator + 1) : null;
    const safeOrigen = origen === "nm" || origen === "clases-alquiler" ? origen : null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRole);
    const now = new Date().toISOString();

    const { error: upsertError } = await admin.from("mercado_pago_pagos").upsert({
      payment_id: String(payment.id),
      preference_id: payment.preference_id ?? null,
      merchant_order_id: payment.order?.id ? String(payment.order.id) : null,
      external_reference: externalReference,
      origen: safeOrigen,
      plan_slug: planSlug,
      plan_label: planSlug ? (PLAN_LABELS[planSlug] ?? null) : null,
      transaction_amount: payment.transaction_amount ?? null,
      currency_id: payment.currency_id ?? null,
      status: payment.status ?? "unknown",
      status_detail: payment.status_detail ?? null,
      payment_method_id: payment.payment_method_id ?? null,
      payment_type_id: payment.payment_type_id ?? null,
      live_mode: payment.live_mode ?? null,
      payer_email: payment.payer?.email ?? null,
      date_created: payment.date_created ?? null,
      date_approved: payment.date_approved ?? null,
      raw_payment: payment,
      updated_at: now,
    }, { onConflict: "payment_id" });

    if (upsertError) {
      console.error("mercado-pago-webhook: upsert falló", upsertError);
      return json({ error: "database_error" }, 500);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("mercado-pago-webhook fatal", error);
    return json({ error: "internal_error" }, 500);
  }
});
