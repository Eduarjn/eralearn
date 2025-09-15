-- ========================================
-- REMOVER TODOS OS TRIGGERS
-- ========================================
-- Este script remove TODOS os triggers problemáticos

-- 1. Listar todos os triggers existentes
SELECT '=== TRIGGERS EXISTENTES ===' as info;
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation
FROM information_schema.triggers 
ORDER BY event_object_table, trigger_name;

-- 2. Remover TODOS os triggers de quiz_perguntas
SELECT '=== REMOVENDO TRIGGERS QUIZ_PERGUNTAS ===' as info;

DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_updated_at_column ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at_column ON quiz_perguntas;

-- 3. Remover TODOS os triggers de quizzes
SELECT '=== REMOVENDO TRIGGERS QUIZZES ===' as info;

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
DROP TRIGGER IF EXISTS update_quizzes_timestamps ON quizzes;
DROP TRIGGER IF EXISTS update_updated_at_column ON quizzes;

-- 4. Remover TODOS os triggers de curso_quiz_mapping
SELECT '=== REMOVENDO TRIGGERS CURSO_QUIZ_MAPPING ===' as info;

DROP TRIGGER IF EXISTS update_curso_quiz_mapping_updated_at ON curso_quiz_mapping;
DROP TRIGGER IF EXISTS update_curso_quiz_mapping_timestamps ON curso_quiz_mapping;
DROP TRIGGER IF EXISTS update_updated_at_column ON curso_quiz_mapping;

-- 5. Remover TODOS os triggers de outras tabelas relacionadas
SELECT '=== REMOVENDO TRIGGERS OUTRAS TABELAS ===' as info;

DROP TRIGGER IF EXISTS update_certificados_updated_at ON certificados;
DROP TRIGGER IF EXISTS update_progresso_quiz_updated_at ON progresso_quiz;
DROP TRIGGER IF EXISTS update_cursos_updated_at ON cursos;
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;

-- 6. Verificar se ainda existem triggers
SELECT '=== VERIFICANDO TRIGGERS RESTANTES ===' as info;
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table IN ('quiz_perguntas', 'quizzes', 'curso_quiz_mapping', 'certificados', 'progresso_quiz', 'cursos', 'videos')
ORDER BY event_object_table, trigger_name;

-- 7. Adicionar campo updated_at SEM trigger
SELECT '=== ADICIONANDO CAMPO UPDATED_AT ===' as info;
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas'
ORDER BY ordinal_position;

-- 9. Instruções finais
SELECT '=== INSTRUÇÕES ===' as info;
SELECT '✅ TODOS os triggers foram removidos' as status;
SELECT '✅ Campo updated_at adicionado sem trigger' as status;
SELECT '✅ Agora execute solucao-ultra-simples-final.sql' as proximo_passo;






































