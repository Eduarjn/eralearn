-- ========================================
-- CORREÇÃO DO PROBLEMA DE STORAGE
-- ========================================
-- Script para corrigir o problema de vídeos armazenados no servidor local
-- mas sendo buscados no Supabase Storage
-- Execute no Supabase SQL Editor

-- 1. Verificar o vídeo específico que está dando erro
SELECT 
    'Vídeo com problema' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE titulo ILIKE '%Captura de chamadas%' 
   OR titulo ILIKE '%teste%'
   OR url_video ILIKE '%1757082373901%'
   OR video_url ILIKE '%1757082373901%'
ORDER BY data_criacao DESC;

-- 2. Corrigir vídeos que estão com URLs do servidor local mas source='upload'
-- Estes vídeos devem ter source='local' ou ser redirecionados para o servidor local
UPDATE public.videos 
SET 
    source = 'upload',
    video_url = COALESCE(video_url, url_video),
    ativo = true,
    data_atualizacao = NOW()
WHERE 
    (url_video ILIKE '%localhost%' OR url_video ILIKE '%3001%')
    AND (source IS NULL OR source = '');

-- 3. Para vídeos que estão no servidor local, atualizar a URL para apontar para o servidor local
UPDATE public.videos 
SET 
    video_url = REPLACE(
        REPLACE(video_url, 'https://oqoxhavdhrgdjvxvajze.supabase.co/storage/v1/object/public/training-videos/', 'http://localhost:3001/videos/'),
        'training-videos/', 'http://localhost:3001/videos/'
    ),
    data_atualizacao = NOW()
WHERE 
    video_url ILIKE '%supabase%'
    AND titulo ILIKE '%Captura de chamadas%';

-- 4. Verificar se a correção foi aplicada
SELECT 
    'Vídeo corrigido' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo,
    data_atualizacao
FROM public.videos 
WHERE titulo ILIKE '%Captura de chamadas%' 
   OR titulo ILIKE '%teste%'
ORDER BY data_criacao DESC;

-- 5. Verificar se há outros vídeos com problemas similares
SELECT 
    'Vídeos com problemas similares' as status,
    COUNT(*) as quantidade
FROM public.videos 
WHERE 
    (video_url ILIKE '%supabase%' AND titulo ILIKE '%Captura%')
    OR (source IS NULL OR source = '')
    OR ativo = false;

-- 6. Corrigir todos os vídeos com problemas similares
UPDATE public.videos 
SET 
    source = 'upload',
    video_url = CASE 
        WHEN video_url ILIKE '%supabase%' AND titulo ILIKE '%Captura%' THEN
            REPLACE(
                REPLACE(video_url, 'https://oqoxhavdhrgdjvxvajze.supabase.co/storage/v1/object/public/training-videos/', 'http://localhost:3001/videos/'),
                'training-videos/', 'http://localhost:3001/videos/'
            )
        ELSE COALESCE(video_url, url_video)
    END,
    ativo = true,
    data_atualizacao = NOW()
WHERE 
    (video_url ILIKE '%supabase%' AND titulo ILIKE '%Captura%')
    OR (source IS NULL OR source = '')
    OR ativo = false;

-- 7. Verificar resultado final
SELECT 
    'Resultado final' as status,
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









