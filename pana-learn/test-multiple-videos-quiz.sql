-- Script para testar sistema de quiz com múltiplos vídeos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar cursos existentes
SELECT 
    id,
    nome,
    categoria,
    status
FROM cursos 
WHERE status = 'ativo'
ORDER BY nome;

-- 2. Verificar vídeos por curso
SELECT '=== VÍDEOS POR CURSO ===' as info;

SELECT 
    c.nome as curso,
    c.categoria,
    COUNT(v.id) as total_videos,
    COUNT(CASE WHEN v.id IS NOT NULL THEN 1 END) as videos_cadastrados
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.categoria
ORDER BY c.nome;

-- 3. Verificar quizzes por categoria
SELECT '=== QUIZZES POR CATEGORIA ===' as info;

SELECT 
    q.categoria,
    q.titulo,
    q.ativo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.ativo
ORDER BY q.categoria;

-- 4. Simular progresso de um usuário específico
SELECT '=== SIMULAÇÃO DE PROGRESSO ===' as info;

-- Escolher um curso para teste
SELECT 
    'Curso para teste:' as info,
    c.nome,
    c.categoria,
    COUNT(v.id) as total_videos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.categoria
ORDER BY COUNT(v.id) DESC
LIMIT 1;

-- 5. Verificar se há progresso de vídeos
SELECT '=== PROGRESSO DE VÍDEOS ===' as info;

SELECT 
    c.nome as curso,
    v.titulo as video,
    vp.concluido,
    vp.percentual_assistido,
    vp.data_conclusao
FROM cursos c
JOIN videos v ON c.id = v.curso_id
LEFT JOIN video_progress vp ON v.id = vp.video_id
WHERE c.status = 'ativo'
ORDER BY c.nome, v.ordem;

-- 6. Testar lógica de conclusão de curso
SELECT '=== TESTE LÓGICA DE CONCLUSÃO ===' as info;

-- Para cada curso, verificar se seria considerado concluído
WITH curso_progresso AS (
    SELECT 
        c.id as curso_id,
        c.nome as curso_nome,
        c.categoria,
        COUNT(v.id) as total_videos,
        COUNT(CASE WHEN vp.concluido = true THEN 1 END) as videos_concluidos,
        CASE 
            WHEN COUNT(v.id) > 0 AND COUNT(CASE WHEN vp.concluido = true THEN 1 END) = COUNT(v.id) 
            THEN 'CONCLUÍDO'
            WHEN COUNT(v.id) = 0 
            THEN 'SEM VÍDEOS'
            ELSE 'EM ANDAMENTO'
        END as status_curso
    FROM cursos c
    LEFT JOIN videos v ON c.id = v.curso_id
    LEFT JOIN video_progress vp ON v.id = vp.video_id
    WHERE c.status = 'ativo'
    GROUP BY c.id, c.nome, c.categoria
)
SELECT 
    curso_nome,
    categoria,
    total_videos,
    videos_concluidos,
    status_curso,
    CASE 
        WHEN status_curso = 'CONCLUÍDO' THEN '🎯 QUIZ DEVE APARECER'
        WHEN status_curso = 'SEM VÍDEOS' THEN '❌ CURSO SEM VÍDEOS'
        ELSE '⏳ QUIZ NÃO APARECE AINDA'
    END as resultado_quiz
FROM curso_progresso
ORDER BY status_curso, curso_nome;

-- 7. Verificar se há quiz configurado para cada categoria
SELECT '=== VERIFICAÇÃO DE QUIZ POR CATEGORIA ===' as info;

SELECT 
    c.categoria,
    COUNT(DISTINCT c.id) as total_cursos,
    CASE 
        WHEN q.id IS NOT NULL THEN '✅ QUIZ CONFIGURADO'
        ELSE '❌ SEM QUIZ'
    END as status_quiz,
    q.titulo as quiz_titulo,
    COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.status = 'ativo'
GROUP BY c.categoria, q.id, q.titulo
ORDER BY c.categoria;

-- 8. Recomendações para configuração
SELECT '=== RECOMENDAÇÕES ===' as info;

SELECT 
    'Para cursos sem vídeos:' as tipo,
    c.nome as curso,
    'Adicione vídeos na tabela videos' as acao
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.status = 'ativo' AND v.id IS NULL

UNION ALL

SELECT 
    'Para categorias sem quiz:' as tipo,
    c.categoria as curso,
    'Configure quiz para esta categoria' as acao
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
WHERE c.status = 'ativo' AND q.id IS NULL
GROUP BY c.categoria;

-- 9. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;

SELECT 
    'Sistema de múltiplos vídeos verificado!' as status,
    'Verifique os resultados acima para identificar configurações necessárias.' as mensagem,
    'Para testar: Adicione vídeos aos cursos e configure quizzes para todas as categorias.' as proximo_passo; 