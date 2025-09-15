-- ========================================
-- SCRIPT DE MIGRAÇÃO: VÍDEOS PARA ASSETS
-- ========================================
-- Este script migra vídeos existentes para o novo sistema de assets
-- Execute no Supabase SQL Editor APÓS criar a tabela assets

-- 1. Migrar vídeos do YouTube existentes
-- Assumindo que vídeos com source='youtube' ou video_url contendo 'youtube.com' são do YouTube
INSERT INTO public.assets (
  provider,
  youtube_id,
  youtube_url,
  title,
  description,
  ativo,
  created_at,
  updated_at
)
SELECT 
  'youtube' as provider,
  CASE 
    WHEN video_url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)' THEN 
      regexp_replace(video_url, '.*v=([a-zA-Z0-9_-]+).*', '\1')
    WHEN video_url ~ 'youtu\.be/([a-zA-Z0-9_-]+)' THEN 
      regexp_replace(video_url, '.*youtu\.be/([a-zA-Z0-9_-]+).*', '\1')
    ELSE NULL
  END as youtube_id,
  video_url as youtube_url,
  titulo as title,
  descricao as description,
  ativo,
  created_at,
  updated_at
FROM public.videos 
WHERE (
  source = 'youtube' 
  OR video_url LIKE '%youtube.com%' 
  OR video_url LIKE '%youtu.be%'
)
AND video_url IS NOT NULL
AND video_url != '';

-- 2. Migrar vídeos internos (upload) existentes
-- Assumindo que vídeos com source='upload' ou sem video_url são internos
INSERT INTO public.assets (
  provider,
  path,
  mime,
  size_bytes,
  duration_seconds,
  title,
  description,
  ativo,
  created_at,
  updated_at
)
SELECT 
  'internal' as provider,
  COALESCE(video_url, 'videos/' || id::text || '.mp4') as path,
  'video/mp4' as mime, -- Assumir MP4 como padrão
  NULL as size_bytes, -- Não temos essa informação nos dados existentes
  duracao as duration_seconds,
  titulo as title,
  descricao as description,
  ativo,
  created_at,
  updated_at
FROM public.videos 
WHERE (
  source = 'upload' 
  OR source IS NULL 
  OR (video_url IS NULL OR video_url = '')
  OR (video_url NOT LIKE '%youtube.com%' AND video_url NOT LIKE '%youtu.be%')
);

-- 3. Atualizar tabela videos para referenciar os assets criados
-- Para vídeos do YouTube
UPDATE public.videos 
SET asset_id = assets.id
FROM public.assets
WHERE assets.provider = 'youtube'
AND (
  (videos.source = 'youtube' AND videos.video_url = assets.youtube_url)
  OR (videos.video_url LIKE '%youtube.com%' AND videos.video_url = assets.youtube_url)
  OR (videos.video_url LIKE '%youtu.be%' AND videos.video_url = assets.youtube_url)
);

-- Para vídeos internos
UPDATE public.videos 
SET asset_id = assets.id
FROM public.assets
WHERE assets.provider = 'internal'
AND videos.titulo = assets.title
AND videos.created_at = assets.created_at;

-- 4. Verificar migração
SELECT 
  'Vídeos migrados' as status,
  COUNT(*) as total
FROM public.videos 
WHERE asset_id IS NOT NULL;

SELECT 
  'Assets criados' as status,
  COUNT(*) as total
FROM public.assets;

SELECT 
  provider,
  COUNT(*) as count
FROM public.assets
GROUP BY provider;

-- 5. Verificar vídeos não migrados (se houver)
SELECT 
  'Vídeos não migrados' as status,
  COUNT(*) as total
FROM public.videos 
WHERE asset_id IS NULL;

-- 6. Mostrar alguns exemplos de migração
SELECT 
  v.id as video_id,
  v.titulo,
  v.source,
  v.video_url,
  a.id as asset_id,
  a.provider,
  a.youtube_id,
  a.path
FROM public.videos v
LEFT JOIN public.assets a ON v.asset_id = a.id
ORDER BY v.created_at DESC
LIMIT 10;

-- 7. Comentários finais
-- Após executar este script:
-- 1. Verifique se todos os vídeos foram migrados corretamente
-- 2. Teste a reprodução de vídeos do YouTube e internos
-- 3. Atualize o frontend para usar o novo sistema de assets
-- 4. Considere remover colunas antigas após confirmar que tudo funciona










