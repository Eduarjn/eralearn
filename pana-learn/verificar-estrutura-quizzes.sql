-- ========================================
-- VERIFICAR ESTRUTURA REAL DA TABELA QUIZZES
-- ========================================
-- Este script verifica a estrutura real da tabela quizzes

-- 1. Verificar todas as colunas da tabela quizzes
SELECT '=== ESTRUTURA DA TABELA QUIZZES ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'quizzes'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT * FROM quizzes LIMIT 5;

-- 3. Verificar se existe alguma coluna de nome
SELECT '=== VERIFICANDO COLUNAS DE NOME ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
  AND (column_name LIKE '%nome%' OR column_name LIKE '%name%' OR column_name LIKE '%title%');

-- 4. Verificar constraints
SELECT '=== CONSTRAINTS ===' as info;
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'quizzes';

-- 5. Instruções
SELECT '=== INSTRUÇÕES ===' as info;
SELECT 'Verifique a estrutura acima e ajuste os scripts conforme necessário' as instrucao;






