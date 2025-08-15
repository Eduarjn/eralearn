-- ========================================
-- DIAGNÓSTICO: Problemas de Acesso ao Módulo de IA
-- ========================================

-- 1. Verificar se as tabelas do módulo de IA existem
SELECT '=== VERIFICANDO TABELAS DO MÓDULO DE IA ===' as info;
SELECT table_name, '✅ EXISTE' as status 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'ai_%' 
ORDER BY table_name;

-- 2. Verificar se as extensões necessárias estão instaladas
SELECT '=== VERIFICANDO EXTENSÕES ===' as info;
SELECT extname, '✅ INSTALADA' as status 
FROM pg_extension 
WHERE extname IN ('pgvector', 'pgcrypto');

-- 3. Verificar se as políticas RLS estão ativas
SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as info;
SELECT schemaname, tablename, policyname, '✅ ATIVA' as status
FROM pg_policies 
WHERE tablename LIKE 'ai_%' 
ORDER BY tablename, policyname;

-- 4. Verificar se as funções auxiliares existem
SELECT '=== VERIFICANDO FUNÇÕES AUXILIARES ===' as info;
SELECT routine_name, '✅ EXISTE' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_domain_admin', 'get_user_domain_id')
ORDER BY routine_name;

-- 5. Verificar estrutura da tabela usuarios
SELECT '=== VERIFICANDO TABELA USUARIOS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
AND column_name IN ('id', 'domain_id', 'tipo_usuario')
ORDER BY column_name;

-- 6. Verificar estrutura da tabela domains
SELECT '=== VERIFICANDO TABELA DOMAINS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'domains'
ORDER BY column_name;

-- 7. Verificar se há dados nas tabelas
SELECT '=== VERIFICANDO DADOS NAS TABELAS ===' as info;
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'domains' as tabela, COUNT(*) as total FROM domains
UNION ALL
SELECT 'ai_providers' as tabela, COUNT(*) as total FROM ai_providers
UNION ALL
SELECT 'ai_assistants' as tabela, COUNT(*) as total FROM ai_assistants
UNION ALL
SELECT 'ai_security_settings' as tabela, COUNT(*) as total FROM ai_security_settings;

-- 8. Verificar se há usuários com domain_id
SELECT '=== VERIFICANDO USUÁRIOS COM DOMAIN_ID ===' as info;
SELECT 
  u.id,
  u.email,
  u.nome,
  u.tipo_usuario,
  u.domain_id,
  d.name as domain_name,
  CASE 
    WHEN u.domain_id IS NULL THEN '❌ SEM DOMÍNIO'
    WHEN d.id IS NULL THEN '❌ DOMÍNIO INEXISTENTE'
    ELSE '✅ OK'
  END as status
FROM usuarios u
LEFT JOIN domains d ON u.domain_id = d.id
ORDER BY u.tipo_usuario, u.nome;

-- 9. Testar função is_domain_admin
SELECT '=== TESTANDO FUNÇÃO IS_DOMAIN_ADMIN ===' as info;
-- Substitua 'SEU_USER_ID_AQUI' pelo ID de um usuário admin real
SELECT 
  'Teste is_domain_admin' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = 'SEU_USER_ID_AQUI' 
      AND tipo_usuario IN ('admin', 'admin_master')
    ) THEN '✅ FUNÇÃO DISPONÍVEL'
    ELSE '❌ USUÁRIO NÃO ENCONTRADO PARA TESTE'
  END as resultado;

-- 10. Verificar configurações de segurança
SELECT '=== VERIFICANDO CONFIGURAÇÕES DE SEGURANÇA ===' as info;
SELECT 
  domain_id,
  requests_per_minute,
  tokens_per_day,
  max_tokens_per_request,
  CASE 
    WHEN block_terms = true THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END as filtro_termos,
  CASE 
    WHEN pii_masking = true THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END as mascaramento_pii
FROM ai_security_settings
ORDER BY domain_id;

-- 11. Verificar se há problemas de permissões
SELECT '=== VERIFICANDO PERMISSÕES ===' as info;
SELECT 
  schemaname,
  tablename,
  grantee,
  privilege_type,
  '✅ OK' as status
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%'
AND grantee = 'authenticated'
ORDER BY tablename, privilege_type;

-- 12. Resumo final
SELECT '=== RESUMO DO DIAGNÓSTICO ===' as info;
SELECT 
  'Tabelas AI criadas' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'ai_%') >= 7 
    THEN '✅ OK'
    ELSE '❌ PROBLEMA'
  END as status
UNION ALL
SELECT 
  'Extensões instaladas' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('pgvector', 'pgcrypto')) >= 2 
    THEN '✅ OK'
    ELSE '❌ PROBLEMA'
  END as status
UNION ALL
SELECT 
  'Políticas RLS ativas' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'ai_%') >= 7 
    THEN '✅ OK'
    ELSE '❌ PROBLEMA'
  END as status
UNION ALL
SELECT 
  'Funções auxiliares' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('is_domain_admin', 'get_user_domain_id')) >= 2 
    THEN '✅ OK'
    ELSE '❌ PROBLEMA'
  END as status;
