-- Script para diagnosticar e corrigir erro 500 no Supabase Cloud
-- Data: 2025-01-29

-- 1. Verificar se a tabela usuarios existe e sua estrutura
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuarios';

-- 2. Verificar estrutura da tabela usuarios
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

-- 3. Verificar se a função handle_new_user existe
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 4. Verificar se a trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_schema = 'auth';

-- 5. Verificar políticas RLS da tabela usuarios
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
WHERE tablename = 'usuarios'
AND schemaname = 'public';

-- 6. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios' 
AND schemaname = 'public';

-- 7. Recriar a função handle_new_user com tratamento de erro melhorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando criação de usuário para %', NEW.email;
  
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
    
    RAISE LOG 'handle_new_user: Usuário criado com sucesso para %', NEW.email;
    RETURN NEW;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'handle_new_user: Usuário já existe para %', NEW.email;
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Erro ao criar usuário para %: %', NEW.email, SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recriar a trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Recriar políticas RLS mais permissivas
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can create users" ON public.usuarios;

-- Política para permitir inserção via trigger (mais permissiva)
CREATE POLICY "Allow trigger insert"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- Política para usuários verem seus próprios dados
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

-- Política para admin atualizar usuários
CREATE POLICY "Admin can update users"
ON public.usuarios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 10. Habilitar RLS se não estiver habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 11. Verificar se há usuários existentes na tabela usuarios
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as usuarios_ativos,
  COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as administradores
FROM public.usuarios;

-- 12. Verificar usuários no auth.users
SELECT 
  COUNT(*) as total_auth_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as emails_confirmados
FROM auth.users;

-- 13. Teste: Tentar inserir um usuário de teste diretamente
-- (Para verificar se o problema é na trigger ou na tabela)
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Cloud',
  'teste-cloud@exemplo.com',
  'cliente',
  'ativo'
) ON CONFLICT (email) DO NOTHING;

-- 14. Verificar se o usuário de teste foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste-cloud@exemplo.com';

-- 15. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-cloud@exemplo.com';

-- 16. Verificar logs de erro recentes (se disponível)
-- Nota: Esta consulta pode não funcionar em todos os ambientes
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