-- Script para testar se a correção do quiz funcionou
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o curso específico que está sendo testado
SELECT '=== VERIFICANDO CURSO ESPECÍFICO ===' as info;

SELECT 
    id,
    nome,
    categoria,
    status
FROM cursos 
WHERE id = 'ffb3391c-a260-4095-9794-18e3f2437bdd';

-- 2. Verificar se existe quiz para a categoria deste curso
SELECT '=== VERIFICANDO QUIZ PARA CATEGORIA ===' as info;

SELECT 
    q.id,
    q.titulo,
    q.categoria,
    q.ativo,
    COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.id = 'ffb3391c-a260-4095-9794-18e3f2437bdd'
GROUP BY q.id, q.titulo, q.categoria, q.ativo;

-- 3. Simular a consulta que o frontend fará agora (com categoria)
SELECT '=== TESTE CONSULTA CORRIGIDA ===' as info;

-- Primeiro, buscar a categoria do curso
SELECT 
    'Categoria do curso:' as info,
    categoria as valor
FROM cursos 
WHERE id = 'ffb3391c-a260-4095-9794-18e3f2437bdd';

-- Depois, buscar o quiz usando a categoria
SELECT 
    'Quiz encontrado:' as info,
    q.id,
    q.titulo,
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM cursos c
JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.id = 'ffb3391c-a260-4095-9794-18e3f2437bdd'
GROUP BY q.id, q.titulo, q.categoria;

-- 4. Verificar perguntas do quiz
SELECT '=== PERGUNTAS DO QUIZ ===' as info;

SELECT 
    qp.id,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.ordem
FROM cursos c
JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.id = 'ffb3391c-a260-4095-9794-18e3f2437bdd'
ORDER BY qp.ordem;

-- 5. Testar consulta exata que o frontend fará
SELECT '=== CONSULTA EXATA DO FRONTEND ===' as info;

-- Simular exatamente a consulta que o useQuiz fará agora
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
FROM cursos c
JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.id = 'ffb3391c-a260-4095-9794-18e3f2437bdd'
ORDER BY qp.ordem;

-- 6. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- 7. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM cursos c
            JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
            WHERE c.id = 'ffb3391c-a260-4095-9794-18e3f2437bdd'
        ) THEN '✅ QUIZ ENCONTRADO'
        ELSE '❌ QUIZ NÃO ENCONTRADO'
    END as status_quiz,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename IN ('quizzes', 'quiz_perguntas')
        ) THEN '✅ RLS CONFIGURADO'
        ELSE '❌ RLS PENDENTE'
    END as status_rls,
    
    'Agora teste no frontend clicando em "Apresentar Prova"' as proximo_passo; 