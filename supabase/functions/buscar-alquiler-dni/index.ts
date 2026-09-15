import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { APPS_SCRIPT_URL } from "../_shared/alquilerAppsScript.ts";

// Busca por DNI al alumno en la planilla de alquiler, para precargar el formulario
// de /renovar-alquiler. El token solo vive acá y en el Apps Script: sin él, el
// Web App público no responde búsquedas.
const schema = z.object({ dni: z.string().trim().min(6).max(15) });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid_input" }, 400);

    const dni = parsed.data.dni.replace(/\D/g, "");
    if (dni.length < 6) return json({ encontrado: false });

    const token = Deno.env.get("ALTA_ALQUILER_LOOKUP_TOKEN");
    if (!token) return json({ error: "missing_secret" }, 500);

    const qs = new URLSearchParams({ accion: "buscar", dni, token });
    const res = await fetch(`${APPS_SCRIPT_URL}?${qs.toString()}`, { method: "GET" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.status !== "ok") {
      console.error("[buscar-alquiler-dni] Apps Script respondió", res.status, data?.status);
      return json({ error: "lookup_failed" }, 502);
    }

    return json({ encontrado: !!data.encontrado, datos: data.encontrado ? data.datos : null });
  } catch (e) {
    console.error("buscar-alquiler-dni fatal", e);
    return json({ error: "internal_error" }, 500);
  }
});
