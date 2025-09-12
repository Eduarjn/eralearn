-- Script para atualizar tabela videos para compatibilidade com Supabase Storage
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar colunas necessárias para compatibilidade com Supabase Storage
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'supabase',
ADD COLUMN IF NOT EXISTS bucket TEXT DEFAULT 'videos',
ADD COLUMN IF NOT EXISTS path TEXT,
ADD COLUMN IF NOT EXISTS mime TEXT,
ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS checksum TEXT;

-- 2. Atualizar registros existentes para usar Supabase como provider padrão
UPDATE public.videos 
SET 
    provider = 'supabase',
    bucket = COALESCE(bucket, 'videos')
WHERE provider IS NULL OR provider = '';

-- 3. Se a coluna url_video existir, migrar para path
-- (ajuste conforme sua estrutura atual)
UPDATE public.videos 
SET path = REPLACE(url_video, 'https://oqoxhavdhrgdjvxvajze.supabase.co/storage/v1/object/public/videos/', '')
WHERE url_video LIKE '%supabase.co/storage/v1/object/public/videos/%'
AND path IS NULL;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_videos_provider ON public.videos(provider);
CREATE INDEX IF NOT EXISTS idx_videos_bucket ON public.videos(bucket);
CREATE INDEX IF NOT EXISTS idx_videos_path ON public.videos(path);

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN public.videos.provider IS 'Provedor de storage: supabase, s3, local, etc.';
COMMENT ON COLUMN public.videos.bucket IS 'Nome do bucket/container de storage';
COMMENT ON COLUMN public.videos.path IS 'Caminho do arquivo no storage (ex: course123/lesson456/video.mp4)';
COMMENT ON COLUMN public.videos.mime IS 'Tipo MIME do arquivo (ex: video/mp4)';
COMMENT ON COLUMN public.videos.size_bytes IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.videos.duration_seconds IS 'Duração do vídeo em segundos';
COMMENT ON COLUMN public.videos.checksum IS 'Hash/checksum do arquivo para verificação de integridade';

-- 6. Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND table_schema = 'public'
AND column_name IN ('provider', 'bucket', 'path', 'mime', 'size_bytes', 'duration_seconds', 'checksum')
ORDER BY column_name;

-- 7. Verificar dados migrados
SELECT 
    provider,
    bucket,
    COUNT(*) as total_videos,
    COUNT(CASE WHEN path IS NOT NULL THEN 1 END) as videos_with_path
FROM public.videos 
GROUP BY provider, bucket;

-- 8. Informações de migração
SELECT 'Tabela videos atualizada para compatibilidade com Supabase Storage!' as status;











