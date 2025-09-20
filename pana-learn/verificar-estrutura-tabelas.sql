-- Script para verificar a estrutura atual das tabelas
-- Data: 2025-01-29

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

-- Listar todas as tabelas do schema public
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- ========================================

-- Verificar colunas da tabela usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR SE EXISTE TABELA LOGIN_LOGS
-- ========================================

-- Verificar se a tabela login_logs existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'login_logs';

-- Se existir, mostrar sua estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'login_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR FUNÇÕES EXISTENTES
-- ========================================

-- Verificar funções relacionadas a login
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%login%'
ORDER BY routine_name;

-- ========================================
-- 5. VERIFICAR TRIGGERS EXISTENTES
-- ========================================

-- Verificar triggers relacionados a login
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_name LIKE '%login%' OR event_object_table LIKE '%login%')
ORDER BY trigger_name;

-- ========================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar políticas RLS da tabela usuarios
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
WHERE schemaname = 'public' 
AND tablename = 'usuarios'
ORDER BY policyname;

-- Verificar políticas RLS da tabela login_logs (se existir)
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
WHERE schemaname = 'public' 
AND tablename = 'login_logs'
ORDER BY policyname;

-- ========================================
-- 7. VERIFICAR DADOS DE EXEMPLO
-- ========================================

-- Verificar alguns usuários de exemplo
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao,
  ultimo_login
FROM public.usuarios 
ORDER BY data_criacao DESC 
LIMIT 5;

-- ========================================
-- 8. VERIFICAR AUTH.USERS (SE POSSÍVEL)
-- ========================================

-- Tentar verificar estrutura de auth.users
-- (Pode não funcionar dependendo das permissões)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Verificar alguns dados de auth.users
SELECT 
  id,
  email,
  last_sign_in_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;






































