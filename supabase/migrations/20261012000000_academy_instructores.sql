-- Aplicado a mano en bosutrnpmpjxylcgjmbt (SQL Editor / MCP). Solo documentación: no correr con `db push`.
CREATE TABLE IF NOT EXISTS public.academy_instructores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre_apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT,
  pais_ciudad TEXT,
  anos_patinando TEXT,
  edad INTEGER,
  whatsapp TEXT,
  como_me_conociste TEXT,
  respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo','contactado','seleccionado','rechazado')),
  tier TEXT CHECK (tier IS NULL OR tier IN ('starter','vip','elite')),
  notas_internas TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS academy_instructores_email_uniq ON public.academy_instructores (lower(email));
CREATE INDEX IF NOT EXISTS academy_instructores_estado_idx ON public.academy_instructores (estado);
ALTER TABLE public.academy_instructores ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.academy_set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER academy_instructores_updated_at BEFORE UPDATE ON public.academy_instructores FOR EACH ROW EXECUTE FUNCTION public.academy_set_updated_at();

CREATE POLICY academy_instructores_insert_form ON public.academy_instructores FOR INSERT TO anon, authenticated
  WITH CHECK (estado = 'nuevo' AND tier IS NULL AND notas_internas IS NULL);
CREATE POLICY academy_instructores_admin_select ON public.academy_instructores FOR SELECT TO authenticated
  USING (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'));
CREATE POLICY academy_instructores_admin_update ON public.academy_instructores FOR UPDATE TO authenticated
  USING (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'))
  WITH CHECK (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'));
