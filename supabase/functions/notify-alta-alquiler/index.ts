import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { notifySlack } from "../_shared/slack.ts";
import { APPS_SCRIPT_URL } from "../_shared/alquilerAppsScript.ts";

const schema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  telefono: z.string().trim().min(3).max(40),
  dni: z.string().trim().min(3).max(30),
  planLabel: z.string().trim().min(1).max(100),
  planSlug: z.enum(["clase-unica", "clase-2x1", "pack-4-clases"]),
  sedeNombre: z.string().trim().min(1).max(100),
  turnoDia: z.string().trim().min(1).max(20),
  turnoHora: z.string().trim().min(1).max(10),
  fechas: z.array(z.string()).optional().default([]),
  talleCalzado: z.string().trim().max(60), // puede ser "no aplica" si ya tiene rollers
  talleRopa: z.string().trim().max(10),
  talleCasco: z.string().trim().max(10),
  acompanante: z
    .object({
      pendiente: z.boolean().optional().default(false),
      nombre: z.string().trim().max(100).optional(),
      apellido: z.string().trim().max(100).optional(),
      dni: z.string().trim().max(30).optional(),
      email: z.string().trim().email().max(255).optional(),
      talleCalzado: z.string().trim().max(60).optional(),
      talleRopa: z.string().trim().max(10).optional(),
      talleCasco: z.string().trim().max(10).optional(),
    })
    .optional()
    .nullable(),
  notas: z.string().trim().max(1000).optional().nullable(),
  // Solo /renovar-alquiler (link que manda la asesora a quien ya pagó por fuera de la web).
  origen: z.enum(["compra-web", "renovacion"]).optional().default("compra-web"),
  comprobantePath: z.string().trim().max(500).optional().nullable(),
});

