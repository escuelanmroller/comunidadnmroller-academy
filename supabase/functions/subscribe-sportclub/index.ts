import { z } from 'npm:zod@3.23.8'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { notifySlack } from '../_shared/slack.ts'

const ALLOWED_ORIGINS = new Set([
  'https://comunidadnmroller.com',
  'https://www.comunidadnmroller.com',
  'https://lp.comunidadnmroller.com',
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

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  // sede/nivel: obligatorios en el alta del beneficio gratis (form principal),
  // ausentes cuando el envío viene del modal de compra directa de un plan pago
  // (ComprarPlanDialog) — esos planes no atan a una sede/turno puntual.
  sede: z.string().trim().max(120).optional(),
  plan: z.string().trim().min(1).max(60),
  nivel: z.string().trim().max(60).optional(),
  // Solo viene del modal de compra: qué plan pago quiere (Plan Full / 4 Clases + Alquiler).
  planPago: z.string().trim().max(80).optional(),
  // Solo relevante si alquiler="si" y viene de Plan Full: ya tiene rollers,
  // solo necesita protecciones (no aplica al pack, que ya incluye todo).
  soloProtecciones: z.boolean().optional(),
  alquiler: z.string().trim().max(80).optional(),
  rental: z.string().trim().max(80).optional(),
  necesitaAlquiler: z.string().trim().max(80).optional(),
  equipo: z.string().trim().max(80).optional(),
  // Honeypot: bots lo completan, humanos no. Debe ir vacío.
  website: z.string().max(0).optional().or(z.literal('')),
})

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getAlquilerLabel(rawValue?: string | null) {
  const cleanValue = rawValue?.trim()
  if (!cleanValue) return 'No indicado'

  const normalized = normalizeText(cleanValue)
  if (['si', 's', 'yes', 'true'].includes(normalized) || normalized.includes('necesit')) {
    return 'Sí, voy a necesitar alquilar equipo'
  }
  if (['no', 'n', 'false'].includes(normalized) || normalized.includes('propio')) {
    return 'No, tengo mi propio equipo'
  }
  if (normalized.includes('consider') || normalized.includes('pensando') || normalized.includes('comprar')) {
    return 'Estoy pensando en comprar mi propio equipo'
  }

  return cleanValue
}

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req.headers.get('origin'))

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const API_KEY = Deno.env.get('GETRESPONSE_API_KEY')
    // Lista EXCLUSIVA de socios SportClub. Si no está seteada, cae al campaign general.
    const CAMPAIGN_ID =
      Deno.env.get('GETRESPONSE_CAMPAIGN_ID_SPORTCLUB') ??
      Deno.env.get('GETRESPONSE_CAMPAIGN_ID')

    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { name, email, phone, sede, plan, nivel, planPago, soloProtecciones, website } = parsed.data
    const alquiler = parsed.data.alquiler ?? parsed.data.rental ?? parsed.data.necesitaAlquiler ?? parsed.data.equipo

    // Honeypot disparado → aceptar en silencio sin reenviar.
    if (website && website.length > 0) {
      return new Response(JSON.stringify({ success: true, alreadySubscribed: false }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const alquilerLabel = getAlquilerLabel(alquiler) + (soloProtecciones ? ' (ya tiene rollers, solo protecciones)' : '')
    const esCompraDirecta = Boolean(planPago)

    const note = [
      esCompraDirecta ? `Compra directa SportClub · Plan pago: ${planPago}` : 'Socio SportClub',
      `Plan SportClub: ${plan}`,
      sede ? `Sede: ${sede}` : null,
      nivel ? `Nivel: ${nivel}` : null,
      `Tel: ${phone}`,
      `Alquiler: ${alquilerLabel}`,
    ].filter(Boolean).join(' · ')

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
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': `api-key ${API_KEY}` },
          body: JSON.stringify({
            name, email, note,
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
        origen: 'sportclub',
        name, email, phone,
        payload: { plan, sede, nivel, alquiler, planPago, soloProtecciones: soloProtecciones ?? null },
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
      console.log('[sportclub] payload recibido', {
        plan, sede, nivel, planPago: planPago ?? null, alquiler: alquiler ?? null, alquiler_label: alquilerLabel,
      })

      // --- Slack (no bloqueante) ---
      // Título y líneas cambian si viene de ComprarPlanDialog (compra directa de un
      // plan pago, sin sede/nivel) en vez del alta del beneficio gratis (form principal).
      const slackText = [
        esCompraDirecta ? `*🛒 Quiere comprar: ${planPago}*` : `*💪 Nuevo socio SportClub*`,
        ``,
        `*Nombre:* ${name}`,
        `*Email:* ${email}`,
        `*Tel:* ${phone}`,
        `*Plan SportClub:* ${plan}`,
        sede ? `*Sede:* ${sede}` : null,
        nivel ? `*Nivel:* ${nivel}` : null,
        `*Alquiler:* ${alquilerLabel}`,
      ].filter(Boolean).join('\n')
      await notifySlack({ channel: 'registro-socios-sportclub', text: slackText, logTag: '[sportclub]' })

      return new Response(JSON.stringify({ success: true, alreadySubscribed: false }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'No pudimos registrarte. Intentá de nuevo.' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('subscribe-sportclub error', err)
    return new Response(JSON.stringify({ error: 'Error inesperado.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
