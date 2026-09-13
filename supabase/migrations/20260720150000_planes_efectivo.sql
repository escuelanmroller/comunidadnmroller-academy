-- Catálogo de planes con su precio de pago en efectivo, usado por el panel
-- de ventas (ConfirmarPagoDialog) para que el vendedor elija el plan real
-- que pagó, en vez de tipearlo libre. Editable desde /panel-ventas/configuracion
-- sin necesidad de tocar código ni redeploy.
--
-- Los mismos nombres de plan se repiten con precios distintos según la
-- categoría (ej. "Clase Única" cuesta $30.000 en el catálogo mensual de
-- comunidadnmroller.com y $35.000 en el de clases + alquiler), por eso la
-- combinación (categoria, plan_slug) es la clave única, no el nombre solo.
CREATE TABLE public.planes_efectivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  categoria TEXT NOT NULL CHECK (categoria IN ('nm-mensual', 'nm-trimestral', 'alquiler')),
  nombre TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  precio_efectivo NUMERIC(12, 2) NOT NULL CHECK (precio_efectivo >= 0),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX planes_efectivo_categoria_slug_idx ON public.planes_efectivo (categoria, plan_slug);

GRANT ALL ON public.planes_efectivo TO service_role;

ALTER TABLE public.planes_efectivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all to clients"
  ON public.planes_efectivo
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.set_planes_efectivo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER planes_efectivo_set_updated_at
  BEFORE UPDATE ON public.planes_efectivo
  FOR EACH ROW
  EXECUTE FUNCTION public.set_planes_efectivo_updated_at();

-- Seed: catálogo real tomado de src/components/PricingSection.tsx y
-- src/components/alquiler/PricingAlquilerSection.tsx (20-jul-2026).
INSERT INTO public.planes_efectivo (categoria, nombre, plan_slug, precio_efectivo, orden) VALUES
  ('nm-mensual',    'Clase Única', 'clase-unica',            30000.00, 1),
  ('nm-mensual',    'Basic Fun',   'basic-fun',               55000.00, 2),
  ('nm-mensual',    'Black Free',  'black-free',              65000.00, 3),
  ('nm-trimestral', 'Basic Fun',   'basic-fun-trimestral',   148500.00, 4),
  ('nm-trimestral', 'Black Free',  'black-trimestral',       175500.00, 5),
  ('alquiler',      'Clase Única', 'clase-unica',             35000.00, 6),
  ('alquiler',      'Clase 2x1',   'clase-2x1',               35000.00, 7),
  ('alquiler',      'Pack 4 Clases','pack-4-clases',          85000.00, 8);
