-- ========================================
-- CONFIGURAÇÃO DO STORAGE PARA BRANDING
-- ========================================

-- Criar bucket para branding se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Configurar políticas RLS para o bucket branding
CREATE POLICY "Branding bucket public access" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

-- Permitir upload para admins
CREATE POLICY "Branding bucket admin upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Permitir update para admins
CREATE POLICY "Branding bucket admin update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Permitir delete para admins
CREATE POLICY "Branding bucket admin delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Verificar se a tabela branding_config existe e tem a coluna background_url
DO $$
BEGIN
    -- Adicionar coluna background_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branding_config' 
        AND column_name = 'background_url'
    ) THEN
        ALTER TABLE public.branding_config 
        ADD COLUMN background_url TEXT DEFAULT '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png';
        
        RAISE NOTICE 'Coluna background_url adicionada à tabela branding_config';
    END IF;
END $$;

-- Atualizar configuração padrão com background_url
UPDATE public.branding_config 
SET background_url = '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png'
WHERE background_url IS NULL;

-- Verificar configuração
SELECT 
  'Storage configurado com sucesso!' as status,
  'Bucket: branding' as bucket,
  'Público: true' as public_access,
  'Limite: 10MB' as file_limit;
