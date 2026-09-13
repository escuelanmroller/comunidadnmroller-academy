// Devuelve el catálogo de planes con su precio de pago en efectivo (tabla
// planes_efectivo). Lo usa tanto el selector de plan del panel de ventas
// como la pantalla de configuración de precios.
import { createClient } from 'npm:@supabase/supabase-js@2'
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
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data, error } = await admin
      .from('planes_efectivo')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) {
      console.error('listar-planes-efectivo: error leyendo catálogo', error)
      return new Response(JSON.stringify({ error: 'No pudimos traer el catálogo de planes.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, planes: data ?? [] }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('listar-planes-efectivo error', e)
    return new Response(JSON.stringify({ error: 'Error inesperado.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
