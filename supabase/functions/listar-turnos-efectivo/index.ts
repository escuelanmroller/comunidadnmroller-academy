// Lista turnos del beneficio "pago en efectivo" combinando Calendly EN VIVO
// (fuente de verdad de agendado/cancelado + datos del formulario) con la
// tabla local `pagos_efectivo` (overrides de conversión: pagó / no show / no
// pagó, cargados por el vendedor desde el panel de ventas).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { requireStaffUser } from '../_shared/auth.ts'
import { getCurrentUserUri, listEventsInRange, listInvitees, extractAnswer, uuidFromUri } from '../_shared/calendly.ts'

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

// Concurrencia limitada para no pegarle a rate limits de Calendly.
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
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
    const body = await req.json().catch(() => ({}))
    const now = new Date()
    const defaultDesde = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const defaultHasta = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const minStartTime = body?.desde ? new Date(body.desde).toISOString() : defaultDesde.toISOString()
    const maxStartTime = body?.hasta ? new Date(body.hasta).toISOString() : defaultHasta.toISOString()

    const eventTypeUri = Deno.env.get('CALENDLY_EVENT_TYPE_URI') || undefined
    const userUri = await getCurrentUserUri()
    const events = await listEventsInRange({ userUri, eventTypeUri, minStartTime, maxStartTime })

    const eventsWithInvitees = await mapWithConcurrency(events, 5, async (event) => {
      const eventUuid = uuidFromUri(event.uri)
      const invitees = await listInvitees(eventUuid)
      return { event, eventUuid, invitee: invitees[0] ?? null }
    })

    const eventUuids = eventsWithInvitees.map((e) => e.eventUuid)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: overrides, error: overridesErr } = await admin
      .from('pagos_efectivo')
      .select('*')
      .in('calendly_event_uuid', eventUuids.length > 0 ? eventUuids : ['-'])
    if (overridesErr) console.error('listar-turnos-efectivo: error leyendo overrides', overridesErr)

    const overrideByEvent = new Map((overrides ?? []).map((o) => [o.calendly_event_uuid, o]))

    const turnos = eventsWithInvitees.map(({ event, eventUuid, invitee }) => {
      const override = overrideByEvent.get(eventUuid) ?? null
      const estadoCalendly = event.status === 'canceled' ? 'cancelado' : 'agendado'
      const reprogramado = invitee?.rescheduled ?? false

      // Estado dinámico: si el cliente reprogramó, este turno viejo deja de
      // valer — pisa cualquier estado cargado (pendiente, no_show, no_pago)
      // salvo 'pagado' (un pago hecho sigue hecho). El turno nuevo que creó
      // la reprogramación aparece por su cuenta como 'pendiente'.
      let estado = override?.estado ?? (estadoCalendly === 'cancelado' ? 'cancelado' : 'pendiente')
      if (reprogramado && estado !== 'pagado') estado = 'reprogramado'

      return {
        calendly_event_uuid: eventUuid,
        calendly_invitee_uuid: invitee ? uuidFromUri(invitee.uri) : null,
        start_time: event.start_time,
        end_time: event.end_time,
        estado_calendly: estadoCalendly,
        cancellation: event.cancellation,
        reprogramado,
        nombre: invitee?.name ?? null,
        nombre_pila: invitee?.first_name ?? null,
        apellido: invitee?.last_name ?? null,
        email: invitee?.email ?? null,
        telefono: invitee ? extractAnswer(invitee, 'whatsapp') : null,
        dni: invitee ? extractAnswer(invitee, 'dni') : null,
        plan_preguntado: invitee ? extractAnswer(invitee, 'plan') : null,
        via: invitee ? extractAnswer(invitee, 'agendaste') : null,
        comentario: invitee ? extractAnswer(invitee, 'comparti') : null,
        agendado_en: invitee?.created_at ?? event.created_at ?? null,
        estado,
        plan_pagado: override?.plan_pagado ?? null,
        plan_categoria: override?.plan_categoria ?? null,
        notas: override?.notas ?? null,
        vendedor: override?.vendedor ?? null,
        confirmado_por: override?.confirmado_por ?? null,
        confirmado_en: override?.updated_at ?? null,
      }
    })

    return new Response(JSON.stringify({ ok: true, turnos }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('listar-turnos-efectivo error', e)
    return new Response(JSON.stringify({ error: 'No pudimos traer los turnos de Calendly.', message: (e as Error).message }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
