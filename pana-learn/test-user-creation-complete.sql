-- Script completo para testar criação de usuários
-- Data: 2025-01-29

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA DA TABELA USUARIOS ===' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar função handle_new_user
SELECT '=== FUNÇÃO HANDLE_NEW_USER ===' as info;
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. Verificar trigger
SELECT '=== TRIGGER ON_AUTH_USER_CREATED ===' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 5. Teste 1: Criar usuário via API (simulação)
SELECT '=== TESTE 1: SIMULAÇÃO DE CRIAÇÃO VIA API ===' as info;

-- Simular dados de um novo usuário
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'teste-api-' || extract(epoch from now())::text || '@exemplo.com';
BEGIN
  -- Inserir diretamente na tabela usuarios (simulando criação por admin)
  INSERT INTO public.usuarios (
    nome,
    email,
    tipo_usuario,
    status
  ) VALUES (
    'Usuário Teste API',
    test_email,
    'cliente',
    'ativo'
  );
  
  RAISE NOTICE '✅ Usuário criado via API: %', test_email;
  
  -- Verificar se foi criado
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = test_email) THEN
    RAISE NOTICE '✅ Verificação: Usuário encontrado na tabela';
  ELSE
    RAISE NOTICE '❌ Verificação: Usuário NÃO encontrado na tabela';
  END IF;
  
  -- Limpeza
  DELETE FROM public.usuarios WHERE email = test_email;
  RAISE NOTICE '🧹 Usuário de teste removido';
END $$;

-- 6. Teste 2: Verificar se trigger funcionaria
SELECT '=== TESTE 2: VERIFICAÇÃO DO TRIGGER ===' as info;

-- Verificar se a função handle_new_user está correta
SELECT 
  CASE 
    WHEN routine_definition LIKE '%user_id%' THEN '✅ CORRETO: Usa user_id'
    ELSE '❌ PROBLEMA: Não usa user_id'
  END as verificacao_user_id,
  CASE 
    WHEN routine_definition LIKE '%NEW.id%' THEN '✅ CORRETO: Usa NEW.id'
    ELSE '❌ PROBLEMA: Não usa NEW.id'
  END as verificacao_new_id
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 7. Teste 3: Verificar dados existentes
SELECT '=== TESTE 3: DADOS EXISTENTES ===' as info;
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(user_id) as usuarios_com_auth,
  COUNT(*) - COUNT(user_id) as usuarios_sem_auth
FROM public.usuarios;

-- 8. Teste 4: Verificar tipos de usuário
SELECT '=== TESTE 4: TIPOS DE USUÁRIO ===' as info;
SELECT 
  tipo_usuario,
  COUNT(*) as quantidade
FROM public.usuarios
GROUP BY tipo_usuario
ORDER BY tipo_usuario;

-- 9. Teste 5: Verificar status dos usuários
SELECT '=== TESTE 5: STATUS DOS USUÁRIOS ===' as info;
SELECT 
  status,
  COUNT(*) as quantidade
FROM public.usuarios
GROUP BY status
ORDER BY status;

-- 10. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
  'Estrutura da Tabela' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name = 'user_id'
      AND table_schema = 'public'
    ) THEN '✅ OK'
    ELSE '❌ PROBLEMA: user_id não existe'
  END as status
UNION ALL
SELECT 
  'Função handle_new_user' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user'
      AND routine_schema = 'public'
    ) THEN '✅ OK'
    ELSE '❌ PROBLEMA: Função não existe'
  END as status
UNION ALL
SELECT 
  'Trigger on_auth_user_created' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ OK'
    ELSE '❌ PROBLEMA: Trigger não existe'
  END as status
UNION ALL
SELECT 
  'Políticas RLS' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'usuarios'
    ) THEN '✅ OK'
    ELSE '❌ PROBLEMA: Sem políticas RLS'
  END as status;






