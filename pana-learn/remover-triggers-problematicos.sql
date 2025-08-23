-- ========================================
-- REMOVER TRIGGERS PROBLEMÁTICOS
-- ========================================
-- Este script remove os triggers que estão causando erro de updated_at

-- 1. Verificar triggers existentes
SELECT '=== VERIFICANDO TRIGGERS EXISTENTES ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('quiz_perguntas', 'quizzes')
ORDER BY trigger_name;

-- 2. Remover triggers específicos do quiz_perguntas
SELECT '=== REMOVENDO TRIGGERS QUIZ_PERGUNTAS ===' as info;

-- Remover trigger de updated_at se existir
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps ON quiz_perguntas;

-- 3. Verificar se a função update_updated_at_column está sendo usada
SELECT '=== VERIFICANDO FUNÇÃO UPDATE_UPDATED_AT_COLUMN ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column';

-- 4. Verificar se há outros objetos dependendo da função
SELECT '=== VERIFICANDO DEPENDÊNCIAS ===' as info;
SELECT 
    dependent_ns.nspname as dependent_schema,
    dependent_object.relname as dependent_object,
    pg_class.relname as dependent_table
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class ON pg_rewrite.ev_class = pg_class.oid 
JOIN pg_namespace dependent_ns ON pg_class.relnamespace = dependent_ns.oid
JOIN pg_proc ON pg_depend.refobjid = pg_proc.oid
WHERE pg_proc.proname = 'update_updated_at_column';

-- 5. Remover triggers de outras tabelas que possam estar causando problema
SELECT '=== REMOVENDO TRIGGERS DE OUTRAS TABELAS ===' as info;

-- Listar todas as tabelas que podem ter triggers problemáticos
SELECT 
    table_name,
    trigger_name
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%'
   OR trigger_name LIKE '%timestamp%'
ORDER BY table_name, trigger_name;

-- 6. Verificar se o campo updated_at existe em quiz_perguntas
SELECT '=== VERIFICANDO CAMPO UPDATED_AT ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'updated_at')
        THEN '✅ Campo updated_at existe em quiz_perguntas'
        ELSE '❌ Campo updated_at não existe em quiz_perguntas'
    END as status;

-- 7. Adicionar campo updated_at se não existir (sem trigger)
SELECT '=== ADICIONANDO CAMPO UPDATED_AT ===' as info;
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas'
ORDER BY ordinal_position;

-- 9. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Triggers problemáticos removidos' as status;
SELECT '✅ Campo updated_at adicionado sem trigger' as status;
SELECT '✅ Agora execute sistema-quiz-admin-simples.sql' as proximo_passo;













