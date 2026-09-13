// El vendedor confirma, desde el panel de ventas, qué pasó con un turno del
// beneficio "pago en efectivo": pagó (y con qué plan), no se presentó, o vino
// y no pagó. En los 3 casos el contacto entra a la misma lista de GetResponse
// (arranca su secuencia de email), con una etiqueta que distingue si pagó o
// no — así se puede armar una secuencia distinta para cada grupo.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.23.8'
import { requireStaffUser } from '../_shared/auth.ts'

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
  calendly_event_uuid: z.string().trim().min(1),
  calendly_invitee_uuid: z.string().trim().max(120).optional().nullable(),
  estado: z.enum(['pagado', 'no_show', 'no_pago']),
  vendedor: z.string().trim().min(1, 'Indicá qué vendedor gestionó este turno').max(100),
  plan_preguntado: z.string().trim().max(120).optional().nullable(),
  plan_pagado: z.string().trim().max(120).optional().nullable(),
  plan_categoria: z.enum(['nm-mensual', 'nm-trimestral', 'alquiler']).optional().nullable(),
  nombre: z.string().trim().max(120).optional().nullable(),
  nombre_pila: z.string().trim().max(120).optional().nullable(),
  apellido: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email().max(255),
  telefono: z.string().trim().max(40).optional().nullable(),
  dni: z.string().trim().max(40).optional().nullable(),
  notas: z.string().trim().max(500).optional().nullable(),
}).superRefine((d, ctx) => {
  if (d.estado === 'pagado' && !d.plan_pagado?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'plan_pagado es requerido cuando estado=pagado', path: ['plan_pagado'] })
  }
})

// Etiqueta de GetResponse según el resultado del turno (decisión del usuario:
// 2 etiquetas, no 3 — "no se presentó" y "vino y no pagó" comparten una).
const TAG_NAME: Record<z.infer<typeof BodySchema>['estado'], string> = {
  pagado: 'Pagó en efectivo',
  no_show: 'No pagó en efectivo',
  no_pago: 'No pagó en efectivo',
}

function buildNote(
  estado: string,
  plan_preguntado: string | null | undefined,
  plan_pagado: string | null | undefined,
  telefono: string | null | undefined,
  notas: string | null | undefined,
) {
  const tel = telefono ?? '-'
  if (estado === 'pagado') return `Pago en efectivo confirmado · Plan: ${plan_pagado} · Tel: ${tel}`
  if (estado === 'no_show') return `No se presentó al turno de pago en efectivo · Plan preguntado: ${plan_preguntado ?? '-'} · Tel: ${tel}`
  return `Vino al turno de pago en efectivo pero no pagó · Plan preguntado: ${plan_preguntado ?? '-'} · Tel: ${tel}${notas ? ` · Motivo: ${notas}` : ''}`
}

// Busca una etiqueta por nombre; si no existe, la crea. Evita pedirle al
// usuario que las cree a mano en GetResponse y nos pase los tagId.
async function resolveOrCreateTag(apiKey: string, name: string): Promise<string | null> {
  try {
    const query = new URLSearchParams({ 'query[name]': name, perPage: '5' })
    const getRes = await fetch(`https://api.getresponse.com/v3/tags?${query}`, {
      headers: { 'X-Auth-Token': `api-key ${apiKey}` },
    })
    if (getRes.ok) {
      const found = await getRes.json().catch(() => null)
      const match = Array.isArray(found) ? found.find((t: any) => t?.name === name) : null
      if (match?.tagId) return match.tagId
    }

    const createRes = await fetch('https://api.getresponse.com/v3/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': `api-key ${apiKey}` },
      body: JSON.stringify({ name }),
    })
    if (createRes.ok) {
      const created = await createRes.json().catch(() => null)
      return created?.tagId ?? null
    }
    console.error('resolveOrCreateTag: no se pudo crear la etiqueta', name, await createRes.text())
    return null
  } catch (e) {
    console.error('resolveOrCreateTag falló', name, e)
    return null
  }
}

