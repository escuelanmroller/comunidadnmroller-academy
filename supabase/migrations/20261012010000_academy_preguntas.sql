-- Aplicado a mano en bosutrnpmpjxylcgjmbt (MCP / SQL Editor). Solo documentación: no correr con `db push`.
-- Preguntas del formulario de NM Academy, editables desde /admin/academy (pestaña "Preguntas del formulario").
-- La semilla inicial sale de PREGUNTAS_DEFAULT en src/data/academyPreguntas.ts.
CREATE TABLE IF NOT EXISTS public.academy_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clave TEXT NOT NULL UNIQUE,
  etiqueta TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('text','email','tel','number','textarea','opciones','multi','escala','anio')),
  opciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  requerida BOOLEAN NOT NULL DEFAULT false,
  placeholder TEXT,
  paso INTEGER NOT NULL,
  paso_titulo TEXT NOT NULL,
  paso_bajada TEXT,
  orden INTEGER NOT NULL DEFAULT 1,
  fija BOOLEAN NOT NULL DEFAULT false,
  activa BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.academy_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_preguntas_lectura ON public.academy_preguntas FOR SELECT TO anon, authenticated
  USING (activa = true OR public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'));
CREATE POLICY academy_preguntas_admin_insert ON public.academy_preguntas FOR INSERT TO authenticated
  WITH CHECK (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'));
CREATE POLICY academy_preguntas_admin_update ON public.academy_preguntas FOR UPDATE TO authenticated
  USING (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'))
  WITH CHECK (public.rol_actual() = 'admin' OR (auth.jwt() ->> 'email') IN ('escuelanmroller@gmail.com','nico@nicosappia.com'));
