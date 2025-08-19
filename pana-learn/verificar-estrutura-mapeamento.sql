-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA CURSO_QUIZ_MAPPING
-- ========================================
-- Execute este script para ver a estrutura atual

SELECT '=== ESTRUTURA ATUAL CURSO_QUIZ_MAPPING ===' as info;

-- Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'curso_quiz_mapping'
AND table_schema = 'public';

-- Verificar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'curso_quiz_mapping'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT 
  cqm.*,
  c.nome as curso_nome,
  q.titulo as quiz_titulo
FROM curso_quiz_mapping cqm
LEFT JOIN cursos c ON cqm.curso_id = c.id
LEFT JOIN quizzes q ON cqm.quiz_id = q.id
LIMIT 10;

-- Verificar se existe coluna quiz_categoria
SELECT '=== VERIFICANDO COLUNA QUIZ_CATEGORIA ===' as info;
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'curso_quiz_mapping'
AND table_schema = 'public'
AND column_name = 'quiz_categoria';
