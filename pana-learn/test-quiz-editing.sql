-- Script de TESTE para funcionalidade de edição de perguntas
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR PERGUNTAS ATUAIS
-- ========================================

SELECT '=== PERGUNTAS ATUAIS ===' as info;
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
-- 2. TESTAR ATUALIZAÇÃO DE PERGUNTA
-- ========================================

SELECT '=== TESTE DE ATUALIZAÇÃO ===' as info;

-- Pegar uma pergunta para testar
SELECT 'Pergunta antes da atualização:' as teste;
SELECT 
  id,
  pergunta,
  opcoes,
  resposta_correta,
  explicacao
FROM public.quiz_perguntas 
WHERE quiz_id = (SELECT id FROM public.quizzes WHERE categoria = 'PABX' LIMIT 1)
ORDER BY ordem
LIMIT 1;

-- ========================================
-- 3. SIMULAR ATUALIZAÇÃO (comentado)
-- ========================================

/*
-- Descomente para testar a atualização
UPDATE public.quiz_perguntas 
SET 
  pergunta = 'Pergunta atualizada via SQL',
  opcoes = ARRAY['Opção A atualizada', 'Opção B atualizada', 'Opção C atualizada'],
  resposta_correta = 1,
  explicacao = 'Explicação atualizada via SQL'
WHERE id = 'ID_DA_PERGUNTA_AQUI';

-- Verificar após atualização
SELECT 'Pergunta após atualização:' as teste;
SELECT 
  id,
  pergunta,
  opcoes,
  resposta_correta,
  explicacao
FROM public.quiz_perguntas 
WHERE id = 'ID_DA_PERGUNTA_AQUI';
*/

-- ========================================
-- 4. VERIFICAR PERMISSÕES DE EDIÇÃO
-- ========================================

SELECT '=== PERMISSÕES DE EDIÇÃO ===' as info;

-- Verificar se as políticas RLS permitem UPDATE
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
AND tablename = 'quiz_perguntas'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- ========================================
-- 5. TESTAR BUSCA DE PERGUNTAS POR QUIZ
-- ========================================

SELECT '=== BUSCA DE PERGUNTAS POR QUIZ ===' as info;

-- Simular a query que o frontend fará
SELECT 'Quiz PABX - Perguntas:' as teste;
SELECT 
  qp.id,
  qp.pergunta,
  qp.opcoes,
  qp.resposta_correta,
  qp.explicacao,
  qp.ordem
FROM public.quiz_perguntas qp
JOIN public.quizzes q ON qp.quiz_id = q.id
WHERE q.categoria = 'PABX'
ORDER BY qp.ordem;

SELECT 'Quiz CALLCENTER - Perguntas:' as teste;
SELECT 
  qp.id,
  qp.pergunta,
  qp.opcoes,
  qp.resposta_correta,
  qp.explicacao,
  qp.ordem
FROM public.quiz_perguntas qp
JOIN public.quizzes q ON qp.quiz_id = q.id
WHERE q.categoria = 'CALLCENTER'
ORDER BY qp.ordem;

-- ========================================
-- 6. VERIFICAR INTEGRIDADE DOS DADOS
-- ========================================

SELECT '=== INTEGRIDADE DOS DADOS ===' as info;

-- Verificar se todas as perguntas têm pelo menos 2 opções
SELECT 'Perguntas com menos de 2 opções:' as teste;
SELECT COUNT(*) as total
FROM public.quiz_perguntas 
WHERE array_length(opcoes, 1) < 2;

-- Verificar se todas as respostas corretas são válidas
SELECT 'Respostas corretas inválidas:' as teste;
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
-- 7. TESTE DE PERFORMANCE
-- ========================================

SELECT '=== TESTE DE PERFORMANCE ===' as info;

-- Verificar se há índices para otimizar as consultas
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'quiz_perguntas'
ORDER BY indexname;

-- ========================================
-- 8. RESUMO PARA TESTE DO FRONTEND
-- ========================================

SELECT '=== RESUMO PARA TESTE DO FRONTEND ===' as info;

SELECT 
  'Funcionalidade de Edição' as funcionalidade,
  'Pronta para teste' as status,
  'Modal de perguntas implementado' as detalhes,
  'Edição inline disponível' as recursos,
  'Salvamento automático no banco' as persistencia; 