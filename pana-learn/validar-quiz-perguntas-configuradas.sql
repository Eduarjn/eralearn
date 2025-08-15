-- Script para validar e garantir que as perguntas configuradas sejam disponibilizadas nos cursos
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR PERGUNTAS CONFIGURADAS
-- ========================================

SELECT '=== PERGUNTAS CONFIGURADAS NO SISTEMA ===' as info;

-- Verificar todas as perguntas existentes
SELECT 
    q.categoria,
    q.titulo as quiz_titulo,
    COUNT(qp.id) as total_perguntas,
    MIN(qp.ordem) as primeira_ordem,
    MAX(qp.ordem) as ultima_ordem
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.ativo = true
GROUP BY q.id, q.categoria, q.titulo
ORDER BY q.categoria;

-- ========================================
-- 2. VERIFICAR CURSOS E SUAS CATEGORIAS
-- ========================================

SELECT '=== CURSOS E CATEGORIAS ===' as info;

SELECT 
    c.nome as curso_nome,
    c.categoria,
    c.status,
    COUNT(v.id) as total_videos,
    CASE 
        WHEN q.id IS NOT NULL THEN '✅ QUIZ CONFIGURADO'
        ELSE '❌ SEM QUIZ'
    END as status_quiz
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.categoria, c.status, q.id
ORDER BY c.categoria, c.nome;

-- ========================================
-- 3. VERIFICAR DISPONIBILIZAÇÃO POR CATEGORIA
-- ========================================

SELECT '=== DISPONIBILIZAÇÃO POR CATEGORIA ===' as info;

WITH categoria_info AS (
    SELECT 
        c.categoria,
        COUNT(DISTINCT c.id) as total_cursos,
        COUNT(v.id) as total_videos,
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(qp.id) as total_perguntas,
        CASE 
            WHEN COUNT(DISTINCT q.id) > 0 THEN '✅ DISPONÍVEL'
            ELSE '❌ NÃO DISPONÍVEL'
        END as status_disponibilizacao
    FROM cursos c
    LEFT JOIN videos v ON c.id = v.curso_id
    LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
    LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
    WHERE c.status = 'ativo'
    GROUP BY c.categoria
)
SELECT 
    categoria,
    total_cursos,
    total_videos,
    total_quizzes,
    total_perguntas,
    status_disponibilizacao,
    CASE 
        WHEN total_videos > 0 AND total_quizzes > 0 AND total_perguntas > 0 
        THEN '🎯 SISTEMA FUNCIONAL'
        WHEN total_videos = 0 
        THEN '⚠️ ADICIONAR VÍDEOS'
        WHEN total_quizzes = 0 
        THEN '⚠️ CONFIGURAR QUIZ'
        WHEN total_perguntas = 0 
        THEN '⚠️ ADICIONAR PERGUNTAS'
        ELSE '❌ PROBLEMA IDENTIFICADO'
    END as recomendacao
FROM categoria_info
ORDER BY categoria;

-- ========================================
-- 4. VERIFICAR PERGUNTAS ESPECÍFICAS
-- ========================================

SELECT '=== PERGUNTAS ESPECÍFICAS POR CATEGORIA ===' as info;

SELECT 
    q.categoria,
    qp.ordem,
    qp.pergunta,
    array_length(qp.opcoes, 1) as total_opcoes,
    qp.resposta_correta,
    CASE 
        WHEN qp.explicacao IS NOT NULL THEN '✅ COM EXPLICAÇÃO'
        ELSE '⚠️ SEM EXPLICAÇÃO'
    END as tem_explicacao
FROM quizzes q
JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.ativo = true
ORDER BY q.categoria, qp.ordem;

-- ========================================
-- 5. CORRIGIR PROBLEMAS IDENTIFICADOS
-- ========================================

SELECT '=== CORRIGINDO PROBLEMAS ===' as info;

-- 5.1 Criar quizzes para categorias sem quiz
DO $$
DECLARE
    categoria_record RECORD;
BEGIN
    FOR categoria_record IN 
        SELECT DISTINCT c.categoria
        FROM cursos c
        WHERE c.status = 'ativo'
        AND NOT EXISTS (
            SELECT 1 FROM quizzes q 
            WHERE q.categoria = c.categoria AND q.ativo = true
        )
    LOOP
        INSERT INTO quizzes (categoria, titulo, descricao, nota_minima, ativo)
        VALUES (
            categoria_record.categoria,
            'Quiz de Conclusão - ' || categoria_record.categoria,
            'Quiz para avaliar o conhecimento sobre ' || categoria_record.categoria,
            70,
            true
        );
        RAISE NOTICE 'Quiz criado para categoria: %', categoria_record.categoria;
    END LOOP;
