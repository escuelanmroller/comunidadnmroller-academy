// Envía mensajes a Slack.
// 1) Si existe un webhook propio para el canal, lo usa.
// 2) Si no existe, usa el Slack Connector de Lovable con LOVABLE_API_KEY + SLACK_API_KEY.

const WEBHOOK_SECRETS: Record<string, string> = {
  'sugerencias-usuarios':      'SLACK_WEBHOOK_SUGERENCIAS',
  'registro-clase-gratis':     'SLACK_WEBHOOK_CLASE_GRATIS',
  'registro-socios-sportclub': 'SLACK_WEBHOOK_SPORTCLUB',
  'venta-de-planes':           'SLACK_WEBHOOK_VENTA_PLANES',
  'venta-alquiler-clases':     'SLACK_WEBHOOK_VENTA_ALQUILER',
  'venta-pase-masterclass':    'SLACK_WEBHOOK_VENTA_MASTERCLASS',
  'alta-alquiler-alumnos':     'SLACK_WEBHOOK_ALTA_ALQUILER',
}

export interface NotifySlackOptions {
  channel: string
  text: string
  logTag?: string
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/slack/api'

async function slackGatewayFetch(method: string, options: { query?: URLSearchParams; body?: Record<string, unknown> } = {}) {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
  const slackApiKey = Deno.env.get('SLACK_API_KEY')

  if (!lovableApiKey || !slackApiKey) {
    throw new Error('Slack Connector no configurado')
  }

  const url = `${GATEWAY_URL}/${method}${options.query ? `?${options.query.toString()}` : ''}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      'X-Connection-Api-Key': slackApiKey,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const responseText = await res.text()
  let data: any
  try {
    data = JSON.parse(responseText)
  } catch {
    throw new Error(`${method} devolvió una respuesta inválida (${res.status})`)
  }

  if (!res.ok || !data.ok) {
    throw new Error(`${method} falló: ${data.error ?? data.message ?? responseText.slice(0, 200)}`)
  }

  return data
}

async function findChannelId(channelName: string): Promise<string | null> {
  const target = channelName.replace(/^#/, '')
  let cursor = ''

  do {
    const query = new URLSearchParams({ limit: '200', types: 'public_channel,private_channel' })
    if (cursor) query.set('cursor', cursor)

    const page = await slackGatewayFetch('conversations.list', { query })
    const match = page.channels?.find((channel: any) => channel.name === target)
    if (match?.id) return match.id

    cursor = page.response_metadata?.next_cursor ?? ''
  } while (cursor)

  return null
}

export async function notifySlack({ channel, text, logTag = '[slack]' }: NotifySlackOptions): Promise<boolean> {
  const secretName = WEBHOOK_SECRETS[channel]
  const normalizedChannel = channel.replace(/^#/, '')

  const webhookUrl = secretName ? Deno.env.get(secretName) : null
  if (!webhookUrl) {
    try {
      const directChannel = normalizedChannel.startsWith('#') ? normalizedChannel : `#${normalizedChannel}`
      try {
        await slackGatewayFetch('chat.postMessage', {
          body: {
            channel: directChannel,
            text,
            username: 'Bot NM Roller',
            icon_emoji: ':roller_skate:',
          },
        })
        console.log(`${logTag} Slack notificado OK en ${directChannel}`)
        return true
      } catch (directError) {
        console.warn(`${logTag} Slack directo por nombre falló; intentando resolver canal:`, directError)
      }

      const channelId = await findChannelId(normalizedChannel)
      if (!channelId) {
        console.warn(`${logTag} No se encontró el canal #${normalizedChannel}`)
        return false
      }

      await slackGatewayFetch('chat.postMessage', {
        body: {
          channel: channelId,
          text,
          username: 'Bot NM Roller',
          icon_emoji: ':roller_skate:',
        },
      })
      console.log(`${logTag} Slack notificado OK en #${normalizedChannel}`)
      return true
    } catch (e) {
      console.warn(`${logTag} Slack Connector falló:`, e)
      return false
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.warn(`${logTag} Slack webhook falló: ${res.status}`)
      return false
    }
    console.log(`${logTag} Slack notificado OK en #${normalizedChannel}`)
    return true
  } catch (e) {
    console.warn(`${logTag} Slack fetch falló:`, e)
    return false
  }
}
