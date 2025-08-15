-- Script para configurar autenticação com LinkedIn
-- Data: 2025-01-29

-- 1. Verificar se a função handle_new_user existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 2. Atualizar função handle_new_user para suportar LinkedIn
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_tipo TEXT;
  user_email TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando para email %', NEW.email;
  
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

-- 3. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar estrutura da tabela usuarios
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Teste: Inserir usuário de teste do LinkedIn
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste LinkedIn',
  'teste-linkedin@exemplo.com',
  'cliente',
  'ativo'
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
WHERE email = 'teste-linkedin@exemplo.com';

-- 8. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-linkedin@exemplo.com';

-- 9. Verificar configuração final
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

-- 10. Verificar se RLS está desabilitado (importante para LinkedIn)
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public'; 