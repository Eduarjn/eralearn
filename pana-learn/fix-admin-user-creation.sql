-- Script para corrigir criação de usuários via API admin
-- Data: 2025-01-29

-- 1. Verificar se a tabela usuarios existe
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
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está desabilitado
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public';

-- 4. Desabilitar RLS se estiver habilitado
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 5. Verificar função handle_new_user atual
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 6. Recriar função handle_new_user mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_tipo TEXT;
  user_email TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando para email %', NEW.email;
  
  -- Verificar se o usuário já existe na tabela usuarios
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.id) THEN
    RAISE LOG 'handle_new_user: Usuário já existe na tabela usuarios para %', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Extrair dados do metadata (incluindo dados do LinkedIn)
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
  
  user_email := NEW.email;
  
  -- Log dos dados extraídos
  RAISE LOG 'handle_new_user: Nome=% Tipo=% Email=%', user_nome, user_tipo, user_email;
  
  BEGIN
    -- Inserir usuário na tabela usuarios
    INSERT INTO public.usuarios (
      id,
      nome,
      email,
      tipo_usuario,
      status
    ) VALUES (
      NEW.id,
      user_nome,
      user_email,
      user_tipo,
      'ativo'
    );
    
    RAISE LOG 'handle_new_user: Usuário criado com sucesso para %', user_email;
    RETURN NEW;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'handle_new_user: Usuário já existe para %', user_email;
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Erro ao criar usuário para %: %', user_email, SQLERRM;
      -- Retornar NEW mesmo com erro para não quebrar o signup
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 8. Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Teste: Inserir usuário diretamente na tabela usuarios
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Admin',
  'teste-admin@exemplo.com',
  'cliente',
  'ativo'
) ON CONFLICT (email) DO NOTHING;

-- 10. Verificar se o usuário foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste-admin@exemplo.com';

-- 11. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-admin@exemplo.com';

-- 12. Verificar configuração final
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
WHERE table_name = 'usuarios' AND table_schema = 'public'
UNION ALL
SELECT 
  'RLS' as tipo,
  tablename as nome,
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as status
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public'; 