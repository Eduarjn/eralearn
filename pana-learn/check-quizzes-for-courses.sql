-- Verificar se há quizzes configurados para os cursos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar cursos disponíveis
SELECT 
    id,
    nome,
    categoria,
    status
FROM cursos 
ORDER BY nome;

-- 2. Verificar quizzes disponíveis
SELECT 
    id,
    titulo,
    categoria,
    nota_minima,
    ativo
FROM quizzes 
ORDER BY categoria;

-- 3. Verificar se há quizzes para cada categoria de curso
SELECT 
    c.categoria as categoria_curso,
    COUNT(q.id) as total_quizzes,
    STRING_AGG(q.titulo, ', ') as quizzes_disponiveis
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria
GROUP BY c.categoria
ORDER BY c.categoria;

-- 4. Verificar se há perguntas nos quizzes
SELECT 
    q.titulo as quiz,
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo, q.categoria
ORDER BY q.categoria, q.titulo;

-- 5. Verificar se há progresso de quiz
SELECT 
    COUNT(*) as total_progresso_quiz
FROM progresso_quiz;

-- 6. Verificar se há certificados gerados
SELECT 
    COUNT(*) as total_certificados,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as certificados_ativos,
    COUNT(CASE WHEN status = 'revogado' THEN 1 END) as certificados_revogados,
    COUNT(CASE WHEN status = 'expirado' THEN 1 END) as certificados_expirados
FROM certificados;

-- 7. Verificar certificados por categoria
SELECT 
    categoria,
    COUNT(*) as total,
    AVG(nota_final) as media_nota
FROM certificados 
GROUP BY categoria 
ORDER BY total DESC; 