// Mismo bucket que los comprobantes de la compra web (PagoConfirmado.tsx).
const BUCKET_COMPROBANTES = "comprobantes-pago";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

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
    const {
      nombre, email, telefono, dni, planLabel, planSlug,
      sedeNombre, turnoDia, turnoHora, fechas,
      talleCalzado, talleRopa, talleCasco, acompanante, notas,
      origen, comprobantePath,
    } = parsed.data;
    const esRenovacion = origen === "renovacion";

    let comprobanteUrl: string | null = null;
    if (comprobantePath) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: signed, error: signErr } = await admin.storage
        .from(BUCKET_COMPROBANTES)
        .createSignedUrl(comprobantePath, SIGNED_URL_TTL);
      if (signErr) console.error("[alta-alquiler] signed url error", signErr);
      comprobanteUrl = signed?.signedUrl ?? null;
    }

    // Turno fijo semanal + la(s) fecha(s) real(es) que ya vienen calculadas del
    // frontend — para que quien prepara el equipo no tenga que inferir a qué
    // día del calendario corresponde "Martes 19hs".
    const horarioTexto = `${turnoDia} ${turnoHora}hs (turno fijo)${fechas.length ? " — " + fechas.join(", ") : ""}`;

    // Texto del acompañante 2x1 — o bien viene completo (identidad + equipo),
    // o el comprador marcó que todavía no tiene los datos y los manda después
    // por WhatsApp. En los dos casos queda registrado, para que el equipo
    // pueda hacer seguimiento si quedó "pendiente".
    const acompananteTexto = !acompanante
      ? null
      : acompanante.pendiente
        ? "PENDIENTE — el comprador mandó los datos del acompañante después, por WhatsApp"
        : `${acompanante.nombre} ${acompanante.apellido} · DNI ${acompanante.dni} · ${acompanante.email} · Calzado: ${acompanante.talleCalzado} · Ropa: ${acompanante.talleRopa} · Casco: ${acompanante.talleCasco}`;

    // --- Excel (planilla "alquiler nm app NUEVO", pestaña "Registros") ---
    // El Apps Script hoy solo tiene 12 columnas fijas (sin una propia para
    // casco ni acompañante) — mandamos `talle_casco` como parámetro nuevo
    // (para cuando se actualice el script y la planilla tenga su columna
    // real) Y lo dejamos también en "observaciones" como respaldo mientras
    // tanto, para no perder el dato en el medio. Sacar el respaldo de acá
    // una vez confirmado que la columna nueva funciona (ver CONTEXTO.md).
    const observacionesExtra = [
      esRenovacion ? `RENOVACIÓN (pagó por fuera de la web${comprobantePath ? `, comprobante: ${comprobantePath}` : ""})` : null,
      acompananteTexto ? `Acompañante 2x1: ${acompananteTexto}` : null,
      notas?.trim() || null,
    ].filter(Boolean).join(" · ");

    const packBase = planSlug === "clase-2x1" ? `${planLabel} · 2X1` : planLabel;
    const packEtiquetado = esRenovacion ? `${packBase} · RENOVACIÓN` : packBase;

    const enviarFilaExcel = async (params: Record<string, string>) => {
      try {
        const qs = new URLSearchParams(params);
        const res = await fetch(`${APPS_SCRIPT_URL}?${qs.toString()}`, { method: "GET" });
        return res.ok;
      } catch (e) {
        console.warn("[alta-alquiler] Apps Script (Excel) falló:", e);
        return false;
      }
    };

    // Fila del comprador principal.
    const excelOk = await enviarFilaExcel({
      nombre,
      apellido: "",
      whatsapp: telefono,
      correo: email,
      dni,
      pack: packEtiquetado,
      sede: sedeNombre,
      horario: horarioTexto,
      talle_calzado: talleCalzado,
      talle_ropa: talleRopa,
      talle_casco: talleCasco, // requiere el parche del Apps Script — ver CONTEXTO.md
      observaciones: `Talle casco: ${talleCasco}${observacionesExtra ? " · " + observacionesExtra : ""}`,
    });

    // Fila propia del acompañante 2x1 — solo si ya tenemos sus datos completos
    // (no cuando quedó "pendiente"). Comparte sede/turno con el comprador,
    // pero necesita su propia fila porque también hay que prepararle equipo.
    let excelOkAcompanante: boolean | null = null;
    if (acompanante && !acompanante.pendiente) {
      excelOkAcompanante = await enviarFilaExcel({
        nombre: acompanante.nombre ?? "",
        apellido: acompanante.apellido ?? "",
        whatsapp: "",
        correo: acompanante.email ?? "",
        dni: acompanante.dni ?? "",
        pack: `${planLabel} · 2X1 — ACOMPAÑANTE`,
        sede: sedeNombre,
        horario: horarioTexto,
        talle_calzado: acompanante.talleCalzado ?? "",
        talle_ropa: acompanante.talleRopa ?? "",
        talle_casco: acompanante.talleCasco ?? "",
        observaciones: `Acompañante 2x1 de ${nombre} (DNI ${dni})`,
      });
    }

    // --- GetResponse (solo /renovar-alquiler) ---
    // Quien compra por la web ya entra a esta lista antes, al subir el comprobante
    // principal (notify-comprobante) — sumarlo de nuevo acá sería duplicado. Pero
    // quien renueva por el link de la asesora puede no haber pasado nunca por la
    // web, así que sin esto se quedaba afuera de la lista para siempre.
    let getresponseOk: boolean | null = null;
    if (esRenovacion) {
      const GR_API_KEY = Deno.env.get("GETRESPONSE_API_KEY");
      const GR_CAMPAIGN_ID = Deno.env.get("GETRESPONSE_CAMPAIGN_ID_COMPROBANTES_ALQUILER");
      if (GR_API_KEY && GR_CAMPAIGN_ID) {
        try {
          const grHeaders = { "Content-Type": "application/json", "X-Auth-Token": `api-key ${GR_API_KEY}` };
          // Tag real (no la "note" de texto libre) para poder filtrar/segmentar
          // "renovación" del resto de la campaña dentro de GetResponse.
          const TAG_NAME = "Renovación alquiler";
          const buscar = await fetch(
            `https://api.getresponse.com/v3/tags?query[name]=${encodeURIComponent(TAG_NAME)}`,
            { headers: grHeaders },
          );
          const encontrados = buscar.ok ? await buscar.json().catch(() => []) : [];
          let tagId = Array.isArray(encontrados)
            ? encontrados.find((t: { name?: string }) => t.name === TAG_NAME)?.tagId
            : undefined;
          if (!tagId) {
            const crear = await fetch("https://api.getresponse.com/v3/tags", {
              method: "POST",
              headers: grHeaders,
              body: JSON.stringify({ name: TAG_NAME }),
            });
            const creado = await crear.json().catch(() => null);
            tagId = creado?.tagId;
            if (!crear.ok || !tagId) console.error("[alta-alquiler] no se pudo crear la tag GetResponse", creado);
          }

          const res = await fetch("https://api.getresponse.com/v3/contacts", {
            method: "POST",
            headers: grHeaders,
            body: JSON.stringify({
              email,
              name: nombre,
              campaign: { campaignId: GR_CAMPAIGN_ID },
              ...(tagId ? { tags: [{ tagId }] } : {}),
              note: `Renovación de alquiler (link asesora) · Pack: ${packEtiquetado} · Tel: ${telefono}`,
            }),
          });
          getresponseOk = res.ok;
          if (!res.ok) console.error("[alta-alquiler] GetResponse respondió", res.status, await res.text().catch(() => ""));
        } catch (e) {
          getresponseOk = false;
          console.error("[alta-alquiler] GetResponse falló", e);
        }
      } else {
        getresponseOk = false;
      }
    }

    // --- Slack (canal nuevo, no bloqueante) ---
    const slackText = [
      `*${esRenovacion ? "🔁 Renovación de alquiler (link asesora)" : "🛼 Alta de alumno · Clases + Alquiler"}${planSlug === "clase-2x1" ? " · 👥 2X1" : ""}*`,
      ``,
      `*Nombre:* ${nombre}`,
      `*DNI:* ${dni}`,
      `*WhatsApp:* ${telefono}`,
      `*Email:* ${email}`,
      `*Pack:* ${packEtiquetado}`,
      `*Sede:* ${sedeNombre}`,
      `*Turno fijo:* ${turnoDia} ${turnoHora}hs`,
      fechas.length ? `*Fechas (${fechas.length}):* ${fechas.join(" · ")}` : null,
      `*Talle calzado:* ${talleCalzado}`,
      `*Talla ropa:* ${talleRopa}`,
      `*Talle casco:* ${talleCasco}`,
      acompananteTexto ? `*Acompañante 2x1:* ${acompananteTexto}` : null,
      notas?.trim() ? `*Notas:* ${notas.trim()}` : null,
      comprobanteUrl
        ? `*Comprobante:* <${comprobanteUrl}|Ver comprobante (7 días)>`
        : comprobantePath ? `*Comprobante:* ${comprobantePath}` : null,
    ].filter(Boolean).join("\n");

    const slackOk = await notifySlack({
      channel: "alta-alquiler-alumnos",
      text: slackText,
      logTag: "[alta-alquiler]",
    });

    return new Response(
      JSON.stringify({ ok: true, slackOk, excelOk, excelOkAcompanante, getresponseOk }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("notify-alta-alquiler fatal", e);
    return new Response(
      JSON.stringify({ error: "internal_error", message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
