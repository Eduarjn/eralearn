-- ========================================
-- DIAGNÓSTICO: QUIZZES ESPECÍFICOS POR CURSO
-- ========================================
-- Execute este script para diagnosticar por que os quizzes específicos não estão funcionando

-- 1. Verificar se a tabela curso_quiz_mapping existe e tem dados
SELECT '=== TABELA CURSO_QUIZ_MAPPING ===' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'curso_quiz_mapping') 
    THEN 'EXISTE' 
    ELSE 'NÃO EXISTE' 
  END as tabela_existe;

-- Se a tabela existe, mostrar os dados
SELECT '=== DADOS NA TABELA CURSO_QUIZ_MAPPING ===' as info;
SELECT 
  cqm.id,
  c.nome as curso_nome,
  cqm.quiz_categoria,
  cqm.created_at
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
ORDER BY c.nome;

-- 2. Verificar se os quizzes específicos foram criados
SELECT '=== QUIZZES ESPECÍFICOS CRIADOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo,
  data_criacao
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY categoria;

-- 3. Verificar se as perguntas foram criadas
SELECT '=== PERGUNTAS DOS QUIZZES ESPECÍFICOS ===' as info;
SELECT 
  q.categoria,
  q.titulo as quiz_titulo,
  qp.pergunta,
  qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY q.categoria, qp.ordem;

-- 4. Verificar cursos existentes e suas categorias
SELECT '=== CURSOS EXISTENTES ===' as info;
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE status = 'ativo'
ORDER BY nome;

-- 5. Testar o mapeamento manualmente
SELECT '=== TESTE DE MAPEAMENTO MANUAL ===' as info;
SELECT 
  c.id as curso_id,
  c.nome as curso_nome,
  c.categoria as categoria_curso,
  CASE 
    WHEN c.nome ILIKE '%fundamentos%pabx%' THEN 'PABX_FUNDAMENTOS'
    WHEN c.nome ILIKE '%configurações%avançadas%pabx%' THEN 'PABX_AVANCADO'
    WHEN c.nome ILIKE '%omnichannel%empresas%' THEN 'OMNICHANNEL_EMPRESAS'
    WHEN c.nome ILIKE '%configurações%avançadas%omni%' THEN 'OMNICHANNEL_AVANCADO'
    WHEN c.nome ILIKE '%fundamentos%callcenter%' THEN 'CALLCENTER_FUNDAMENTOS'
    ELSE 'SEM_MAPEAMENTO'
  END as categoria_quiz_esperada,
  cqm.quiz_categoria as categoria_quiz_mapeada,
  CASE 
    WHEN cqm.quiz_categoria IS NOT NULL THEN 'MAPEADO'
    ELSE 'NÃO MAPEADO'
  END as status_mapeamento
FROM cursos c
LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
WHERE c.status = 'ativo'
ORDER BY c.nome;

-- 6. Verificar se há quizzes antigos interferindo
SELECT '=== QUIZZES ANTIGOS ATIVOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo,
  data_criacao
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true
ORDER BY categoria;

-- 7. Testar a função get_quiz_by_course
SELECT '=== TESTE DA FUNÇÃO GET_QUIZ_BY_COURSE ===' as info;
-- Pegar um ID de curso para teste
SELECT 
  'ID do curso para teste' as info,
  c.id as curso_id,
  c.nome as curso_nome
FROM cursos c
WHERE c.status = 'ativo'
  AND c.nome ILIKE '%configurações%avançadas%pabx%'
LIMIT 1;

-- 8. Verificar se a função existe
SELECT '=== VERIFICAR SE A FUNÇÃO EXISTE ===' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_quiz_by_course') 
    THEN 'EXISTE' 
    ELSE 'NÃO EXISTE' 
  END as funcao_existe;

-- 9. Instruções para correção
SELECT '=== INSTRUÇÕES PARA CORREÇÃO ===' as info;
SELECT '1. Se a tabela curso_quiz_mapping não existe, execute mapear-cursos-quizzes.sql' as instrucao;
SELECT '2. Se os quizzes específicos não foram criados, execute organizar-quizzes-por-curso.sql' as instrucao;
SELECT '3. Se há quizzes antigos interferindo, execute desabilitar-quizzes-antigos.sql' as instrucao;
SELECT '4. Se a função não existe, execute mapear-cursos-quizzes.sql novamente' as instrucao;
SELECT '5. Recarregue a página após executar os scripts' as instrucao;
