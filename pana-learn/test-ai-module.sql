-- ========================================
-- TESTE: Módulo de IA
-- ========================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- para testar se o módulo de IA está funcionando

-- ========================================
-- 1. VERIFICAR SE AS TABELAS FORAM CRIADAS
-- ========================================

SELECT 'Verificando tabelas do módulo de IA...' as info;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%'
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR SE AS EXTENSÕES ESTÃO ATIVAS
-- ========================================

SELECT 'Verificando extensões...' as info;

SELECT 
    extname as extensao,
    '✅ ATIVA' as status
FROM pg_extension 
WHERE extname IN ('vector', 'pgcrypto');

-- ========================================
-- 3. VERIFICAR SE OS ÍNDICES FORAM CRIADOS
-- ========================================

SELECT 'Verificando índices...' as info;

SELECT 
    indexname,
    tablename,
    '✅ CRIADO' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_%'
ORDER BY tablename, indexname;

-- ========================================
-- 4. VERIFICAR SE AS POLÍTICAS RLS FORAM CRIADAS
-- ========================================

SELECT 'Verificando políticas RLS...' as info;

SELECT 
    tablename,
    policyname,
    '✅ CRIADA' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_%'
ORDER BY tablename, policyname;

-- ========================================
-- 5. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- ========================================

SELECT 'Verificando funções auxiliares...' as info;

SELECT 
    proname as funcao,
    '✅ CRIADA' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN ('is_domain_admin', 'get_user_domain_id', 'update_updated_at_column');

-- ========================================
-- 6. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
-- ========================================

SELECT 'Verificando triggers...' as info;

SELECT 
    trigger_name,
    event_object_table as tabela,
    '✅ CRIADO' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table LIKE 'ai_%'
ORDER BY event_object_table, trigger_name;

-- ========================================
-- 7. TESTE DE INSERÇÃO (OPCIONAL)
-- ========================================

-- Descomente as linhas abaixo para testar inserções
-- (Certifique-se de ter um domínio criado primeiro)

/*
-- Inserir configuração de segurança de teste
INSERT INTO public.ai_security_settings (domain_id, mask_pii, escalate_to_human)
SELECT id, true, false
FROM public.domains
LIMIT 1
ON CONFLICT (domain_id) DO NOTHING;

-- Verificar se foi inserido
SELECT 'Teste de inserção:' as info;
SELECT * FROM public.ai_security_settings LIMIT 1;
*/

-- ========================================
-- 8. RESUMO FINAL
-- ========================================

SELECT 
    '🎉 TESTE DO MÓDULO DE IA CONCLUÍDO' as status,
    COUNT(*) as total_tabelas_ai
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%';

SELECT 
    '📊 ESTATÍSTICAS:' as info,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'ai_%') as total_politicas,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE 'ai_%') as total_indices,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND event_object_table LIKE 'ai_%') as total_triggers;
