-- Documentación de un fix aplicado a mano en el SQL Editor de Supabase (bosutr),
-- NO ejecutado por CLI — ver CLAUDE.md error #16 (por qué `db push`/`migration
-- repair` no son seguros acá, la tabla de bookkeeping es compartida con
-- panel-ventas-nmroller).
--
-- Bug real encontrado el 12-sep-2026 probando el flujo de comprobante de
-- Masterclass de punta a punta en producción: el CHECK constraint
-- `comprobantes_pago_origen_check` (agregado en algún momento directo en el
-- SQL Editor, sin migración local que lo documente) solo permitía
-- origen IN ('nm', 'clases-alquiler') — no incluía 'masterclass', agregado al
-- frontend el 7-sep. Todo comprador real de Masterclass que subiera su
-- comprobante recibía un error genérico y no había forma de que un reintento
-- funcionara (no era un error transitorio).
ALTER TABLE public.comprobantes_pago
  DROP CONSTRAINT IF EXISTS comprobantes_pago_origen_check;

ALTER TABLE public.comprobantes_pago
  ADD CONSTRAINT comprobantes_pago_origen_check
  CHECK (origen IS NULL OR origen IN ('nm', 'clases-alquiler', 'masterclass'));