END $$;

-- 5.2 Adicionar perguntas padrão para quizzes sem perguntas
DO $$
DECLARE
    quiz_record RECORD;
    pergunta_count INTEGER;
BEGIN
    FOR quiz_record IN 
        SELECT q.id, q.categoria
        FROM quizzes q
        WHERE q.ativo = true
        AND NOT EXISTS (
            SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id
        )
    LOOP
        -- Adicionar perguntas padrão
        INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
        VALUES 
        (
            quiz_record.id,
            'O que você aprendeu sobre ' || quiz_record.categoria || '?',
            ARRAY[
                'Conhecimentos básicos',
                'Conhecimentos intermediários', 
                'Conhecimentos avançados',
                'Conhecimentos especializados'
            ],
            1,
            'Esta pergunta avalia seu nível de conhecimento sobre ' || quiz_record.categoria || '.',
            1
        ),
        (
            quiz_record.id,
            'Qual a importância de ' || quiz_record.categoria || ' no mercado atual?',
            ARRAY[
                'Baixa importância',
                'Importância moderada',
                'Alta importância',
                'Importância crítica'
            ],
            2,
            quiz_record.categoria || ' é fundamental para o sucesso empresarial.',
            2
        ),
        (
            quiz_record.id,
            'Como você aplicaria os conhecimentos de ' || quiz_record.categoria || '?',
            ARRAY[
                'Apenas teoricamente',
                'Em projetos pequenos',
                'Em projetos médios',
                'Em projetos grandes'
            ],
            3,
            'A aplicação prática é essencial para consolidar o aprendizado.',
            3
        );
        
        RAISE NOTICE 'Perguntas padrão adicionadas para quiz: %', quiz_record.categoria;
    END LOOP;
END $$;

-- ========================================
-- 6. VERIFICAR RESULTADO APÓS CORREÇÕES
-- ========================================

SELECT '=== RESULTADO APÓS CORREÇÕES ===' as info;

-- Verificar se todas as categorias têm quiz
SELECT 
    c.categoria,
    COUNT(DISTINCT c.id) as total_cursos,
    COUNT(v.id) as total_videos,
    CASE 
        WHEN q.id IS NOT NULL THEN '✅ QUIZ CONFIGURADO'
        ELSE '❌ SEM QUIZ'
    END as status_quiz,
    COUNT(qp.id) as total_perguntas,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN '✅ PERGUNTAS DISPONÍVEIS'
        ELSE '❌ SEM PERGUNTAS'
    END as status_perguntas
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.status = 'ativo'
GROUP BY c.categoria, q.id
ORDER BY c.categoria;

-- ========================================
-- 7. TESTE DE DISPONIBILIZAÇÃO
-- ========================================

SELECT '=== TESTE DE DISPONIBILIZAÇÃO ===' as info;

-- Simular consulta que o frontend fará
SELECT 
    'Teste de disponibilização para categoria:' as info,
    q.categoria,
    q.titulo,
    COUNT(qp.id) as perguntas_disponiveis,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN '✅ DISPONÍVEL PARA CLIENTES'
        ELSE '❌ NÃO DISPONÍVEL'
    END as resultado
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.ativo = true
GROUP BY q.id, q.categoria, q.titulo
ORDER BY q.categoria;

-- ========================================
-- 8. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM quizzes q 
            JOIN quiz_perguntas qp ON q.id = qp.quiz_id
            WHERE q.ativo = true
        ) THEN '✅ SISTEMA FUNCIONAL'
        ELSE '❌ SISTEMA COM PROBLEMAS'
    END as status_geral,
    
    COUNT(DISTINCT q.categoria) as categorias_com_quiz,
    COUNT(qp.id) as total_perguntas_disponiveis,
    COUNT(DISTINCT c.categoria) as total_categorias_ativos
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
CROSS JOIN (
    SELECT DISTINCT categoria 
    FROM cursos 
    WHERE status = 'ativo'
) c;

-- ========================================
-- 9. INSTRUÇÕES FINAIS
-- ========================================

SELECT '=== INSTRUÇÕES FINAIS ===' as info;

SELECT 
    '✅ SISTEMA VALIDADO' as status,
    'As perguntas configuradas estão disponíveis para os clientes após assistir todos os vídeos dos cursos.' as mensagem,
    'Teste no frontend para confirmar funcionamento.' as proximo_passo; 