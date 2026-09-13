import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { notifySlack } from "../_shared/slack.ts";

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
      nombre: z.string().trim().max(100),
      apellido: z.string().trim().max(100),
      dni: z.string().trim().max(30),
      email: z.string().trim().email().max(255),
    })
    .optional()
    .nullable(),
  notas: z.string().trim().max(1000).optional().nullable(),
});

// Mismo Apps Script que ya usa el formulario de Tiiny (registro-alumnos-alquiler.tiiny.site)
// desde mayo de 2026 — reutilizamos ese canal a la planilla "alquiler nm app NUEVO" en vez de
// armar una integración nueva con Google Sheets desde cero. Es un Web App público
// (ANYONE_ANONYMOUS), no expone nada que el propio formulario de Tiiny no exponga ya.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx_bRsm8Ct5JsOa0pq1J-eS_AjhAruTCbBprqbdi_ou3izKCXT-wckdRYVRDGu8wD9B/exec";

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
    } = parsed.data;

    const horarioTexto = `${turnoDia} ${turnoHora}hs (turno fijo)`;

    // --- Excel (planilla "alquiler nm app NUEVO", pestaña "Registros") ---
    // El Apps Script hoy solo tiene 12 columnas fijas (sin una propia para
    // casco ni acompañante) — mandamos `talle_casco` como parámetro nuevo
    // (para cuando se actualice el script y la planilla tenga su columna
    // real) Y lo dejamos también en "observaciones" como respaldo mientras
    // tanto, para no perder el dato en el medio. Sacar el respaldo de acá
    // una vez confirmado que la columna nueva funciona (ver CONTEXTO.md).
    const observacionesExtra = [
      acompanante ? `Acompañante 2x1: ${acompanante.nombre} ${acompanante.apellido}, DNI ${acompanante.dni}, ${acompanante.email}` : null,
      notas?.trim() || null,
    ].filter(Boolean).join(" · ");

    let excelOk = false;
    try {
      const params = new URLSearchParams({
        nombre,
        apellido: "",
        whatsapp: telefono,
        correo: email,
        dni,
        pack: planLabel,
        sede: sedeNombre,
        horario: horarioTexto,
        talle_calzado: talleCalzado,
        talle_ropa: talleRopa,
        talle_casco: talleCasco, // requiere el parche del Apps Script — ver CONTEXTO.md
        observaciones: `Talle casco: ${talleCasco}${observacionesExtra ? " · " + observacionesExtra : ""}`,
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { method: "GET" });
      excelOk = res.ok;
    } catch (e) {
      console.warn("[alta-alquiler] Apps Script (Excel) falló:", e);
    }

    // --- Slack (canal nuevo, no bloqueante) ---
    const slackText = [
      `*🛼 Alta de alumno · Clases + Alquiler*`,
      ``,
      `*Nombre:* ${nombre}`,
      `*DNI:* ${dni}`,
      `*WhatsApp:* ${telefono}`,
      `*Email:* ${email}`,
      `*Pack:* ${planLabel}`,
      `*Sede:* ${sedeNombre}`,
      `*Turno fijo:* ${turnoDia} ${turnoHora}hs`,
      fechas.length ? `*Fechas (${fechas.length}):* ${fechas.join(" · ")}` : null,
      `*Talle calzado:* ${talleCalzado}`,
      `*Talla ropa:* ${talleRopa}`,
      `*Talle casco:* ${talleCasco}`,
      acompanante
        ? `*Acompañante 2x1:* ${acompanante.nombre} ${acompanante.apellido} · DNI ${acompanante.dni} · ${acompanante.email}`
        : null,
      notas?.trim() ? `*Notas:* ${notas.trim()}` : null,
    ].filter(Boolean).join("\n");

    const slackOk = await notifySlack({
      channel: "alta-alquiler-alumnos",
      text: slackText,
      logTag: "[alta-alquiler]",
    });

    return new Response(
      JSON.stringify({ ok: true, slackOk, excelOk }),
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
