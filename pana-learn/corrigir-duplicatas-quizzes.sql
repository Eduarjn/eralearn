-- ========================================
-- CORRIGIR DUPLICATAS NA TABELA QUIZZES
-- ========================================
-- Este script resolve o erro de constraint única na categoria

-- 1. Verificar quizzes existentes
SELECT '=== VERIFICANDO QUIZZES EXISTENTES ===' as info;
SELECT 
    id,
    nome,
    categoria,
    ativo,
    created_at
FROM quizzes 
ORDER BY categoria, created_at;

-- 2. Verificar constraint única
SELECT '=== VERIFICANDO CONSTRAINT ÚNICA ===' as info;
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'quizzes' 
  AND constraint_type = 'UNIQUE';

-- 3. Verificar colunas da constraint
SELECT '=== VERIFICANDO COLUNAS DA CONSTRAINT ===' as info;
SELECT 
    kcu.constraint_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'quizzes' 
  AND tc.constraint_type = 'UNIQUE';

-- 4. Remover constraint única se existir
SELECT '=== REMOVENDO CONSTRAINT ÚNICA ===' as info;

-- Verificar se a constraint existe antes de tentar remover
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'quizzes' 
          AND constraint_name = 'quizzes_categoria_key'
    ) THEN
        ALTER TABLE quizzes DROP CONSTRAINT quizzes_categoria_key;
        RAISE NOTICE 'Constraint quizzes_categoria_key removida';
    ELSE
        RAISE NOTICE 'Constraint quizzes_categoria_key não existe';
    END IF;
END $$;

-- 5. Limpar quizzes duplicados mantendo apenas os mais recentes
SELECT '=== LIMPANDO QUIZZES DUPLICADOS ===' as info;

-- Desabilitar quizzes antigos com categorias duplicadas
UPDATE quizzes 
SET ativo = false 
WHERE id IN (
    SELECT q1.id
    FROM quizzes q1
    JOIN (
        SELECT categoria, MAX(created_at) as max_created
        FROM quizzes
        GROUP BY categoria
        HAVING COUNT(*) > 1
    ) q2 ON q1.categoria = q2.categoria
    WHERE q1.created_at < q2.max_created
);

-- 6. Verificar se ainda há duplicatas
SELECT '=== VERIFICANDO SE AINDA HÁ DUPLICATAS ===' as info;
SELECT 
    categoria,
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM quizzes 
GROUP BY categoria
HAVING COUNT(*) > 1;

-- 7. Garantir que apenas um quiz por categoria esteja ativo
SELECT '=== GARANTINDO UM QUIZ ATIVO POR CATEGORIA ===' as info;

-- Para cada categoria, manter apenas o quiz mais recente ativo
UPDATE quizzes 
SET ativo = false 
WHERE id IN (
    SELECT q1.id
    FROM quizzes q1
    JOIN (
        SELECT categoria, MAX(created_at) as max_created
        FROM quizzes
        WHERE ativo = true
        GROUP BY categoria
        HAVING COUNT(*) > 1
    ) q2 ON q1.categoria = q2.categoria
    WHERE q1.created_at < q2.max_created
    AND q1.ativo = true
);

-- 8. Verificar resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    categoria,
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM quizzes 
GROUP BY categoria
ORDER BY categoria;

-- 9. Listar quizzes ativos
SELECT '=== QUIZZES ATIVOS ===' as info;
SELECT 
    id,
    nome,
    categoria,
    ativo,
    created_at
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- 10. Verificar se o mapeamento ainda funciona
SELECT '=== VERIFICANDO MAPEAMENTO ===' as info;
SELECT 
    c.nome as curso,
    cqm.quiz_categoria,
    q.nome as quiz_nome,
    q.ativo as quiz_ativo
FROM cursos c
LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_categoria = q.categoria AND q.ativo = true
ORDER BY c.nome;

-- 11. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '1. Constraint única removida' as instrucao;
SELECT '2. Quizzes duplicados desabilitados' as instrucao;
SELECT '3. Apenas um quiz ativo por categoria' as instrucao;
SELECT '4. Mapeamento curso-quiz verificado' as instrucao;
SELECT '5. Agora execute o script sistema-quiz-admin-completo.sql novamente' as instrucao;

-- 12. Resumo das correções
SELECT '=== RESUMO DAS CORREÇÕES ===' as info;
SELECT '✅ Constraint única removida' as correcao;
SELECT '✅ Quizzes duplicados limpos' as correcao;
SELECT '✅ Um quiz ativo por categoria' as correcao;
SELECT '✅ Mapeamento verificado' as correcao;












































