-- ========================================
-- DESABILITAR MÓDULO DE IA TEMPORARIAMENTE
-- ========================================
-- Execute este script se o módulo de IA estiver causando problemas de acesso

-- 1. Desabilitar RLS nas tabelas AI (temporário)
ALTER TABLE ai_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistants DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_security_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_keys DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se as tabelas estão acessíveis
SELECT 'Tabelas AI com RLS desabilitado' as status;
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'ai_%'
ORDER BY table_name;

-- 3. Verificar se há dados nas tabelas
SELECT 'Dados nas tabelas AI' as info;
SELECT 'ai_providers' as tabela, COUNT(*) as total FROM ai_providers
UNION ALL
SELECT 'ai_assistants' as tabela, COUNT(*) as total FROM ai_assistants
UNION ALL
SELECT 'ai_security_settings' as tabela, COUNT(*) as total FROM ai_security_settings;

-- 4. Verificar se as funções ainda existem
SELECT 'Funções auxiliares' as info;
SELECT routine_name, 'EXISTE' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_domain_admin', 'get_user_domain_id')
ORDER BY routine_name;

-- 5. Verificar extensões
SELECT 'Extensões instaladas' as info;
SELECT extname, 'INSTALADA' as status
FROM pg_extension 
WHERE extname IN ('pgvector', 'pgcrypto');

-- 6. Status final
SELECT '=== MÓDULO DE IA DESABILITADO TEMPORARIAMENTE ===' as status;
SELECT 'Para reabilitar, execute: ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;' as instrucao;
