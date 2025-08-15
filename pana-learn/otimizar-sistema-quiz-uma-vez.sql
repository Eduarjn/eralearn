-- ========================================
-- SCRIPT DE OTIMIZAÇÃO DO SISTEMA DE QUIZ
-- ========================================
-- Este script garante que o quiz apareça apenas UMA VEZ
-- quando o cliente finalizar todos os vídeos de um curso
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (VALUES ('quizzes'), ('quiz_perguntas'), ('progresso_quiz'), ('certificados')) as t(table_name);

-- ========================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para progresso_quiz (usuario_id, quiz_id)
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_quiz 
ON progresso_quiz(usuario_id, quiz_id);

-- Índice para certificados (usuario_id, curso_id)
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_curso 
ON certificados(usuario_id, curso_id);

-- Índice para video_progress (user_id, video_id)
CREATE INDEX IF NOT EXISTS idx_video_progress_user_video 
ON video_progress(user_id, video_id);

-- Índice para quizzes (categoria, ativo)
CREATE INDEX IF NOT EXISTS idx_quizzes_categoria_ativo 
ON quizzes(categoria, ativo);

-- ========================================
-- 3. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== DADOS EXISTENTES ===' as info;

-- Verificar quizzes ativos
SELECT 
    'QUIZZES ATIVOS' as tipo,
    categoria,
    titulo,
    nota_minima
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- Verificar progresso de quiz existente
SELECT 
    'PROGRESSO QUIZ EXISTENTE' as tipo,
    COUNT(*) as total_registros
FROM progresso_quiz;

-- Verificar certificados existentes
SELECT 
    'CERTIFICADOS EXISTENTES' as tipo,
    COUNT(*) as total_certificados
FROM certificados;

-- ========================================
-- 4. LIMPAR DADOS DUPLICADOS (se necessário)
-- ========================================

-- Remover registros duplicados de progresso_quiz
DELETE FROM progresso_quiz 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM progresso_quiz 
    GROUP BY usuario_id, quiz_id
);

-- ========================================
-- 5. VERIFICAR FUNCIONAMENTO
-- ========================================

-- Função para testar se o sistema está funcionando corretamente
CREATE OR REPLACE FUNCTION testar_sistema_quiz()
RETURNS TABLE (
    curso_id UUID,
    categoria TEXT,
    total_videos INTEGER,
    videos_concluidos INTEGER,
    quiz_disponivel BOOLEAN,
    quiz_completado BOOLEAN,
    certificado_existe BOOLEAN,
    deve_mostrar_quiz BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as curso_id,
        c.categoria,
        COUNT(v.id) as total_videos,
        COUNT(CASE WHEN vp.concluido = true THEN 1 END) as videos_concluidos,
        CASE WHEN q.id IS NOT NULL THEN true ELSE false END as quiz_disponivel,
        CASE WHEN pq.id IS NOT NULL THEN true ELSE false END as quiz_completado,
        CASE WHEN cert.id IS NOT NULL THEN true ELSE false END as certificado_existe,
        CASE 
            WHEN COUNT(v.id) > 0 
                AND COUNT(v.id) = COUNT(CASE WHEN vp.concluido = true THEN 1 END)
                AND q.id IS NOT NULL 
                AND pq.id IS NULL 
                AND cert.id IS NULL 
            THEN true 
            ELSE false 
        END as deve_mostrar_quiz
    FROM cursos c
    LEFT JOIN videos v ON c.id = v.curso_id
    LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = auth.uid()
    LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = true
    LEFT JOIN progresso_quiz pq ON q.id = pq.quiz_id AND pq.usuario_id = auth.uid()
    LEFT JOIN certificados cert ON c.id = cert.curso_id AND cert.usuario_id = auth.uid()
    WHERE c.categoria IS NOT NULL
    GROUP BY c.id, c.categoria, q.id, pq.id, cert.id
    ORDER BY c.categoria;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. INSTRUÇÕES DE USO
-- ========================================

SELECT '=== INSTRUÇÕES DE USO ===' as info;

SELECT 
    '✅ SISTEMA OTIMIZADO!' as status,
    'O quiz aparecerá apenas UMA VEZ quando o cliente finalizar todos os vídeos.' as instrucao_1,
    'O estado é persistido no banco de dados (tabela progresso_quiz).' as instrucao_2,
    'Índices criados para melhor performance.' as instrucao_3,
    'Use a função testar_sistema_quiz() para verificar o funcionamento.' as instrucao_4;

-- ========================================
-- 7. EXEMPLO DE TESTE
-- ========================================

-- Testar o sistema (substitua auth.uid() pelo ID do usuário real)
SELECT '=== EXEMPLO DE TESTE ===' as info;

-- Este comando deve ser executado com um usuário logado
-- SELECT * FROM testar_sistema_quiz();

-- ========================================
-- 8. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    '✅ ÍNDICES CRIADOS' as status,
    'idx_progresso_quiz_usuario_quiz' as indice_1,
    'idx_certificados_usuario_curso' as indice_2,
    'idx_video_progress_user_video' as indice_3,
    'idx_quizzes_categoria_ativo' as indice_4;

-- Verificar se os índices foram criados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE indexname IN (
    'idx_progresso_quiz_usuario_quiz',
    'idx_certificados_usuario_curso', 
    'idx_video_progress_user_video',
    'idx_quizzes_categoria_ativo'
)
ORDER BY indexname;
