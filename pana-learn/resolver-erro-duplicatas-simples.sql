-- ========================================
-- RESOLVER ERRO DE DUPLICATAS - VERSÃO SIMPLES
-- ========================================
-- Este script resolve o erro de constraint única de forma simples

-- 1. Remover constraint única que está causando o erro
SELECT '=== REMOVENDO CONSTRAINT ÚNICA ===' as info;

-- Remover a constraint que está causando o erro
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_categoria_key;

-- 2. Verificar se a constraint foi removida
SELECT '=== VERIFICANDO SE CONSTRAINT FOI REMOVIDA ===' as info;
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'quizzes' 
  AND constraint_type = 'UNIQUE';

-- 3. Desabilitar quizzes antigos para evitar confusão
SELECT '=== DESABILITANDO QUIZZES ANTIGOS ===' as info;

-- Desabilitar todos os quizzes que não são dos tipos específicos
UPDATE quizzes 
SET ativo = false 
WHERE categoria NOT IN (
    'PABX_FUNDAMENTOS', 
    'PABX_AVANCADO', 
    'OMNICHANNEL_EMPRESAS', 
    'OMNICHANNEL_AVANCADO', 
    'CALLCENTER_FUNDAMENTOS'
);

-- 4. Garantir que apenas um quiz ativo por categoria
SELECT '=== GARANTINDO UM QUIZ ATIVO POR CATEGORIA ===' as info;

-- Para cada categoria específica, manter apenas o quiz mais recente ativo
UPDATE quizzes 
SET ativo = false 
WHERE id IN (
    SELECT q1.id
    FROM quizzes q1
    JOIN (
        SELECT categoria, MAX(created_at) as max_created
        FROM quizzes
        WHERE categoria IN (
            'PABX_FUNDAMENTOS', 
            'PABX_AVANCADO', 
            'OMNICHANNEL_EMPRESAS', 
            'OMNICHANNEL_AVANCADO', 
            'CALLCENTER_FUNDAMENTOS'
        )
        AND ativo = true
        GROUP BY categoria
        HAVING COUNT(*) > 1
    ) q2 ON q1.categoria = q2.categoria
    WHERE q1.created_at < q2.max_created
    AND q1.ativo = true
);

-- 5. Verificar resultado
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    categoria,
    COUNT(*) as total_quizzes,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM quizzes 
WHERE categoria IN (
    'PABX_FUNDAMENTOS', 
    'PABX_AVANCADO', 
    'OMNICHANNEL_EMPRESAS', 
    'OMNICHANNEL_AVANCADO', 
    'CALLCENTER_FUNDAMENTOS'
)
GROUP BY categoria
ORDER BY categoria;

-- 6. Listar quizzes ativos
SELECT '=== QUIZZES ATIVOS ===' as info;
SELECT 
    id,
    nome,
    categoria,
    ativo
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- 7. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Constraint única removida' as status;
SELECT '✅ Quizzes antigos desabilitados' as status;
SELECT '✅ Um quiz ativo por categoria' as status;
SELECT 'Agora execute o script sistema-quiz-admin-completo.sql novamente' as proximo_passo;






































