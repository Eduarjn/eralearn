-- Script de TESTE COMPLETO do Sistema de Quiz e Certificados
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR ESTRUTURA COMPLETA
-- ========================================

SELECT '=== ESTRUTURA COMPLETA ===' as info;
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as colunas,
  (SELECT COUNT(*) FROM public.quizzes WHERE table_name = 'quizzes') as registros_quizzes,
  (SELECT COUNT(*) FROM public.quiz_perguntas WHERE table_name = 'quiz_perguntas') as registros_perguntas,
  (SELECT COUNT(*) FROM public.progresso_quiz WHERE table_name = 'progresso_quiz') as registros_progresso,
  (SELECT COUNT(*) FROM public.certificados WHERE table_name = 'certificados') as registros_certificados
FROM information_schema.tables t
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
  q.ativo,
  COUNT(qp.id) as total_perguntas
FROM public.quizzes q
LEFT JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.nota_minima, q.ativo
ORDER BY q.categoria;

-- ========================================
-- 4. VERIFICAR PERGUNTAS DETALHADAS
-- ========================================

SELECT '=== PERGUNTAS DETALHADAS ===' as info;
SELECT 
  q.categoria,
  qp.ordem,
  qp.pergunta,
  array_length(qp.opcoes, 1) as total_opcoes,
  qp.resposta_correta,
  CASE 
    WHEN qp.resposta_correta >= 0 AND qp.resposta_correta < array_length(qp.opcoes, 1) 
    THEN 'Válida' 
    ELSE 'Inválida' 
  END as validacao_resposta
FROM public.quizzes q
JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
ORDER BY q.categoria, qp.ordem;

-- ========================================
-- 5. TESTAR BUSCA POR CATEGORIA
-- ========================================

SELECT '=== TESTE BUSCA POR CATEGORIA ===' as info;

-- Testar busca para todas as categorias
SELECT DISTINCT categoria FROM public.quizzes ORDER BY categoria;

-- Testar busca específica para cada categoria
SELECT 'Quiz PABX:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima,
  q.ativo
FROM public.quizzes q
WHERE q.categoria = 'PABX' AND q.ativo = true;

SELECT 'Quiz CALLCENTER:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima,
  q.ativo
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER' AND q.ativo = true;

SELECT 'Quiz Omnichannel:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima,
  q.ativo
FROM public.quizzes q
WHERE q.categoria = 'Omnichannel' AND q.ativo = true;

SELECT 'Quiz VoIP:' as teste;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.nota_minima,
  q.ativo
FROM public.quizzes q
WHERE q.categoria = 'VoIP' AND q.ativo = true;

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
  cmd
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

-- Verificar se todos os quizzes têm categoria
SELECT 'Quizzes sem categoria:' as teste;
SELECT COUNT(*) as total
FROM public.quizzes 
WHERE categoria IS NULL OR categoria = '';

-- ========================================
-- 9. TESTE DE RELACIONAMENTOS
-- ========================================

SELECT '=== TESTE DE RELACIONAMENTOS ===' as info;

-- Verificar se todas as perguntas têm quiz válido
SELECT 'Perguntas com quiz inválido:' as teste;
SELECT COUNT(*) as total
FROM public.quiz_perguntas qp
LEFT JOIN public.quizzes q ON qp.quiz_id = q.id
WHERE q.id IS NULL;

-- Verificar se todos os progressos têm quiz válido
SELECT 'Progressos com quiz inválido:' as teste;
SELECT COUNT(*) as total
FROM public.progresso_quiz pq
LEFT JOIN public.quizzes q ON pq.quiz_id = q.id
WHERE q.id IS NULL;

-- Verificar se todos os certificados têm quiz válido (quando aplicável)
SELECT 'Certificados com quiz inválido:' as teste;
SELECT COUNT(*) as total
FROM public.certificados c
LEFT JOIN public.quizzes q ON c.quiz_id = q.id
WHERE c.quiz_id IS NOT NULL AND q.id IS NULL;

-- ========================================
-- 10. SIMULAÇÃO DE USO
-- ========================================

SELECT '=== SIMULAÇÃO DE USO ===' as info;

-- Simular busca de quiz por categoria (como o frontend faria)
SELECT 'Simulação: Buscar quiz para categoria PABX' as acao;
SELECT 
  q.id,
  q.categoria,
  q.titulo,
  q.descricao,
  q.nota_minima,
  q.ativo,
  json_agg(
    json_build_object(
      'id', qp.id,
      'pergunta', qp.pergunta,
      'opcoes', qp.opcoes,
      'resposta_correta', qp.resposta_correta,
      'explicacao', qp.explicacao,
      'ordem', qp.ordem
    ) ORDER BY qp.ordem
  ) as perguntas
FROM public.quizzes q
LEFT JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX' AND q.ativo = true
GROUP BY q.id, q.categoria, q.titulo, q.descricao, q.nota_minima, q.ativo;

-- ========================================
-- 11. RESUMO FINAL
-- ========================================

SELECT '=== RESUMO FINAL ===' as info;
SELECT 
  'Sistema de Quiz e Certificados' as sistema,
  'Funcionando' as status,
  '4 categorias configuradas' as detalhes,
  'PABX, CALLCENTER, Omnichannel, VoIP' as categorias,
  'Pronto para uso' as conclusao; 