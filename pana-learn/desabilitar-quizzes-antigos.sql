-- ========================================
-- DESABILITAR QUIZZES ANTIGOS
-- ========================================
-- Execute este script APÓS confirmar que os novos quizzes funcionam corretamente

-- 1. Verificar quizzes antigos que podem ser desabilitados
SELECT '=== QUIZZES ANTIGOS PARA DESABILITAR ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  descricao,
  'ANTIGO' as status
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true
ORDER BY categoria;

-- 2. Verificar se os novos quizzes estão funcionando
SELECT '=== NOVOS QUIZZES ATIVOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  descricao,
  'NOVO' as status
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
  AND ativo = true
ORDER BY categoria;

-- 3. Verificar mapeamentos criados
SELECT '=== MAPEAMENTOS DE CURSOS ===' as info;
SELECT 
  c.nome as curso,
  cqm.quiz_categoria,
  q.titulo as quiz_titulo
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON q.categoria = cqm.quiz_categoria
WHERE q.ativo = true
ORDER BY c.nome;

-- 4. Desabilitar quizzes antigos (COMENTADO - DESCOMENTE APÓS TESTAR)
-- ========================================

-- DESCOMENTE AS LINHAS ABAIXO APÓS CONFIRMAR QUE TUDO FUNCIONA

/*
UPDATE quizzes 
SET ativo = false, data_atualizacao = NOW()
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true;

-- 5. Verificar se foram desabilitados
SELECT '=== QUIZZES ANTIGOS DESABILITADOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo,
  'DESABILITADO' as status
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
ORDER BY categoria;
*/

-- 6. Instruções de segurança
SELECT '=== INSTRUÇÕES DE SEGURANÇA ===' as info;
SELECT '1. Teste primeiro se os novos quizzes aparecem corretamente para cada curso' as instrucao;
SELECT '2. Verifique se não há erros no console do navegador' as instrucao;
SELECT '3. Confirme que cada curso mostra apenas seu quiz específico' as instrucao;
SELECT '4. Descomente as linhas de UPDATE acima para desabilitar os quizzes antigos' as instrucao;
SELECT '5. Execute novamente este script para confirmar a desabilitação' as instrucao;

-- 7. Script de rollback (caso algo dê errado)
SELECT '=== SCRIPT DE ROLLBACK ===' as info;
SELECT '-- Para reabilitar os quizzes antigos, execute:' as rollback_script;
SELECT 'UPDATE quizzes SET ativo = true, data_atualizacao = NOW() WHERE categoria IN (''PABX'', ''Omnichannel'', ''CALLCENTER'', ''VoIP'', ''40f4279b-722a-4c85-b689-6ee68dfde761'');' as rollback_script;
