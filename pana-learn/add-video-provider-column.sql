-- Script para adicionar coluna de auditoria do provedor de vídeo
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna para registrar o provedor do vídeo
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS provedor TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN videos.provedor IS 'Provedor do vídeo: supabase, local, youtube';

-- Atualizar registros existentes baseado no source
UPDATE videos 
SET provedor = CASE 
  WHEN source = 'youtube' THEN 'youtube'
  WHEN source = 'upload' THEN 'supabase'
  ELSE 'supabase'
END
WHERE provedor IS NULL;

-- Criar índice para melhor performance em consultas por provedor
CREATE INDEX IF NOT EXISTS idx_videos_provedor ON videos(provedor);

-- Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
  AND column_name = 'provedor'
ORDER BY column_name;

-- Mostrar estatísticas dos provedores
SELECT 
  provedor,
  COUNT(*) as total_videos
FROM videos 
GROUP BY provedor 
ORDER BY total_videos DESC;
























