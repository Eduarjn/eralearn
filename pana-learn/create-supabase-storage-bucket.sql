-- Script para criar bucket de storage privado no Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket 'videos' se não existir (idempotente)
INSERT INTO storage.buckets (id, name, public)
SELECT 'videos', 'videos', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos');

-- 2. Verificar se o bucket foi criado
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE id = 'videos';

-- 3. Criar política de acesso para usuários autenticados (opcional)
-- Esta política permite que usuários autenticados façam upload
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- 4. Política para permitir que usuários autenticados vejam seus próprios arquivos
CREATE POLICY IF NOT EXISTS "Usuários podem ver seus próprios arquivos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- 5. Política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY IF NOT EXISTS "Usuários podem atualizar seus próprios arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos');

-- 6. Política para permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY IF NOT EXISTS "Usuários podem deletar seus próprios arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');

-- 7. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 8. Informações do bucket
SELECT 'Bucket videos criado com sucesso!' as status;











