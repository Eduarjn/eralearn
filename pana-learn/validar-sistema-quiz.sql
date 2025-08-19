-- Script para validar e corrigir o sistema de disponibilização de quiz
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura das tabelas
SELECT 'Verificando estrutura das tabelas...' as info;

-- Verificar se a tabela curso_quiz_mapping existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'curso_quiz_mapping'
) as curso_quiz_mapping_exists;

-- 2. Verificar cursos disponíveis
SELECT 'Verificando cursos disponíveis...' as info;
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
ORDER BY nome;

-- 3. Verificar quizzes disponíveis
SELECT 'Verificando quizzes disponíveis...' as info;
SELECT 
  id,
  titulo,
  categoria,
  ativo,
  nota_minima
FROM quizzes 
ORDER BY categoria, titulo;

-- 4. Verificar mapeamento curso-quiz (se existir)
SELECT 'Verificando mapeamento curso-quiz...' as info;
SELECT 
  cqm.curso_id,
  c.nome as curso_nome,
  c.categoria as curso_categoria,
  cqm.quiz_id,
  q.titulo as quiz_titulo,
  q.categoria as quiz_categoria,
  q.ativo as quiz_ativo
FROM curso_quiz_mapping cqm
LEFT JOIN cursos c ON cqm.curso_id = c.id
LEFT JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- 5. Verificar vídeos por curso
SELECT 'Verificando vídeos por curso...' as info;
SELECT 
  c.nome as curso_nome,
  c.categoria,
  COUNT(v.id) as total_videos,
  COUNT(CASE WHEN v.status = 'ativo' THEN 1 END) as videos_ativos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
GROUP BY c.id, c.nome, c.categoria
ORDER BY c.nome;

-- 6. Verificar perguntas por quiz
SELECT 'Verificando perguntas por quiz...' as info;
SELECT 
  q.titulo as quiz_titulo,
  q.categoria,
  COUNT(qp.id) as total_perguntas,
  q.ativo
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo, q.categoria, q.ativo
ORDER BY q.categoria, q.titulo;

-- 7. Criar tabela de mapeamento se não existir
CREATE TABLE IF NOT EXISTS curso_quiz_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curso_id, quiz_id)
);

-- 8. Inserir mapeamentos padrão baseados na categoria
INSERT INTO curso_quiz_mapping (curso_id, quiz_id)
SELECT 
  c.id as curso_id,
  q.id as quiz_id
FROM cursos c
INNER JOIN quizzes q ON c.categoria = q.categoria
WHERE q.ativo = true
AND NOT EXISTS (
  SELECT 1 FROM curso_quiz_mapping cqm 
  WHERE cqm.curso_id = c.id AND cqm.quiz_id = q.id
)
ON CONFLICT (curso_id, quiz_id) DO NOTHING;

-- 9. Verificar mapeamentos criados
SELECT 'Verificando mapeamentos criados...' as info;
SELECT 
  c.nome as curso_nome,
  c.categoria as curso_categoria,
  q.titulo as quiz_titulo,
  q.categoria as quiz_categoria,
  q.ativo as quiz_ativo
FROM curso_quiz_mapping cqm
INNER JOIN cursos c ON cqm.curso_id = c.id
INNER JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- 10. Verificar progresso de vídeos (exemplo para um usuário)
SELECT 'Verificando progresso de vídeos (exemplo)...' as info;
SELECT 
  c.nome as curso_nome,
  COUNT(v.id) as total_videos,
  COUNT(vp.video_id) as videos_com_progresso,
  COUNT(CASE WHEN vp.concluido = true THEN 1 END) as videos_concluidos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = 'exemplo-user-id'
GROUP BY c.id, c.nome
ORDER BY c.nome;

-- 11. Verificar progresso de quiz (exemplo para um usuário)
SELECT 'Verificando progresso de quiz (exemplo)...' as info;
SELECT 
  c.nome as curso_nome,
  q.titulo as quiz_titulo,
  pq.nota,
  pq.aprovado,
  pq.data_conclusao
