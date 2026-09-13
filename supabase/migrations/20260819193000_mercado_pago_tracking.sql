-- Registro server-to-server de pagos de Mercado Pago.
-- La fuente de verdad es el webhook; la vuelta del navegador queda solo para UX.
CREATE TABLE IF NOT EXISTS public.mercado_pago_pagos (
  payment_id text PRIMARY KEY,
  preference_id text,
  merchant_order_id text,
  external_reference text,
  origen text CHECK (origen IS NULL OR origen IN ('nm', 'clases-alquiler')),
  plan_slug text,
  plan_label text,
  transaction_amount numeric(12, 2),
  currency_id text,
  status text NOT NULL,
  status_detail text,
  payment_method_id text,
  payment_type_id text,
  live_mode boolean,
  payer_email text,
  date_created timestamptz,
  date_approved timestamptz,
  raw_payment jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mercado_pago_pagos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mercado_pago_pagos FROM anon, authenticated;
GRANT ALL ON public.mercado_pago_pagos TO service_role;

CREATE INDEX IF NOT EXISTS mercado_pago_pagos_external_reference_idx
  ON public.mercado_pago_pagos (external_reference);
CREATE INDEX IF NOT EXISTS mercado_pago_pagos_status_idx
  ON public.mercado_pago_pagos (status, updated_at DESC);

-- El comprobante puede cerrar por transferencia un intento rechazado distinto
-- del plan original. Se conservan ambos lados para no falsear la conversión.
ALTER TABLE public.comprobantes_pago
  ADD COLUMN IF NOT EXISTS metodo_pago text NOT NULL DEFAULT 'mercado-pago'
    CHECK (metodo_pago IN ('mercado-pago', 'transferencia')),
  ADD COLUMN IF NOT EXISTS payment_id_intento text,
  ADD COLUMN IF NOT EXISTS plan_intentado text,
  ADD COLUMN IF NOT EXISTS plan_final_slug text,
  ADD COLUMN IF NOT EXISTS monto_final numeric(12, 2);

CREATE INDEX IF NOT EXISTS comprobantes_pago_payment_id_intento_idx
  ON public.comprobantes_pago (payment_id_intento);

