// Gate de autenticación para el panel de ventas (pagos en efectivo).
// Capa 1 (gratis): las funciones se deployan SIN --no-verify-jwt, así que
// Supabase ya rechaza cualquier request sin un JWT válido antes de correr
// este código. Capa 2 (acá): confirmamos que el JWT corresponde a un usuario
// real de Supabase Auth y, si PANEL_VENTAS_ALLOWED_EMAILS está seteada,
// que su email esté en la lista de vendedores autorizados.
import { createClient } from 'npm:@supabase/supabase-js@2'

export interface StaffUser {
  id: string
  email: string
}

export async function requireStaffUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<{ user: StaffUser } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user?.email) {
    return new Response(JSON.stringify({ error: 'Sesión inválida o expirada' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const allowedEmails = Deno.env.get('PANEL_VENTAS_ALLOWED_EMAILS')
  if (allowedEmails) {
    const allowList = allowedEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    if (allowList.length > 0 && !allowList.includes(data.user.email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'No autorizado para el panel de ventas' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return { user: { id: data.user.id, email: data.user.email } }
}
