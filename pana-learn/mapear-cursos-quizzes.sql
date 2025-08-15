-- ========================================
-- MAPEAR CURSOS COM QUIZZES ESPECÍFICOS
-- ========================================
-- Este script mapeia os cursos existentes com as novas categorias de quiz

-- 1. Verificar cursos existentes e suas categorias
SELECT '=== CURSOS EXISTENTES ===' as info;
SELECT 
  id,
  nome,
  categoria,
  CASE 
    WHEN nome ILIKE '%fundamentos%pabx%' THEN 'PABX_FUNDAMENTOS'
    WHEN nome ILIKE '%configurações%avançadas%pabx%' THEN 'PABX_AVANCADO'
    WHEN nome ILIKE '%omnichannel%empresas%' THEN 'OMNICHANNEL_EMPRESAS'
    WHEN nome ILIKE '%configurações%avançadas%omni%' THEN 'OMNICHANNEL_AVANCADO'
    WHEN nome ILIKE '%fundamentos%callcenter%' THEN 'CALLCENTER_FUNDAMENTOS'
    ELSE 'SEM_MAPEAMENTO'
  END as categoria_quiz_sugerida
FROM cursos 
WHERE status = 'ativo' 
ORDER BY nome;

-- 2. Verificar se os quizzes específicos foram criados
SELECT '=== QUIZZES ESPECÍFICOS CRIADOS ===' as info;
SELECT 
  categoria,
  titulo,
  CASE 
    WHEN categoria = 'PABX_FUNDAMENTOS' THEN 'Fundamentos de PABX'
    WHEN categoria = 'PABX_AVANCADO' THEN 'Configurações Avançadas PABX'
    WHEN categoria = 'OMNICHANNEL_EMPRESAS' THEN 'OMNICHANNEL para Empresas'
    WHEN categoria = 'OMNICHANNEL_AVANCADO' THEN 'Configurações Avançadas OMNI'
    WHEN categoria = 'CALLCENTER_FUNDAMENTOS' THEN 'Fundamentos CALLCENTER'
    ELSE 'N/A'
  END as curso_correspondente
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY categoria;

-- 3. Criar tabela de mapeamento (se não existir)
CREATE TABLE IF NOT EXISTS curso_quiz_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  quiz_categoria VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curso_id)
);

-- 4. Inserir mapeamentos baseados nos nomes dos cursos
INSERT INTO curso_quiz_mapping (curso_id, quiz_categoria)
SELECT 
  c.id,
  CASE 
    WHEN c.nome ILIKE '%fundamentos%pabx%' THEN 'PABX_FUNDAMENTOS'
    WHEN c.nome ILIKE '%configurações%avançadas%pabx%' THEN 'PABX_AVANCADO'
    WHEN c.nome ILIKE '%omnichannel%empresas%' THEN 'OMNICHANNEL_EMPRESAS'
    WHEN c.nome ILIKE '%configurações%avançadas%omni%' THEN 'OMNICHANNEL_AVANCADO'
    WHEN c.nome ILIKE '%fundamentos%callcenter%' THEN 'CALLCENTER_FUNDAMENTOS'
  END as quiz_categoria
FROM cursos c
WHERE c.status = 'ativo'
  AND (
    c.nome ILIKE '%fundamentos%pabx%' OR
    c.nome ILIKE '%configurações%avançadas%pabx%' OR
    c.nome ILIKE '%omnichannel%empresas%' OR
    c.nome ILIKE '%configurações%avançadas%omni%' OR
    c.nome ILIKE '%fundamentos%callcenter%'
  )
ON CONFLICT (curso_id) DO UPDATE SET
  quiz_categoria = EXCLUDED.quiz_categoria,
  updated_at = NOW();

-- 5. Verificar mapeamentos criados
SELECT '=== MAPEAMENTOS CRIADOS ===' as info;
SELECT 
  c.nome as curso,
  cqm.quiz_categoria,
  q.titulo as quiz_titulo,
  qp.pergunta as exemplo_pergunta
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON q.categoria = cqm.quiz_categoria
LEFT JOIN quiz_perguntas qp ON qp.quiz_id = q.id AND qp.ordem = 1
ORDER BY c.nome;

-- 6. Verificar se há cursos sem mapeamento
SELECT '=== CURSOS SEM MAPEAMENTO ===' as info;
SELECT 
  c.id,
  c.nome,
  c.categoria
FROM cursos c
WHERE c.status = 'ativo'
  AND c.id NOT IN (SELECT curso_id FROM curso_quiz_mapping)
ORDER BY c.nome;

-- 7. Criar função para buscar quiz por curso
CREATE OR REPLACE FUNCTION get_quiz_by_course(course_id UUID)
RETURNS TABLE (
  quiz_id UUID,
  quiz_titulo VARCHAR,
  quiz_categoria VARCHAR,
  pergunta TEXT,
  opcoes TEXT[],
  resposta_correta INTEGER,
  explicacao TEXT,
  ordem INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as quiz_id,
    q.titulo as quiz_titulo,
    q.categoria as quiz_categoria,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.explicacao,
    qp.ordem
  FROM curso_quiz_mapping cqm
  JOIN quizzes q ON q.categoria = cqm.quiz_categoria
  JOIN quiz_perguntas qp ON qp.quiz_id = q.id
  WHERE cqm.curso_id = get_quiz_by_course.course_id
    AND q.ativo = true
  ORDER BY qp.ordem;
END;
$$ LANGUAGE plpgsql;

-- 8. Testar a função com um curso específico
SELECT '=== TESTE DA FUNÇÃO ===' as info;
-- Substitua o UUID abaixo pelo ID de um curso real
-- SELECT * FROM get_quiz_by_course('ID_DO_CURSO_AQUI');

-- 9. Resumo final
SELECT '=== RESUMO DO MAPEAMENTO ===' as info;
SELECT 
  'Cursos mapeados' as item,
  COUNT(*) as total
FROM curso_quiz_mapping
UNION ALL
SELECT 
  'Cursos sem mapeamento' as item,
  COUNT(*)
FROM cursos c
WHERE c.status = 'ativo'
  AND c.id NOT IN (SELECT curso_id FROM curso_quiz_mapping)
UNION ALL
SELECT 
  'Quizzes específicos' as item,
  COUNT(*)
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS');

-- 10. Instruções para o frontend
SELECT '=== INSTRUÇÕES PARA O FRONTEND ===' as info;
SELECT '1. Use a função get_quiz_by_course(course_id) para buscar o quiz específico de cada curso' as instrucao;
SELECT '2. A tabela curso_quiz_mapping contém o mapeamento entre cursos e categorias de quiz' as instrucao;
SELECT '3. Cada curso agora terá apenas seu quiz específico' as instrucao;
SELECT '4. Os quizzes antigos podem ser desabilitados após confirmar que tudo funciona' as instrucao;
