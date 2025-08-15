-- Script para verificar o curso OMNICHANNEL para Empresas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os cursos disponíveis
SELECT 
  id,
  nome,
  categoria,
  status,
  data_criacao
FROM cursos 
ORDER BY nome;

-- 2. Verificar especificamente cursos com OMNICHANNEL
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE nome LIKE '%OMNICHANNEL%' 
   OR nome LIKE '%Omnichannel%'
   OR categoria LIKE '%Omnichannel%'
ORDER BY nome;

-- 3. Verificar vídeos e seus cursos associados
SELECT 
  v.id as video_id,
  v.titulo as video_titulo,
  v.curso_id,
  v.categoria as video_categoria,
  c.nome as curso_nome,
  c.categoria as curso_categoria,
  v.data_criacao as video_data_criacao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.data_criacao DESC;

-- 4. Verificar vídeos do curso específico que aparece nos dados
-- (curso_id: 6e467da3-27b4-4f2b-900f-62ae76b4db66)
SELECT 
  v.id,
  v.titulo,
  v.duracao,
  v.categoria,
  c.nome as curso_nome,
  c.categoria as curso_categoria
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '6e467da3-27b4-4f2b-900f-62ae76b4db66';

-- 5. Verificar se existe um curso chamado "OMNICHANNEL para Empresas"
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE nome = 'OMNICHANNEL para Empresas';

-- 6. Se não existir, criar o curso OMNICHANNEL para Empresas
INSERT INTO cursos (
  nome,
  descricao,
  categoria,
  status,
  ordem
)
SELECT 
  'OMNICHANNEL para Empresas',
  'Implementação de soluções omnichannel em ambientes empresariais',
  'Omnichannel',
  'ativo',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM cursos WHERE nome = 'OMNICHANNEL para Empresas'
);

-- 7. Verificar novamente após a inserção
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE nome = 'OMNICHANNEL para Empresas';

-- 8. Associar vídeos existentes ao curso correto (se necessário)
-- Primeiro, pegar o ID do curso OMNICHANNEL para Empresas
WITH curso_omnichannel AS (
  SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1
)
UPDATE videos 
SET 
  curso_id = c.id,
  categoria = 'Omnichannel'
FROM curso_omnichannel c
WHERE videos.titulo LIKE '%teste%' 
  AND videos.categoria = 'Omnichannel'
  AND videos.curso_id IS DISTINCT FROM c.id;

-- 9. Verificar resultado final
SELECT 
  v.id,
  v.titulo,
  v.curso_id,
  v.categoria,
  c.nome as curso_nome,
  c.categoria as curso_categoria
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.categoria = 'Omnichannel'
ORDER BY v.data_criacao DESC; 