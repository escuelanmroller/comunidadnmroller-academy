// Cliente mínimo de la API de Calendly v2, usado server-side por
// listar-turnos-efectivo. El CALENDLY_API_TOKEN (Personal Access Token)
// nunca se expone al frontend.
const CALENDLY_BASE = 'https://api.calendly.com'
const MAX_PAGES = 10 // tope de seguridad para evitar loops infinitos de paginación

function calendlyToken() {
  const token = Deno.env.get('CALENDLY_API_TOKEN')
  if (!token) throw new Error('CALENDLY_API_TOKEN no configurado')
  return token
}

export async function calendlyFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${CALENDLY_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${calendlyToken()}` },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Calendly ${res.status} en ${path}: ${body.slice(0, 300)}`)
  }

  return res.json()
}

export async function getCurrentUserUri(): Promise<string> {
  const data = await calendlyFetch('/users/me')
  return data.resource.uri as string
}

export interface CalendlyEvent {
  uri: string
  status: 'active' | 'canceled'
  start_time: string
  end_time: string
  created_at: string
  cancellation: { canceled_by: string; reason: string | null; canceler_type: string } | null
}

export async function listEventsInRange(opts: {
  userUri: string
  eventTypeUri?: string
  minStartTime: string
  maxStartTime: string
}): Promise<CalendlyEvent[]> {
  const events: CalendlyEvent[] = []
  let pageToken: string | undefined
  let page = 0

  do {
    const params: Record<string, string> = {
      user: opts.userUri,
      min_start_time: opts.minStartTime,
      max_start_time: opts.maxStartTime,
      count: '100',
      sort: 'start_time:desc',
    }
    if (opts.eventTypeUri) params.event_type = opts.eventTypeUri
    if (pageToken) params.page_token = pageToken

    const data = await calendlyFetch('/scheduled_events', params)
    events.push(...(data.collection ?? []))
    pageToken = data.pagination?.next_page_token || undefined
    page++
  } while (pageToken && page < MAX_PAGES)

  return events
}

export interface CalendlyInvitee {
  uri: string
  name: string
  first_name: string | null
  last_name: string | null
  email: string
  status: 'active' | 'canceled'
  questions_and_answers: { question: string; answer: string; position: number }[]
  rescheduled: boolean
  new_invitee: string | null
  cancellation: { canceled_by: string; reason: string | null; canceler_type: string } | null
  created_at: string
}

export async function listInvitees(eventUuid: string): Promise<CalendlyInvitee[]> {
  const invitees: CalendlyInvitee[] = []
  let pageToken: string | undefined
  let page = 0

  do {
    const params: Record<string, string> = { count: '100' }
    if (pageToken) params.page_token = pageToken

    const data = await calendlyFetch(`/scheduled_events/${eventUuid}/invitees`, params)
    invitees.push(...(data.collection ?? []))
    pageToken = data.pagination?.next_page_token || undefined
    page++
  } while (pageToken && page < MAX_PAGES)

  return invitees
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Busca la respuesta a la pregunta cuyo texto contiene `keyword` (ej. 'plan',
// 'dni', 'whatsapp'). Las preguntas de Calendly son texto libre configurado
// en el evento, por eso se matchea por contenido y no por posición fija.
export function extractAnswer(invitee: CalendlyInvitee, keyword: string): string | null {
  const target = normalize(keyword)
  const match = invitee.questions_and_answers?.find((qa) => normalize(qa.question).includes(target))
  return match?.answer?.trim() || null
}

export function uuidFromUri(uri: string): string {
  return uri.split('/').pop() ?? uri
}
