
-- Restrict comprobantes_pago: deny SELECT/UPDATE/DELETE to anon and authenticated.
-- Service role bypasses RLS, so backend still has full access.
CREATE POLICY "Deny select to clients"
  ON public.comprobantes_pago
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny update to clients"
  ON public.comprobantes_pago
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny delete to clients"
  ON public.comprobantes_pago
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Restrict storage.objects for the 'comprobantes-pago' bucket the same way.
CREATE POLICY "Deny select on comprobantes bucket to clients"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'comprobantes-pago' AND false);

CREATE POLICY "Deny update on comprobantes bucket to clients"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'comprobantes-pago' AND false)
  WITH CHECK (bucket_id = 'comprobantes-pago' AND false);

CREATE POLICY "Deny delete on comprobantes bucket to clients"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'comprobantes-pago' AND false);
