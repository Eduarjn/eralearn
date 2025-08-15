-- Script para verificar e testar vídeos no banco de dados
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há vídeos na tabela
SELECT 'Verificando vídeos existentes...' as info;
SELECT COUNT(*) as total_videos FROM videos;

-- 2. Verificar estrutura da tabela videos
SELECT 'Verificando estrutura da tabela videos...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;

-- 3. Listar todos os vídeos com informações relacionadas
SELECT 'Listando vídeos com relacionamentos...' as info;
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
  v.data_criacao,
  c.nome as curso_nome,
  m.nome_modulo as modulo_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN modulos m ON v.modulo_id = m.id
ORDER BY v.data_criacao DESC;

-- 4. Verificar políticas RLS para vídeos
SELECT 'Verificando políticas RLS para vídeos...' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'videos'
ORDER BY policyname;

-- 5. Testar consulta com RLS (simular usuário autenticado)
SELECT 'Testando consulta com RLS...' as info;
SELECT 
  id,
  titulo,
  duracao,
  categoria,
  curso_id,
  modulo_id
FROM videos 
ORDER BY data_criacao DESC;

-- 6. Verificar se há vídeos sem curso_id
SELECT 'Verificando vídeos sem curso_id...' as info;
SELECT 
  id,
  titulo,
  curso_id,
  modulo_id
FROM videos 
WHERE curso_id IS NULL;

-- 7. Inserir vídeo de teste se não houver nenhum
INSERT INTO videos (
  titulo, 
  descricao, 
  duracao, 
  url_video, 
  categoria,
  curso_id
) 
SELECT 
  'Vídeo de Teste - Fundamentos PABX',
  'Vídeo de teste para verificar se a listagem está funcionando',
  15,
  'https://example.com/test-video.mp4',
  'PABX',
  c.id
FROM cursos c 
WHERE c.nome = 'Fundamentos de PABX'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 8. Verificar vídeos após inserção
SELECT 'Verificando vídeos após inserção de teste...' as info;
SELECT 
  v.id,
  v.titulo,
  v.categoria,
  c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.data_criacao DESC; 