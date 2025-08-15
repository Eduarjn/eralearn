-- Script de teste para criação de usuários
-- Data: 2025-07-29

-- 1. Verificar estrutura da tabela usuarios
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar triggers existentes
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%'
OR trigger_name LIKE '%auth%';

-- 3. Verificar função handle_new_user
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4. Verificar usuários existentes
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao,
  user_id
FROM public.usuarios 
ORDER BY data_criacao DESC 
LIMIT 10;

-- 5. Verificar usuários no auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Teste: Inserir um usuário de teste diretamente na tabela usuarios
-- (Simulando o que deveria acontecer via trigger)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status,
  user_id
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Frontend',
  'teste@frontend.com',
  'cliente',
  'ativo',
  gen_random_uuid()
) ON CONFLICT (email) DO NOTHING;

-- 7. Verificar se o usuário foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste@frontend.com';

-- 8. Verificar políticas RLS
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
WHERE tablename = 'usuarios';

-- 9. Verificar logs de erro (se houver)
-- Nota: Esta consulta pode não funcionar dependendo da configuração do Supabase
SELECT 
  log_time,
  user_name,
  database_name,
  process_id,
  connection_from,
  session_id,
  session_line_num,
  command_tag,
  session_start_time,
  virtual_transaction_id,
  transaction_id,
  error_severity,
  sql_state_code,
  message,
  detail,
  hint,
  internal_query,
  internal_query_pos,
  context,
  query,
  query_pos,
  location,
  application_name
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%usuarios%';

-- 10. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste@frontend.com'; 