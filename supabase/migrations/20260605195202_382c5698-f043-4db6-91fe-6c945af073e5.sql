
CREATE TABLE public.comprobantes_pago (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  plan TEXT,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.comprobantes_pago TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comprobantes_pago TO authenticated;
GRANT ALL ON public.comprobantes_pago TO service_role;

ALTER TABLE public.comprobantes_pago ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a comprobante"
  ON public.comprobantes_pago FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage policies para el bucket privado comprobantes-pago
CREATE POLICY "Anyone can upload comprobante files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'comprobantes-pago');
