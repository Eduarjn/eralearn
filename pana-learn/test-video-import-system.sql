-- Script de teste para verificar o sistema de importação de vídeos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o curso OMNICHANNEL para Empresas existe
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE nome = 'OMNICHANNEL para Empresas';

-- 2. Se não existir, criar o curso
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

-- 3. Pegar o ID do curso OMNICHANNEL para Empresas
WITH curso_omnichannel AS (
  SELECT id, categoria FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1
)
-- 4. Inserir vídeo de teste para OMNICHANNEL
INSERT INTO videos (
  titulo,
  descricao,
  duracao,
  url_video,
  categoria,
  curso_id,
  source,
  storage_path
)
SELECT 
  'Teste de Importação OMNICHANNEL',
  'Vídeo de teste para verificar se a importação está funcionando corretamente',
  10,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  c.categoria,
  c.id,
  'youtube',
  'youtube/teste_importacao_omnichannel'
FROM curso_omnichannel c
WHERE c.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. Verificar se o vídeo foi inserido
SELECT 
  v.id,
  v.titulo,
  v.curso_id,
  v.categoria,
  c.nome as curso_nome,
  v.data_criacao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.titulo = 'Teste de Importação OMNICHANNEL';

-- 6. Verificar todos os vídeos do curso OMNICHANNEL para Empresas
SELECT 
  v.id,
  v.titulo,
  v.duracao,
  v.categoria,
  c.nome as curso_nome,
  v.data_criacao
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome = 'OMNICHANNEL para Empresas'
ORDER BY v.data_criacao DESC;

-- 7. Verificar estrutura da tabela videos
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'videos' 
  AND column_name IN ('curso_id', 'modulo_id', 'categoria', 'source', 'storage_path')
ORDER BY column_name;

-- 8. Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'videos';

-- 9. Testar consulta que será usada na aplicação
-- Esta é a consulta que deve ser executada na página de detalhes do curso
SELECT 
  v.id,
  v.titulo,
  v.descricao,
  v.duracao,
  v.url_video,
  v.thumbnail_url,
  v.categoria,
  v.curso_id,
  v.modulo_id,
  v.source,
  v.storage_path,
  v.data_criacao
FROM videos v
WHERE v.curso_id = (
  SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1
)
ORDER BY v.data_criacao DESC; 