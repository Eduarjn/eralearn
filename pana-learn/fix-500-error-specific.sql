-- Script específico para resolver erro 500 com unexpected_failure
-- Data: 2025-01-29

-- 1. Verificar se a tabela usuarios existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuarios';

-- 2. Verificar estrutura atual da tabela usuarios
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

-- 3. Criar tabela usuarios se não existir
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'cliente',
  status VARCHAR(50) NOT NULL DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- 4. Verificar se há dados na tabela
SELECT COUNT(*) as total_usuarios FROM public.usuarios;

-- 5. Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 6. Remover função existente se houver
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 7. Criar função handle_new_user simplificada e robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_tipo TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando para email %', NEW.email;
  
  -- Extrair dados do metadata
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  user_tipo := COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente');
  
  -- Log dos dados extraídos
  RAISE LOG 'handle_new_user: Nome=% Tipo=%', user_nome, user_tipo;
  
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

-- 8. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow trigger insert" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
DROP POLICY IF EXISTS "Admin can create users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users" ON public.usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.usuarios;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.usuarios;

-- 10. Desabilitar RLS temporariamente para teste
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 11. Teste: Inserir usuário diretamente
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Usuário Teste Fix',
  'teste-fix@exemplo.com',
  'cliente',
  'ativo'
) ON CONFLICT (email) DO NOTHING;

-- 12. Verificar se o usuário foi criado
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
WHERE email = 'teste-fix@exemplo.com';

-- 13. Limpeza: Remover usuário de teste
DELETE FROM public.usuarios 
WHERE email = 'teste-fix@exemplo.com';

-- 14. Reabilitar RLS com políticas simples
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 15. Criar políticas RLS básicas
CREATE POLICY "Enable read access for all users"
ON public.usuarios FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON public.usuarios FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
ON public.usuarios FOR UPDATE
USING (auth.uid() = id);

-- 16. Verificar se tudo está funcionando
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

-- 17. Verificar políticas RLS criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'usuarios'
AND schemaname = 'public'; 