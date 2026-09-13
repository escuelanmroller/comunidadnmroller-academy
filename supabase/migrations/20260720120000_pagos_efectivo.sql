-- Registro de conversión de turnos Calendly (beneficio pago en efectivo).
-- No es un espejo de todos los turnos: solo guarda una fila por turno en el
-- que el vendedor tomó una acción desde el panel de ventas (pagó / no se
-- presentó / vino y no pagó). Los turnos en sí se leen en vivo de la API de
-- Calendly (Edge Function listar-turnos-efectivo) y se cruzan con esta tabla
-- por calendly_event_uuid.
CREATE TABLE public.pagos_efectivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  calendly_event_uuid TEXT NOT NULL,
  calendly_invitee_uuid TEXT,

  estado TEXT NOT NULL CHECK (estado IN ('pagado', 'no_show', 'no_pago')),
  plan_preguntado TEXT,             -- snapshot de lo que Calendly capturó
  plan_pagado TEXT,                 -- editable por el vendedor; requerido si estado='pagado'
  plan_categoria TEXT,              -- 'nm-mensual' | 'nm-trimestral' | 'alquiler' (desambigua planes
                                     -- con el mismo nombre, ej. "Clase Única" mensual vs. alquiler)

  nombre TEXT,
  email TEXT,
  telefono TEXT,
  dni TEXT,
  notas TEXT,
  vendedor TEXT NOT NULL,           -- nombre de la persona que gestionó el turno (cargado a mano:
                                     -- todos los vendedores comparten el mismo usuario de Supabase Auth,
                                     -- así que confirmado_por no alcanza para distinguirlos)
  confirmado_por TEXT NOT NULL,     -- email del vendedor autenticado (Supabase Auth) — rastro técnico

  getresponse_ok BOOLEAN NOT NULL DEFAULT false,
  getresponse_status INTEGER,
  getresponse_error TEXT
);

-- Un turno = una fila. Habilita upsert (on_conflict) para corregir una
-- confirmación después (ej. cambiar el plan pagado o pasar de no_pago a pagado).
CREATE UNIQUE INDEX pagos_efectivo_event_uuid_idx ON public.pagos_efectivo (calendly_event_uuid);
CREATE INDEX pagos_efectivo_estado_idx ON public.pagos_efectivo (estado);

-- Solo el backend (service_role) escribe/lee, igual que `leads`. El frontend
-- nunca consulta esta tabla directo: todo pasa por las Edge Functions
-- listar-turnos-efectivo / confirmar-pago-efectivo, que validan el JWT del
-- vendedor por su cuenta.
GRANT ALL ON public.pagos_efectivo TO service_role;

ALTER TABLE public.pagos_efectivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all to clients"
  ON public.pagos_efectivo
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Mantiene updated_at al día en cada upsert.
CREATE OR REPLACE FUNCTION public.set_pagos_efectivo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pagos_efectivo_set_updated_at
  BEFORE UPDATE ON public.pagos_efectivo
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pagos_efectivo_updated_at();
