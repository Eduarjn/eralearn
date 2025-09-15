-- ========================================
-- CORREÇÃO DA ESTRUTURA DA TABELA VIDEOS
-- ========================================
-- Script para corrigir problemas na tabela videos
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela videos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se as colunas source e video_url existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'videos' AND column_name = 'source'
        ) THEN 'source: EXISTE'
        ELSE 'source: NÃO EXISTE'
    END as source_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'videos' AND column_name = 'video_url'
        ) THEN 'video_url: EXISTE'
        ELSE 'video_url: NÃO EXISTE'
    END as video_url_status;

-- 3. Criar tipo enum se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_source') THEN
        CREATE TYPE video_source AS ENUM ('upload', 'youtube');
    END IF;
END $$;

-- 4. Adicionar colunas se não existirem
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS source video_source DEFAULT 'upload',
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 5. Atualizar registros existentes
UPDATE public.videos 
SET source = 'upload' 
WHERE source IS NULL;

-- 6. Se a coluna url_video existe, copiar para video_url
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'url_video'
    ) THEN
        UPDATE public.videos 
        SET video_url = url_video 
        WHERE video_url IS NULL AND url_video IS NOT NULL;
    END IF;
END $$;

-- 7. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_videos_source ON public.videos(source);
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON public.videos(video_url);

-- 8. Verificar dados dos vídeos
SELECT 
    id,
    titulo,
    source,
    video_url,
    url_video,
    curso_id,
    categoria,
    ativo
FROM public.videos 
ORDER BY data_criacao DESC 
LIMIT 10;

-- 9. Verificar se há vídeos com problemas
SELECT 
    'Vídeos sem URL' as problema,
    COUNT(*) as quantidade
FROM public.videos 
WHERE (video_url IS NULL OR video_url = '') 
    AND (url_video IS NULL OR url_video = '')

UNION ALL

SELECT 
    'Vídeos sem source' as problema,
    COUNT(*) as quantidade
FROM public.videos 
WHERE source IS NULL

UNION ALL

SELECT 
    'Vídeos inativos' as problema,
    COUNT(*) as quantidade
FROM public.videos 
WHERE ativo = false;

-- 10. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'videos'
ORDER BY policyname;










