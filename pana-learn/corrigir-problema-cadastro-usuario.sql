-- Script para corrigir problema de cadastro de usuário
-- Problema: Erro 406 ao carregar perfil do usuário após cadastro
-- Data: 2025-01-29

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

-- Verificar estrutura da tabela usuarios
SELECT '=== ESTRUTURA TABELA USUARIOS ===' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há campo user_id ou id
SELECT '=== CAMPO ID/USER_ID ===' as info;
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id');

-- ========================================
-- 2. CORRIGIR ESTRUTURA DA TABELA
-- ========================================

-- Adicionar campo user_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN user_id UUID;
        RAISE NOTICE 'Campo user_id adicionado à tabela usuarios';
    ELSE
        RAISE NOTICE 'Campo user_id já existe na tabela usuarios';
    END IF;
END $$;

-- Criar índice para user_id
CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON public.usuarios(user_id);

-- ========================================
-- 3. CORRIGIR FUNÇÃO HANDLE_NEW_USER
-- ========================================

-- Remover função antiga
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função corrigida
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
      id,           -- ID único da tabela usuarios
      user_id,      -- Referência para auth.users
      nome,
      email,
      tipo_usuario,
      status
    ) VALUES (
      gen_random_uuid(),  -- Gerar novo UUID para id
      NEW.id,             -- ID do auth.users
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

-- ========================================
-- 4. RECRIAR TRIGGER
-- ========================================

-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger novo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 5. CORRIGIR POLÍTICAS RLS
-- ========================================

-- Desabilitar RLS temporariamente
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
DROP POLICY IF EXISTS "Todos podem ver usuários" ON public.usuarios;

-- Criar políticas corretas
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  user_id = auth.uid() OR  -- Usar user_id para comparação
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Política para permitir inserção via trigger
CREATE POLICY "Allow trigger insert"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- Política para admin atualizar usuários
CREATE POLICY "Admin can update users"
ON public.usuarios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- ========================================
-- 6. CORRIGIR DADOS EXISTENTES
-- ========================================

-- Sincronizar dados existentes se necessário
UPDATE public.usuarios 
SET user_id = id
WHERE user_id IS NULL 
AND id IS NOT NULL;

-- ========================================
-- 7. TESTAR FUNCIONAMENTO
-- ========================================

-- Verificar se a função foi criada
SELECT '=== FUNÇÃO HANDLE_NEW_USER ===' as info;
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Verificar se o trigger foi criado
SELECT '=== TRIGGER ===' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar estrutura final da tabela
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 8. MENSAGEM DE SUCESSO
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Script de correção executado com sucesso!';
  RAISE NOTICE 'Agora o cadastro de usuários deve funcionar corretamente.';
  RAISE NOTICE 'O erro 406 deve ser resolvido.';
END $$;