FROM cursos c
INNER JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
INNER JOIN quizzes q ON cqm.quiz_id = q.id
LEFT JOIN progresso_quiz pq ON q.id = pq.quiz_id AND pq.usuario_id = 'exemplo-user-id'
ORDER BY c.nome;

-- 12. Verificar certificados (exemplo para um usuário)
SELECT 'Verificando certificados (exemplo)...' as info;
SELECT 
  c.nome as curso_nome,
  cert.numero_certificado,
  cert.nota_final,
  cert.status,
  cert.data_emissao
FROM cursos c
LEFT JOIN certificados cert ON c.id = cert.curso_id AND cert.usuario_id = 'exemplo-user-id'
ORDER BY c.nome;

-- 13. Função para verificar se curso está completo
CREATE OR REPLACE FUNCTION verificar_curso_completo(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS TABLE(
  curso_id UUID,
  total_videos INTEGER,
  videos_concluidos INTEGER,
  curso_completo BOOLEAN,
  quiz_disponivel BOOLEAN,
  quiz_id UUID,
  quiz_concluido BOOLEAN,
  certificado_disponivel BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH curso_videos AS (
    SELECT 
      c.id as curso_id,
      COUNT(v.id) as total_videos,
      COUNT(CASE WHEN vp.concluido = true THEN 1 END) as videos_concluidos
    FROM cursos c
    LEFT JOIN videos v ON c.id = v.curso_id
    LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = p_usuario_id
    WHERE c.id = p_curso_id
    GROUP BY c.id
  ),
  quiz_info AS (
    SELECT 
      cqm.quiz_id,
      q.ativo as quiz_ativo,
      pq.id as progresso_id,
      pq.aprovado as quiz_aprovado
    FROM curso_quiz_mapping cqm
    INNER JOIN quizzes q ON cqm.quiz_id = q.id
    LEFT JOIN progresso_quiz pq ON q.id = pq.quiz_id AND pq.usuario_id = p_usuario_id
    WHERE cqm.curso_id = p_curso_id
  ),
  certificado_info AS (
    SELECT 
      COUNT(*) > 0 as certificado_disponivel
    FROM certificados
    WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id
  )
  SELECT 
    cv.curso_id,
    cv.total_videos,
    cv.videos_concluidos,
    (cv.videos_concluidos = cv.total_videos AND cv.total_videos > 0) as curso_completo,
    (qi.quiz_id IS NOT NULL AND qi.quiz_ativo = true) as quiz_disponivel,
    qi.quiz_id,
    (qi.progresso_id IS NOT NULL) as quiz_concluido,
    ci.certificado_disponivel
  FROM curso_videos cv
  LEFT JOIN quiz_info qi ON true
  LEFT JOIN certificado_info ci ON true;
END;
$$ LANGUAGE plpgsql;

-- 14. Testar função de verificação
SELECT 'Testando função de verificação...' as info;
-- Substitua 'exemplo-user-id' e 'exemplo-curso-id' pelos IDs reais
-- SELECT * FROM verificar_curso_completo('exemplo-user-id'::UUID, 'exemplo-curso-id'::UUID);

-- 15. Resumo do sistema
SELECT 'Resumo do sistema de quiz:' as info;
SELECT 
  'Cursos cadastrados: ' || COUNT(*) as info
FROM cursos;

SELECT 
  'Quizzes cadastrados: ' || COUNT(*) as info
FROM quizzes
WHERE ativo = true;

SELECT 
  'Mapeamentos curso-quiz: ' || COUNT(*) as info
FROM curso_quiz_mapping;

SELECT 
  'Vídeos cadastrados: ' || COUNT(*) as info
FROM videos;

SELECT 
  'Perguntas cadastradas: ' || COUNT(*) as info
FROM quiz_perguntas;
