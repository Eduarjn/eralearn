-- SOLUÇÃO URGENTE PARA PROBLEMA DE VÍDEOS
-- Execute este script no Supabase SQL Editor IMEDIATAMENTE

-- 1. Primeiro, vamos ver o que temos
SELECT 'ANTES DA CORREÇÃO:' as status;
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id
FROM videos 
WHERE curso_id IN (
    SELECT id FROM cursos WHERE nome LIKE '%PABX%'
)
ORDER BY titulo;

-- 2. Atualizar TODOS os vídeos do curso PABX para usar YouTube
UPDATE videos 
SET 
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    source = 'youtube',
    url_video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
WHERE curso_id IN (
    SELECT id FROM cursos WHERE nome LIKE '%PABX%'
);

-- 3. Verificar se a atualização funcionou
SELECT 'DEPOIS DA CORREÇÃO:' as status;
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id
FROM videos 
WHERE curso_id IN (
    SELECT id FROM cursos WHERE nome LIKE '%PABX%'
)
ORDER BY titulo;

-- 4. Contar quantos vídeos foram atualizados
SELECT 
    'VÍDEOS ATUALIZADOS:' as info,
    COUNT(*) as quantidade
FROM videos 
WHERE curso_id IN (
    SELECT id FROM cursos WHERE nome LIKE '%PABX%'
)
AND source = 'youtube'
AND video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';








