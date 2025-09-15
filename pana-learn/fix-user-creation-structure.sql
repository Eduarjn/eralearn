-- Script para corrigir estrutura da tabela usuarios e função handle_new_user
-- Data: 2025-01-29

-- 1. Verificar estrutura atual
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Corrigir estrutura da tabela usuarios
-- Remover campo senha_hashed obrigatório (não é necessário com Supabase Auth)
ALTER TABLE public.usuarios ALTER COLUMN senha_hashed DROP NOT NULL;

-- Garantir que user_id seja a referência correta para auth.users
-- Se não existir, adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' 
    AND column_name = 'user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_tipo TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando para email %', NEW.email;
  
  -- Verificar se o usuário já existe na tabela usuarios
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = NEW.id) THEN
    RAISE LOG 'handle_new_user: Usuário já existe na tabela usuarios para %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Extrair dados do metadata
  user_nome := COALESCE(
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  user_tipo := COALESCE(
    NEW.raw_user_meta_data->>'tipo_usuario',
    'cliente'
  );
  
  -- Log dos dados extraídos
  RAISE LOG 'handle_new_user: Nome=% Tipo=%', user_nome, user_tipo;
  
  BEGIN
    -- Inserir usuário na tabela usuarios usando user_id
    INSERT INTO public.usuarios (
      user_id,  -- ✅ CORRETO: Usar user_id como referência
      nome,
      email,
      tipo_usuario,
      status
    ) VALUES (
      NEW.id,   -- ✅ CORRETO: ID do auth.users
      user_nome,
      NEW.email,
      user_tipo,
      'ativo'
    );
    
    RAISE LOG 'handle_new_user: Usuário criado com sucesso para %', NEW.email;
    RETURN NEW;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'handle_new_user: Usuário já existe para %', NEW.email;
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Erro ao criar usuário para %: %', NEW.email, SQLERRM;
      -- Retornar NEW mesmo com erro para não quebrar o signup
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Desabilitar RLS temporariamente para permitir inserção via trigger
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 6. Recriar políticas RLS corretas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  user_id = auth.uid() OR  -- ✅ CORRETO: Usar user_id
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Política para permitir inserção via trigger
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
CREATE POLICY "Allow trigger insert"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- Política para admin atualizar usuários
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
CREATE POLICY "Admin can update users"
ON public.usuarios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 7. Reabilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 8. Teste: Verificar se a função está funcionando
SELECT 
  'Function' as tipo,
  routine_name as nome,
  'OK' as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
UNION ALL
SELECT 
  'Trigger' as tipo,
  trigger_name as nome,
  'OK' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 
  'Table' as tipo,
  table_name as nome,
  'OK' as status
FROM information_schema.tables 
WHERE table_name = 'usuarios' AND table_schema = 'public';

-- 9. Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;































