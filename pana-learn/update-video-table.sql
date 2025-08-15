-- Atualização da tabela de vídeos para suportar YouTube e Upload
-- Execute estas queries no Supabase SQL Editor

-- 1) Criar tipo enum para fonte do vídeo
CREATE TYPE video_source AS ENUM ('upload', 'youtube');

-- 2) Adicionar colunas na tabela de vídeos
ALTER TABLE videos 
  ADD COLUMN IF NOT EXISTS source video_source NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3) Atualizar registros existentes para manter compatibilidade
UPDATE videos 
SET source = 'upload' 
WHERE source IS NULL;

-- 4) Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_videos_source ON videos(source);

-- 5) Adicionar comentários para documentação
COMMENT ON COLUMN videos.source IS 'Fonte do vídeo: upload (arquivo local) ou youtube (URL do YouTube)';
COMMENT ON COLUMN videos.video_url IS 'URL do vídeo (para vídeos do YouTube) ou URL do arquivo (para uploads)';

-- 6) Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
  AND column_name IN ('source', 'video_url')
ORDER BY column_name; 