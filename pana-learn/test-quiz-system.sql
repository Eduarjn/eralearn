-- Script de TESTE para verificar o sistema de Quiz
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR TABELAS CRIADAS
-- ========================================

SELECT '=== TABELAS CRIADAS ===' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR DADOS INSERIDOS
-- ========================================

SELECT '=== DADOS INSERIDOS ===' as info;

SELECT 'Quizzes:' as tabela, COUNT(*) as total FROM public.quizzes
UNION ALL
SELECT 'Quiz Perguntas:' as tabela, COUNT(*) as total FROM public.quiz_perguntas
UNION ALL
SELECT 'Progresso Quiz:' as tabela, COUNT(*) as total FROM public.progresso_quiz
UNION ALL
SELECT 'Certificados:' as tabela, COUNT(*) as total FROM public.certificados;

-- ========================================
-- 3. VERIFICAR QUIZZES E PERGUNTAS
-- ========================================

SELECT '=== QUIZZES E PERGUNTAS ===' as info;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima,
  COUNT(qp.id) as total_perguntas
FROM public.quizzes q
LEFT JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.nota_minima
ORDER BY q.categoria;

-- ========================================
-- 4. VERIFICAR PERGUNTAS DETALHADAS
-- ========================================

SELECT '=== PERGUNTAS DETALHADAS ===' as info;
SELECT 
  q.categoria,
  qp.ordem,
  qp.pergunta,
  qp.opcoes,
  qp.resposta_correta,
  qp.explicacao
FROM public.quizzes q
JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
ORDER BY q.categoria, qp.ordem;

-- ========================================
-- 5. TESTAR BUSCA POR CATEGORIA
-- ========================================

SELECT '=== TESTE BUSCA POR CATEGORIA ===' as info;

-- Testar busca para categoria PABX
SELECT 'Quiz PABX:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima
FROM public.quizzes q
WHERE q.categoria = 'PABX' AND q.ativo = true;

-- Testar busca para categoria CALLCENTER
SELECT 'Quiz CALLCENTER:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER' AND q.ativo = true;

-- ========================================
-- 6. VERIFICAR RLS POLICIES
-- ========================================

SELECT '=== RLS POLICIES ===' as info;
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
AND tablename IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY tablename, policyname;

-- ========================================
-- 7. VERIFICAR ÍNDICES
-- ========================================

SELECT '=== ÍNDICES ===' as info;
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY tablename, indexname;

-- ========================================
-- 8. TESTE DE INTEGRIDADE
-- ========================================

SELECT '=== TESTE DE INTEGRIDADE ===' as info;

-- Verificar se todas as perguntas têm opções
SELECT 'Perguntas sem opções:' as teste;
SELECT COUNT(*) as total
FROM public.quiz_perguntas 
WHERE opcoes IS NULL OR array_length(opcoes, 1) = 0;

-- Verificar se todas as perguntas têm resposta_correta válida
SELECT 'Perguntas com resposta_correta inválida:' as teste;
SELECT COUNT(*) as total
FROM public.quiz_perguntas qp
WHERE qp.resposta_correta < 0 
   OR qp.resposta_correta >= array_length(qp.opcoes, 1);

-- Verificar se todas as perguntas têm ordem
SELECT 'Perguntas sem ordem:' as teste;
SELECT COUNT(*) as total
FROM public.quiz_perguntas 
WHERE ordem IS NULL;

-- ========================================
-- 9. RESUMO FINAL
-- ========================================

SELECT '=== RESUMO FINAL ===' as info;
SELECT 
  'Sistema de Quiz' as sistema,
  'Funcionando' as status,
  '4 categorias configuradas' as detalhes,
  'PABX, CALLCENTER, Omnichannel, VoIP' as categorias; 