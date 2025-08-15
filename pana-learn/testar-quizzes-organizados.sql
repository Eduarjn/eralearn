-- ========================================
-- TESTAR QUIZZES ORGANIZADOS
-- ========================================
-- Execute este script para verificar se tudo foi criado corretamente

-- 1. Verificar se os novos quizzes foram criados
SELECT '=== NOVOS QUIZZES CRIADOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  descricao,
  ativo,
  'NOVO' as tipo
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY categoria;

-- 2. Verificar se as perguntas foram criadas
SELECT '=== PERGUNTAS CRIADAS ===' as info;
SELECT 
  qp.id,
  q.categoria,
  q.titulo as quiz_titulo,
  qp.pergunta,
  qp.ordem,
  array_length(qp.opcoes, 1) as num_opcoes
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY q.categoria, qp.ordem;

-- 3. Verificar se a tabela de mapeamento foi criada
SELECT '=== TABELA DE MAPEAMENTO ===' as info;
SELECT 
  cqm.id,
  c.nome as curso,
  cqm.quiz_categoria,
  q.titulo as quiz_titulo
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON q.categoria = cqm.quiz_categoria
WHERE q.ativo = true
ORDER BY c.nome;

-- 4. Testar a função get_quiz_by_course
SELECT '=== TESTE DA FUNÇÃO GET_QUIZ_BY_COURSE ===' as info;
-- Primeiro, vamos pegar um ID de curso para testar
SELECT 
  'ID do curso para teste' as info,
  c.id as curso_id,
  c.nome as curso_nome
FROM cursos c
WHERE c.status = 'ativo'
  AND c.id IN (SELECT curso_id FROM curso_quiz_mapping)
LIMIT 1;

-- 5. Verificar cursos sem mapeamento
SELECT '=== CURSOS SEM MAPEAMENTO ===' as info;
SELECT 
  c.id,
  c.nome,
  c.categoria,
  'SEM MAPEAMENTO' as status
FROM cursos c
WHERE c.status = 'ativo'
  AND c.id NOT IN (SELECT curso_id FROM curso_quiz_mapping)
ORDER BY c.nome;

-- 6. Verificar quizzes antigos (que podem ser desabilitados)
SELECT '=== QUIZZES ANTIGOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo,
  'ANTIGO' as tipo
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true
ORDER BY categoria;

-- 7. Resumo final
SELECT '=== RESUMO FINAL ===' as info;
SELECT 
  'Novos quizzes criados' as item,
  COUNT(*) as total
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
UNION ALL
SELECT 
  'Perguntas criadas' as item,
  COUNT(*)
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
UNION ALL
SELECT 
  'Cursos mapeados' as item,
  COUNT(*)
FROM curso_quiz_mapping
UNION ALL
SELECT 
  'Quizzes antigos ativos' as item,
  COUNT(*)
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true;

-- 8. Instruções para teste manual
SELECT '=== INSTRUÇÕES PARA TESTE MANUAL ===' as info;
SELECT '1. Acesse cada curso e verifique se aparece apenas o quiz específico' as instrucao;
SELECT '2. Teste se as perguntas são relevantes para o curso' as instrucao;
SELECT '3. Verifique se não há erros no console do navegador' as instrucao;
SELECT '4. Confirme que cada curso mostra apenas seu quiz único' as instrucao;
SELECT '5. Se tudo estiver funcionando, execute desabilitar-quizzes-antigos.sql' as instrucao;
