-- Script para corrigir problemas de cadastro de usuários
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

-- 2. Verificar se a trigger handle_new_user existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar se a função handle_new_user existe
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4. Recriar a função handle_new_user se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (
    id,
    nome,
    email,
    tipo_usuario,
    status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente'),
    'ativo'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar a trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar políticas RLS da tabela usuarios
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

-- 7. Recriar políticas RLS se necessário
-- Política para usuários verem seus próprios dados
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
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
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 8. Verificar se a tabela usuarios tem RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public';

-- 9. Habilitar RLS se não estiver habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 10. Teste: Inserir um usuário de teste
-- (Simulando o que deveria acontecer via trigger)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Cadastro',
  'teste-cadastro@exemplo.com',
  'cliente',
  'ativo'
) ON CONFLICT (email) DO NOTHING;

-- 11. Verificar se o usuário foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste-cadastro@exemplo.com';

-- 12. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-cadastro@exemplo.com';

-- 13. Verificar configuração de email do Supabase
-- Nota: Esta consulta pode não funcionar em todos os ambientes
SELECT 
  name,
  setting
FROM pg_settings 
WHERE name LIKE '%email%' OR name LIKE '%smtp%';

-- 14. Verificar logs de erro recentes (se disponível)
-- Nota: Esta consulta pode não funcionar dependendo da configuração
SELECT 
  log_time,
  user_name,
  database_name,
  error_severity,
  message
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%usuarios%'
ORDER BY log_time DESC
LIMIT 10; 