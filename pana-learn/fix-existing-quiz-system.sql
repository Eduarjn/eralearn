-- Script para verificar e corrigir sistema de quiz existente
-- Execute este script no Supabase SQL Editor
-- NÃO CRIA NOVOS DADOS - apenas verifica e corrige problemas

-- 1. Verificar estrutura atual
SELECT '=== VERIFICANDO SISTEMA EXISTENTE ===' as info;

-- Verificar quizzes existentes
SELECT 
    'QUIZZES EXISTENTES' as tipo,
    COUNT(*) as total
FROM quizzes;

-- Verificar perguntas existentes
SELECT 
    'PERGUNTAS EXISTENTES' as tipo,
    COUNT(*) as total
FROM quiz_perguntas;

-- 2. Verificar dados por categoria
SELECT '=== DADOS POR CATEGORIA ===' as info;

SELECT 
    q.categoria,
    q.titulo,
    q.nota_minima,
    q.ativo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.nota_minima, q.ativo
ORDER BY q.categoria;

-- 3. Verificar políticas RLS existentes
SELECT '=== POLÍTICAS RLS ATUAIS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- 4. Testar consultas que o frontend faz
SELECT '=== TESTE CONSULTAS FRONTEND ===' as info;

-- Testar consulta para PABX (simular o que o hook useQuiz faz)
SELECT 
    'PABX' as categoria_teste,
    COUNT(qp.id) as total_perguntas,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN 'OK'
        ELSE 'PROBLEMA - SEM PERGUNTAS'
    END as status
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX' AND q.ativo = TRUE
GROUP BY q.categoria;

-- Testar consulta para Omnichannel
SELECT 
    'Omnichannel' as categoria_teste,
    COUNT(qp.id) as total_perguntas,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN 'OK'
        ELSE 'PROBLEMA - SEM PERGUNTAS'
    END as status
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'Omnichannel' AND q.ativo = TRUE
GROUP BY q.categoria;

-- Testar consulta para CALLCENTER
SELECT 
    'CALLCENTER' as categoria_teste,
    COUNT(qp.id) as total_perguntas,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN 'OK'
        ELSE 'PROBLEMA - SEM PERGUNTAS'
    END as status
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'CALLCENTER' AND q.ativo = TRUE
GROUP BY q.categoria;

-- Testar consulta para VoIP
SELECT 
    'VoIP' as categoria_teste,
    COUNT(qp.id) as total_perguntas,
    CASE 
        WHEN COUNT(qp.id) > 0 THEN 'OK'
        ELSE 'PROBLEMA - SEM PERGUNTAS'
    END as status
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'VoIP' AND q.ativo = TRUE
GROUP BY q.categoria;

-- 5. Verificar se há problemas de RLS
SELECT '=== VERIFICANDO PROBLEMAS RLS ===' as info;

-- Verificar se as tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename;

-- 6. Corrigir políticas RLS se necessário (conservador)
DO $$
BEGIN
    -- Verificar se há políticas RLS para quizzes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes') THEN
        RAISE NOTICE 'Criando política RLS para quizzes...';
        CREATE POLICY "Todos podem ver quizzes ativos" ON quizzes
            FOR SELECT USING (ativo = TRUE);
        RAISE NOTICE 'Política para quizzes criada';
    ELSE
        RAISE NOTICE 'Políticas RLS para quizzes já existem';
    END IF;
    
    -- Verificar se há políticas RLS para quiz_perguntas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_perguntas') THEN
        RAISE NOTICE 'Criando política RLS para quiz_perguntas...';
        CREATE POLICY "Todos podem ver perguntas de quizzes ativos" ON quiz_perguntas
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM quizzes q 
                    WHERE q.id = quiz_perguntas.quiz_id 
                    AND q.ativo = TRUE
                )
            );
        RAISE NOTICE 'Política para quiz_perguntas criada';
    ELSE
        RAISE NOTICE 'Políticas RLS para quiz_perguntas já existem';
    END IF;
END $$;

-- 7. Verificar se há problemas de dados
SELECT '=== VERIFICANDO INTEGRIDADE DOS DADOS ===' as info;

-- Verificar se há quizzes sem perguntas
SELECT 
    'QUIZZES SEM PERGUNTAS' as problema,
    q.categoria,
    q.titulo
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE qp.id IS NULL AND q.ativo = TRUE;

-- Verificar se há perguntas órfãs (sem quiz)
SELECT 
    'PERGUNTAS ÓRFÃS' as problema,
    COUNT(*) as total
FROM quiz_perguntas qp
LEFT JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.id IS NULL;

-- 8. Verificar categorias de cursos vs quizzes
SELECT '=== VERIFICAÇÃO CATEGORIAS ===' as info;

SELECT 
    c.categoria as categoria_curso,
    CASE 
        WHEN q.id IS NOT NULL THEN 'TEM QUIZ'
        ELSE 'SEM QUIZ'
    END as status_quiz,
    COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.categoria IS NOT NULL
GROUP BY c.categoria, q.id
ORDER BY c.categoria;

-- 9. Testar consulta exata que o frontend faz
SELECT '=== CONSULTA EXATA DO FRONTEND ===' as info;

-- Simular exatamente a consulta que o hook useQuiz faz
SELECT 
    q.id, 
    q.titulo, 
    q.descricao,
    q.nota_minima,
    qp.id as pergunta_id,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.explicacao,
    qp.ordem
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
    AND q.ativo = TRUE
ORDER BY qp.ordem;

-- 10. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;

SELECT 
    'Sistema de quiz verificado!' as status,
    'Verifique os resultados acima para identificar problemas.' as mensagem,
    'Se houver problemas, execute as correções necessárias.' as proximo_passo;

-- 11. Resumo executivo
SELECT '=== RESUMO EXECUTIVO ===' as info;

SELECT 
    (SELECT COUNT(*) FROM quizzes) as total_quizzes,
    (SELECT COUNT(*) FROM quiz_perguntas) as total_perguntas,
    (SELECT COUNT(DISTINCT categoria) FROM quizzes) as categorias_com_quiz,
    (SELECT COUNT(DISTINCT categoria) FROM cursos WHERE categoria IS NOT NULL) as categorias_de_cursos,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'quizzes') > 0 
        AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'quiz_perguntas') > 0
        THEN 'RLS CONFIGURADO'
        ELSE 'RLS PENDENTE'
    END as status_rls; 