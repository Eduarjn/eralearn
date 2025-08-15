-- Script para corrigir tabela usuarios para funcionalidades de perfil
-- Data: 2025-01-29

-- 1. Verificar estrutura atual da tabela usuarios
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna avatar_url se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' 
    AND column_name = 'avatar_url' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 3. Verificar se o bucket 'avatars' existe no storage
-- (Isso precisa ser feito manualmente no Supabase Dashboard)

-- 4. Criar políticas RLS para permitir atualização do próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios;

CREATE POLICY "Users can update their own profile"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'usuarios'
AND schemaname = 'public'
AND policyname = 'Users can update their own profile';

-- 6. Teste: Atualizar um usuário de teste
UPDATE public.usuarios
SET nome = 'Usuário Teste Atualizado'
WHERE email = 'teste-admin@exemplo.com';

-- 7. Verificar se a atualização funcionou
SELECT 
  id,
  nome,
  email,
  avatar_url,
  data_atualizacao
FROM public.usuarios 
WHERE email = 'teste-admin@exemplo.com';

-- 8. Verificar estrutura final da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verificar políticas RLS ativas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'usuarios'
AND schemaname = 'public'; 