// Busca un custom field por nombre; si no existe, lo crea (tipo texto). Así
// nombre y apellido llegan a GetResponse en campos separados (no en un solo
// "name" combinado), sin que el usuario tenga que crearlos a mano.
async function resolveOrCreateCustomField(apiKey: string, name: string): Promise<string | null> {
  try {
    const query = new URLSearchParams({ 'query[name]': name, perPage: '5' })
    const getRes = await fetch(`https://api.getresponse.com/v3/custom-fields?${query}`, {
      headers: { 'X-Auth-Token': `api-key ${apiKey}` },
    })
    if (getRes.ok) {
      const found = await getRes.json().catch(() => null)
      const match = Array.isArray(found) ? found.find((f: any) => f?.name === name) : null
      if (match?.customFieldId) return match.customFieldId
    }

    const createRes = await fetch('https://api.getresponse.com/v3/custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': `api-key ${apiKey}` },
      body: JSON.stringify({ name, type: 'text', hidden: false }),
    })
    if (createRes.ok) {
      const created = await createRes.json().catch(() => null)
      return created?.customFieldId ?? null
    }
    console.error('resolveOrCreateCustomField: no se pudo crear el campo', name, await createRes.text())
    return null
  } catch (e) {
    console.error('resolveOrCreateCustomField falló', name, e)
    return null
  }
}

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req.headers.get('origin'))

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const staff = await requireStaffUser(req, corsHeaders)
  if (staff instanceof Response) return staff

  try {
    const json = await req.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Datos inválidos', details: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const {
      calendly_event_uuid, calendly_invitee_uuid, estado, vendedor,
      plan_preguntado, plan_pagado, plan_categoria, nombre, nombre_pila, apellido, email, telefono, dni, notas,
    } = parsed.data

    // --- GetResponse: todo turno confirmado entra a la lista, con etiqueta según el resultado ---
    let grOk = false
    let grStatus: number | null = null
    let grError: string | null = null

    const API_KEY = Deno.env.get('GETRESPONSE_API_KEY')
    // Lista EXCLUSIVA de turnos del beneficio pago en efectivo, discriminada
    // por categoría de plan: los de clases+alquiler tienen su propia lista
    // (GETRESPONSE_CAMPAIGN_ID_PAGO_EFECTIVO_ALQUILER) y el resto va a la
    // general de pago en efectivo. Cadena de fallbacks: alquiler → pago
    // efectivo → campaign general del sitio.
    const CAMPAIGN_ID =
      (plan_categoria === 'alquiler'
        ? Deno.env.get('GETRESPONSE_CAMPAIGN_ID_PAGO_EFECTIVO_ALQUILER')
        : undefined) ??
      Deno.env.get('GETRESPONSE_CAMPAIGN_ID_PAGO_EFECTIVO') ??
      Deno.env.get('GETRESPONSE_CAMPAIGN_ID')

    if (!API_KEY || !CAMPAIGN_ID) {
      grError = 'GetResponse no configurado (falta API key o campaign id)'
      console.error(grError)
    } else {
      try {
        const [tagId, nombreFieldId, apellidoFieldId] = await Promise.all([
          resolveOrCreateTag(API_KEY, TAG_NAME[estado]),
          nombre_pila ? resolveOrCreateCustomField(API_KEY, 'Nombre') : Promise.resolve(null),
          apellido ? resolveOrCreateCustomField(API_KEY, 'Apellido') : Promise.resolve(null),
        ])

        const customFieldValues = [
          nombreFieldId && nombre_pila ? { customFieldId: nombreFieldId, value: [nombre_pila] } : null,
          apellidoFieldId && apellido ? { customFieldId: apellidoFieldId, value: [apellido] } : null,
        ].filter(Boolean)

        const res = await fetch('https://api.getresponse.com/v3/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': `api-key ${API_KEY}` },
          body: JSON.stringify({
            // "name" combinado queda solo para que el contacto se identifique
            // en el listado de GetResponse; nombre y apellido "por separado"
            // viajan en customFieldValues (custom fields "Nombre"/"Apellido").
            name: nombre || email,
            email,
            note: buildNote(estado, plan_preguntado, plan_pagado, telefono, notas),
            campaign: { campaignId: CAMPAIGN_ID },
            ...(tagId ? { tags: [tagId] } : {}),
            ...(customFieldValues.length > 0 ? { customFieldValues } : {}),
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

    // --- Guardar la conversión en Supabase (pase lo que pase con GetResponse) ---
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error: upsertErr } = await admin
      .from('pagos_efectivo')
      .upsert({
        calendly_event_uuid,
        calendly_invitee_uuid: calendly_invitee_uuid ?? null,
        estado,
        vendedor,
        plan_preguntado: plan_preguntado ?? null,
        plan_pagado: estado === 'pagado' ? plan_pagado : null,
        plan_categoria: estado === 'pagado' ? (plan_categoria ?? null) : null,
        nombre: nombre ?? null,
        email: email ?? null,
        telefono: telefono ?? null,
        dni: dni ?? null,
        notas: notas ?? null,
        confirmado_por: staff.user.email,
        getresponse_ok: grOk,
        getresponse_status: grStatus,
        getresponse_error: grError,
      }, { onConflict: 'calendly_event_uuid' })

    if (upsertErr) {
      console.error('confirmar-pago-efectivo: error guardando', upsertErr)
      return new Response(JSON.stringify({ error: 'No pudimos guardar la confirmación.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, estado, plan_pagado, getresponse_ok: grOk }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('confirmar-pago-efectivo error', e)
    return new Response(JSON.stringify({ error: 'Error inesperado.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
