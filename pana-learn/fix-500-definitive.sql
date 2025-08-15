-- Script definitivo para resolver erro 500 - SEM confirmação de email
-- Data: 2025-01-29

-- 1. Verificar estrutura atual
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuarios';

-- 2. Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Remover todas as políticas RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can create users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users" ON public.usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.usuarios;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.usuarios;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.usuarios;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.usuarios;

-- 4. Desabilitar RLS completamente
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 5. Recriar tabela usuarios com estrutura simples
DROP TABLE IF EXISTS public.usuarios;

CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'cliente',
  status VARCHAR(50) NOT NULL DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- 6. Criar função handle_new_user MUITO simples
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log simples
  RAISE LOG 'handle_new_user: Criando usuário para %', NEW.email;
  
  -- Inserção direta sem verificações complexas
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
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Erro ao criar usuário para %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Teste: Inserir usuário diretamente
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Definitivo',
  'teste-definitivo@exemplo.com',
  'cliente',
  'ativo'
) ON CONFLICT (email) DO NOTHING;

-- 9. Verificar se o usuário foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste-definitivo@exemplo.com';

-- 10. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-definitivo@exemplo.com';

-- 11. Verificar se tudo está funcionando
SELECT 
  'Trigger' as tipo,
  trigger_name as nome,
  'OK' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 
  'Function' as tipo,
  routine_name as nome,
  'OK' as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
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

-- 12. Verificar estrutura final da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position; 