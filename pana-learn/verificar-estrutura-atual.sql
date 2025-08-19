-- ========================================
-- VERIFICAÇÃO DA ESTRUTURA ATUAL
-- ========================================
-- Execute este script para verificar o estado atual das tabelas

-- 1. Verificar tabelas existentes
SELECT '=== TABELAS EXISTENTES ===' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cursos', 'videos', 'quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados', 'usuarios', 'video_progress')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela cursos
SELECT '=== ESTRUTURA DA TABELA CURSOS ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela videos
SELECT '=== ESTRUTURA DA TABELA VIDEOS ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar dados de cursos
SELECT '=== DADOS DOS CURSOS ===' as info;
SELECT 
  id,
  nome,
  categoria,
  status,
  data_criacao
FROM cursos 
ORDER BY nome;

-- 5. Verificar dados de vídeos
SELECT '=== DADOS DOS VÍDEOS ===' as info;
SELECT 
  v.id,
  v.titulo,
  v.categoria,
  v.curso_id,
  c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.titulo;

-- 6. Verificar se existem quizzes
SELECT '=== QUIZZES EXISTENTES ===' as info;
SELECT 
  q.id,
  q.titulo,
  q.categoria,
  q.curso_id,
  c.nome as curso_nome,
  q.ativo
FROM quizzes q
LEFT JOIN cursos c ON q.curso_id = c.id
ORDER BY q.titulo;

-- 7. Verificar perguntas dos quizzes
SELECT '=== PERGUNTAS DOS QUIZZES ===' as info;
SELECT 
  qp.id,
  qp.pergunta,
  q.titulo as quiz_titulo,
  qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
ORDER BY q.titulo, qp.ordem;

-- 8. Verificar certificados existentes
SELECT '=== CERTIFICADOS EXISTENTES ===' as info;
SELECT 
  c.id,
  c.usuario_id,
  c.curso_id,
  c.curso_nome,
  c.nota,
  c.data_conclusao
FROM certificados c
ORDER BY c.data_conclusao DESC;

-- 9. Verificar progresso de vídeos
SELECT '=== PROGRESSO DE VÍDEOS ===' as info;
SELECT 
  vp.user_id,
  v.titulo as video_titulo,
  vp.concluido,
  vp.percentual_assistido,
  vp.data_atualizacao
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
ORDER BY vp.data_atualizacao DESC
LIMIT 10;

-- 10. Verificar problemas de relacionamento
SELECT '=== PROBLEMAS DE RELACIONAMENTO ===' as info;

-- Vídeos sem curso associado
SELECT 'Vídeos sem curso:' as problema;
SELECT 
  id,
  titulo,
  categoria,
  curso_id
FROM videos 
WHERE curso_id IS NULL;

-- Cursos sem vídeos
SELECT 'Cursos sem vídeos:' as problema;
SELECT 
  c.id,
  c.nome,
  c.categoria
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE v.id IS NULL;

-- Quizzes sem perguntas
SELECT 'Quizzes sem perguntas:' as problema;
SELECT 
  q.id,
  q.titulo,
  q.categoria
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE qp.id IS NULL;

-- 11. Verificar RLS (Row Level Security)
SELECT '=== RLS (ROW LEVEL SECURITY) ===' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cursos', 'videos', 'quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados', 'usuarios', 'video_progress')
ORDER BY tablename;

-- 12. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('cursos', 'videos', 'quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados', 'usuarios', 'video_progress')
ORDER BY tablename, policyname;
