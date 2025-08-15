-- ========================================
-- CORRIGIR QUIZZES ESPECÍFICOS POR CURSO
-- ========================================
-- Execute este script para corrigir o problema dos quizzes específicos

-- 1. Primeiro, desabilitar TODOS os quizzes antigos que estão interferindo
SELECT '=== DESABILITANDO QUIZZES ANTIGOS ===' as info;

UPDATE quizzes 
SET ativo = false, data_atualizacao = NOW()
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = true;

-- 2. Verificar se os quizzes antigos foram desabilitados
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

-- 3. Garantir que apenas os quizzes específicos estão ativos
SELECT '=== QUIZZES ESPECÍFICOS ATIVOS ===' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo,
  'ATIVO' as status
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
  AND ativo = true
ORDER BY categoria;

-- 4. Verificar se a tabela de mapeamento existe e tem dados
SELECT '=== VERIFICANDO MAPEAMENTO ===' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'curso_quiz_mapping') 
    THEN 'TABELA EXISTE' 
    ELSE 'TABELA NÃO EXISTE - EXECUTE mapear-cursos-quizzes.sql' 
  END as status_tabela;

-- Se a tabela existe, mostrar os mapeamentos
SELECT '=== MAPEAMENTOS ATUAIS ===' as info;
SELECT 
  c.nome as curso,
  cqm.quiz_categoria,
  q.titulo as quiz_titulo,
  q.ativo as quiz_ativo
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
LEFT JOIN quizzes q ON q.categoria = cqm.quiz_categoria
ORDER BY c.nome;

-- 5. Recriar a tabela de mapeamento se necessário
SELECT '=== RECRIANDO MAPEAMENTO ===' as info;

-- Remover tabela se existir
DROP TABLE IF EXISTS curso_quiz_mapping;

-- Criar tabela novamente
CREATE TABLE curso_quiz_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  quiz_categoria VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curso_id)
);

-- Inserir mapeamentos
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
  );

-- 6. Recriar a função get_quiz_by_course
SELECT '=== RECRIANDO FUNÇÃO ===' as info;

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

-- 7. Verificar o resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
  'Quizzes antigos desabilitados' as item,
  COUNT(*) as total
FROM quizzes 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761')
  AND ativo = false
UNION ALL
SELECT 
  'Quizzes específicos ativos' as item,
  COUNT(*)
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
  AND ativo = true
UNION ALL
SELECT 
  'Cursos mapeados' as item,
  COUNT(*)
FROM curso_quiz_mapping;

-- 8. Teste final - mostrar mapeamento completo
SELECT '=== MAPEAMENTO FINAL ===' as info;
SELECT 
  c.nome as curso,
  cqm.quiz_categoria,
  q.titulo as quiz_titulo,
  qp.pergunta as exemplo_pergunta
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON q.categoria = cqm.quiz_categoria
LEFT JOIN quiz_perguntas qp ON qp.quiz_id = q.id AND qp.ordem = 1
WHERE q.ativo = true
ORDER BY c.nome;

-- 9. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '1. Recarregue a página da plataforma' as instrucao;
SELECT '2. Acesse cada curso e verifique se aparece apenas o quiz específico' as instrucao;
SELECT '3. Teste se as perguntas são relevantes para cada curso' as instrucao;
SELECT '4. Se ainda houver problemas, execute diagnostico-quiz-especifico.sql' as instrucao;
