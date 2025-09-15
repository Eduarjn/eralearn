-- Script para verificar e corrigir problema do usuário dudu@gmail.com
-- Data: 2025-01-29
-- Problema: Usuário criado no auth.users mas não na tabela usuarios

-- ========================================
-- 1. VERIFICAR SITUAÇÃO ATUAL
-- ========================================

-- Verificar se o usuário existe no auth.users
SELECT '=== USUÁRIO NO AUTH.USERS ===' as info;
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'dudu@gmail.com';

-- Verificar se o usuário existe na tabela usuarios
SELECT '=== USUÁRIO NA TABELA USUARIOS ===' as info;
SELECT 
  id,
  user_id,
  email,
  nome,
  tipo_usuario,
  status,
  data_criacao
FROM usuarios 
WHERE email = 'dudu@gmail.com';

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA
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

-- ========================================
-- 3. VERIFICAR FUNÇÃO E TRIGGER
-- ========================================

-- Verificar se a função handle_new_user existe
SELECT '=== FUNÇÃO HANDLE_NEW_USER ===' as info;
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Verificar se o trigger existe
SELECT '=== TRIGGER ===' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ========================================
-- 4. CORRIGIR PROBLEMA
-- ========================================

-- Se o usuário existe no auth.users mas não na tabela usuarios, vamos criá-lo manualmente
DO $$
DECLARE
  auth_user_id UUID;
  auth_user_email TEXT;
  auth_user_metadata JSONB;
BEGIN
  -- Buscar dados do usuário no auth.users
  SELECT id, email, raw_user_meta_data 
  INTO auth_user_id, auth_user_email, auth_user_metadata
  FROM auth.users 
  WHERE email = 'dudu@gmail.com';
  
  -- Se encontrou o usuário no auth.users
  IF auth_user_id IS NOT NULL THEN
    -- Verificar se já existe na tabela usuarios
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth_user_id) THEN
      -- Inserir na tabela usuarios
      INSERT INTO usuarios (
        id,
        user_id,
        nome,
        email,
        tipo_usuario,
        status
      ) VALUES (
        gen_random_uuid(),
        auth_user_id,
        COALESCE(
          auth_user_metadata->>'nome',
          auth_user_metadata->>'name',
          auth_user_email
        ),
        auth_user_email,
        COALESCE(auth_user_metadata->>'tipo_usuario', 'cliente'),
        'ativo'
      );
      
      RAISE NOTICE 'Usuário dudu@gmail.com criado manualmente na tabela usuarios';
    ELSE
      RAISE NOTICE 'Usuário dudu@gmail.com já existe na tabela usuarios';
    END IF;
  ELSE
    RAISE NOTICE 'Usuário dudu@gmail.com não encontrado no auth.users';
  END IF;
END $$;

-- ========================================
-- 5. VERIFICAR RESULTADO
-- ========================================

-- Verificar novamente se o usuário existe na tabela usuarios
SELECT '=== VERIFICAÇÃO FINAL ===' as info;
SELECT 
  id,
  user_id,
  email,
  nome,
  tipo_usuario,
  status,
  data_criacao
FROM usuarios 
WHERE email = 'dudu@gmail.com';

-- ========================================
-- 6. CORRIGIR FUNÇÃO HANDLE_NEW_USER
-- ========================================

-- Recriar a função handle_new_user para evitar problemas futuros
DROP FUNCTION IF EXISTS public.handle_new_user();

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

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 7. TESTAR FUNCIONALIDADE
-- ========================================

-- Verificar se tudo está funcionando
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;

-- Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ========================================
-- 8. MENSAGEM DE SUCESSO
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Script de correção executado com sucesso!';
  RAISE NOTICE 'O usuário dudu@gmail.com deve estar funcionando agora.';
  RAISE NOTICE 'Teste fazer login com as credenciais corretas.';
END $$;






























