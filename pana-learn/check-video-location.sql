-- ========================================
-- VERIFICAR LOCALIZAÇÃO DO VÍDEO
-- ========================================
-- Script para verificar onde o vídeo está armazenado
-- Execute no Supabase SQL Editor

-- 1. Buscar o vídeo específico que está dando erro
SELECT 
    'Vídeo com problema' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo,
    data_criacao
FROM public.videos 
WHERE titulo ILIKE '%Captura de chamadas%' 
   OR titulo ILIKE '%teste%'
   OR url_video ILIKE '%1757082373901%'
   OR video_url ILIKE '%1757082373901%'
ORDER BY data_criacao DESC;

-- 2. Verificar todos os vídeos do curso PABX
SELECT 
    'Vídeos do curso PABX' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY data_criacao DESC;

-- 3. Verificar vídeos com URLs que contêm timestamps
SELECT 
    'Vídeos com timestamp' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE url_video ~ '[0-9]{13}' 
   OR video_url ~ '[0-9]{13}'
ORDER BY data_criacao DESC;

-- 4. Verificar estrutura da tabela videos
SELECT 
    'Estrutura da tabela' as status,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
    AND table_schema = 'public'
    AND column_name IN ('id', 'titulo', 'url_video', 'video_url', 'source', 'curso_id', 'categoria', 'ativo')
ORDER BY ordinal_position;

-- 5. Verificar se há vídeos com URLs do servidor local
SELECT 
    'Vídeos servidor local' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE url_video ILIKE '%localhost%' 
   OR url_video ILIKE '%3001%'
   OR video_url ILIKE '%localhost%'
   OR video_url ILIKE '%3001%'
ORDER BY data_criacao DESC;

-- 6. Verificar se há vídeos com URLs do Supabase Storage
SELECT 
    'Vídeos Supabase Storage' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE url_video ILIKE '%supabase%' 
   OR video_url ILIKE '%supabase%'
ORDER BY data_criacao DESC;

-- 7. Contar vídeos por tipo de storage
SELECT 
    'Contagem por tipo' as status,
    CASE 
        WHEN url_video ILIKE '%supabase%' OR video_url ILIKE '%supabase%' THEN 'Supabase Storage'
        WHEN url_video ILIKE '%localhost%' OR url_video ILIKE '%3001%' OR video_url ILIKE '%localhost%' OR video_url ILIKE '%3001%' THEN 'Servidor Local'
        WHEN url_video ILIKE '%youtube%' OR video_url ILIKE '%youtube%' THEN 'YouTube'
        ELSE 'Outro/Desconhecido'
    END as tipo_storage,
    COUNT(*) as quantidade
FROM public.videos 
GROUP BY 
    CASE 
        WHEN url_video ILIKE '%supabase%' OR video_url ILIKE '%supabase%' THEN 'Supabase Storage'
        WHEN url_video ILIKE '%localhost%' OR url_video ILIKE '%3001%' OR video_url ILIKE '%localhost%' OR video_url ILIKE '%3001%' THEN 'Servidor Local'
        WHEN url_video ILIKE '%youtube%' OR video_url ILIKE '%youtube%' THEN 'YouTube'
        ELSE 'Outro/Desconhecido'
    END
ORDER BY quantidade DESC;










