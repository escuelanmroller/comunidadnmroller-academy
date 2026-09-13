import { z } from 'npm:zod@3.23.8'
import { createClient } from 'npm:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set([
  'https://comunidadnmroller.com',
  'https://www.comunidadnmroller.com',
  'https://comunidadnmroller.lovable.app',
  'https://id-preview--dfe84f81-a50f-4e2f-9f25-cd53b5158069.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
])

function buildCors(origin: string | null) {
  const allowOrigin =
    origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com'))
      ? origin
      : 'https://comunidadnmroller.com'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// Tres formularios distintos del sitio llaman a esta función y todos generaban leads
// con origen 'newsletter', indistinguibles entre sí. `ubicacion` los separa sin cambiar
// el origen (que sigue siendo el formulario a efectos del dashboard y de GetResponse).
// Es opcional y con default para que una versión vieja del frontend siga funcionando.
const UBICACIONES = ['home-banner', 'landing-newsletter', 'ruta-aprendizaje'] as const

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  ubicacion: z.enum(UBICACIONES).optional(),
  // Honeypot: bots fill it, humans don't. Must be empty.
  website: z.string().max(0).optional().or(z.literal('')),
})

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req.headers.get('origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const API_KEY = Deno.env.get('GETRESPONSE_API_KEY')
    const CAMPAIGN_ID = Deno.env.get('GETRESPONSE_CAMPAIGN_ID')

    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const { name, email, website, ubicacion } = parsed.data

    // Honeypot triggered → silently accept without forwarding.
    if (website && website.length > 0) {
      return new Response(JSON.stringify({ success: true, alreadySubscribed: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- GetResponse (no bloqueante: si falla, igual guardamos el lead) ---
    let grOk = false
    let grStatus: number | null = null
    let grError: string | null = null

    if (!API_KEY || !CAMPAIGN_ID) {
      grError = 'GetResponse no configurado (falta API key o campaign id)'
      console.error(grError)
    } else {
      try {
        const res = await fetch('https://api.getresponse.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': `api-key ${API_KEY}`,
          },
          body: JSON.stringify({
            name, email,
            campaign: { campaignId: CAMPAIGN_ID },
            dayOfCycle: '0',
          }),
        })
        grStatus = res.status
        if (res.status === 202 || res.status === 200) {
          grOk = true
        } else {
          const errBody = await res.text()
          let parsedErr: any = null
          try { parsedErr = JSON.parse(errBody) } catch {}
          if (res.status === 409 || parsedErr?.code === 1008) {
            grOk = true // ya estaba suscripto → lo damos por bueno
          } else {
            grError = `GetResponse ${res.status}: ${errBody}`.slice(0, 800)
            console.error('GetResponse error', res.status, errBody)
          }
        }
      } catch (e) {
        grError = `GetResponse fetch falló: ${String(e)}`.slice(0, 800)
        console.error('GetResponse fetch falló', e)
      }
    }

    // --- Respaldo en Supabase: el lead se guarda pase lo que pase ---
    let savedBackup = false
    try {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const { error: insErr } = await admin.from('leads').insert({
        origen: 'newsletter',
        name, email, phone: null,
        // 'sin-identificar' = frontend anterior a este cambio, o una versión cacheada.
        // Se guarda explícito en vez de dejarlo vacío para poder distinguir "no lo mandó"
        // de "todavía no hubo altas desde esa ubicación".
        payload: { ubicacion: ubicacion ?? 'sin-identificar' },
        getresponse_ok: grOk,
        getresponse_status: grStatus,
        getresponse_error: grError,
      })
      if (insErr) console.error('No se pudo guardar el lead de respaldo', insErr)
      else savedBackup = true
    } catch (e) {
      console.error('Excepción guardando lead de respaldo', e)
    }

    // Éxito si GetResponse anduvo o si guardamos el respaldo (no perdemos el lead)
    if (grOk || savedBackup) {
      return new Response(JSON.stringify({ success: true, alreadySubscribed: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'No pudimos sumarte ahora. Intentá de nuevo en un rato.' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('subscribe-newsletter error', err)
    return new Response(
      JSON.stringify({ error: 'Error inesperado.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
