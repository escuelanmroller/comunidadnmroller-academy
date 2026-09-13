-- Tabla de respaldo de leads de todos los formularios.
-- Cada Edge Function (subscribe-*) inserta acá el registro SIEMPRE, aunque
-- GetResponse falle, así no se pierde ningún lead. Guarda además el resultado
-- del envío a GetResponse para poder diagnosticar y reprocesar.
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  origen TEXT NOT NULL,                       -- 'clase-gratis' | 'sportclub' | 'newsletter' | 'lista-espera'
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  payload JSONB,                              -- campos extra por formulario (sede, nivel, plan, equipo, etc.)
  getresponse_ok BOOLEAN NOT NULL DEFAULT false,
  getresponse_status INTEGER,
  getresponse_error TEXT
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_origen_idx ON public.leads (origen);

-- Solo el backend (service_role) escribe/lee. Los clientes (anon/authenticated)
-- no tienen acceso: RLS activa + sin políticas permisivas = denegado por defecto.
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all to clients"
  ON public.leads
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
