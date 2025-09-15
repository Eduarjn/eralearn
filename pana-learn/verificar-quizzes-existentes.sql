-- ========================================
-- VERIFICAR QUIZZES EXISTENTES NO BANCO
-- ========================================

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM (
    VALUES 
        ('quizzes'),
        ('quiz_perguntas'), 
        ('progresso_quiz'),
        ('usuarios'),
        ('videos'),
        ('video_progress'),
        ('certificados')
) AS t(table_name);

-- 2. Verificar dados nas tabelas de quiz
SELECT 'QUIZZES:' as tabela, COUNT(*) as total FROM quizzes;
SELECT 'QUIZ_PERGUNTAS:' as tabela, COUNT(*) as total FROM quiz_perguntas;
SELECT 'PROGRESSO_QUIZ:' as tabela, COUNT(*) as total FROM progresso_quiz;

-- 3. Listar quizzes existentes
SELECT 
    id,
    titulo,
    categoria,
    nota_minima,
    ativo,
    data_criacao
FROM quizzes 
ORDER BY categoria;

-- 4. Contar perguntas por quiz
SELECT 
    q.titulo,
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo, q.categoria
ORDER BY q.categoria;

-- 5. Verificar usuários de teste
SELECT 
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios 
WHERE email IN ('admin@eralearn.com', 'cliente@eralearn.com', 'teste@eralearn.com')
ORDER BY tipo_usuario;

-- 6. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_perguntas', 'progresso_quiz')
ORDER BY tablename, policyname;

-- 7. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'usuarios')
ORDER BY tablename;


















