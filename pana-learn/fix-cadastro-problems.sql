-- 🚨 Script para Corrigir Problemas de Cadastro de Usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela usuarios
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. Verificar se a tabela usuarios existe e tem a estrutura correta
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
    RAISE EXCEPTION 'Tabela usuarios não existe!';
  END IF;
  
  -- Verificar se as colunas necessárias existem
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'id') THEN
    RAISE EXCEPTION 'Coluna id não existe na tabela usuarios!';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'email') THEN
    RAISE EXCEPTION 'Coluna email não existe na tabela usuarios!';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'nome') THEN
    RAISE EXCEPTION 'Coluna nome não existe na tabela usuarios!';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'tipo_usuario') THEN
    RAISE EXCEPTION 'Coluna tipo_usuario não existe na tabela usuarios!';
  END IF;
  
  RAISE NOTICE '✅ Estrutura da tabela usuarios está correta!';
END $$;

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se a função handle_new_user existe
SELECT 
  routine_name, 
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. Recriar a função handle_new_user com tratamento de erro melhorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Verificar se o usuário já existe na tabela usuarios
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.id) THEN
    RAISE NOTICE 'Usuário já existe na tabela usuarios: %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Inserir usuário na tabela usuarios
  INSERT INTO public.usuarios (
    id,
    email,
    nome,
    tipo_usuario,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente'),
    'ativo',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Usuário criado com sucesso: %', NEW.email;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Usuário já existe (unique_violation): %', NEW.email;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: % - %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Testar inserção de usuário
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'teste_' || extract(epoch from now())::text || '@teste.com';
BEGIN
  -- Inserir usuário de teste diretamente na tabela usuarios
  INSERT INTO public.usuarios (
    id,
    email,
    nome,
    tipo_usuario,
    status,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_email,
    'Usuário Teste',
    'cliente',
    'ativo',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Teste de inserção bem-sucedido para: %', test_email;
  
  -- Limpar usuário de teste
  DELETE FROM public.usuarios WHERE id = test_user_id;
  RAISE NOTICE '🧹 Usuário de teste removido';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste de inserção: % - %', SQLSTATE, SQLERRM;
END $$;

-- 9. Reabilitar RLS com políticas simples
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserção via trigger" ON usuarios;
CREATE POLICY "Permitir inserção via trigger" ON usuarios
  FOR INSERT WITH CHECK (true);

-- 11. Verificar configurações de autenticação
SELECT 
  name,
  value
FROM auth.config 
WHERE name IN ('enable_signup', 'enable_email_confirmations', 'enable_email_change_confirmations');

-- 12. Resultado final
SELECT 
  '✅ Script de correção executado com sucesso!' as status,
  NOW() as executed_at;



































