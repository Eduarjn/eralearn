-- ========================================
-- CRIAÇÃO DA TABELA ASSETS
-- ========================================
-- Script para criar tabela de assets (metadados + links)
-- Execute no Supabase SQL Editor

-- 1. Criar tabela assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('internal', 'youtube')),
  
  -- Para YouTube:
  youtube_id TEXT,
  youtube_url TEXT,
  
  -- Para Internal:
  bucket TEXT,           -- se usar S3/MinIO
  path TEXT,             -- caminho/chave do arquivo (ou path local)
  mime TEXT,
  size_bytes BIGINT,
  duration_seconds INTEGER,
  
  -- Metadados comuns:
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Controle:
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_assets_provider ON public.assets(provider);
CREATE INDEX IF NOT EXISTS idx_assets_path ON public.assets(path);
CREATE INDEX IF NOT EXISTS idx_assets_youtube_id ON public.assets(youtube_id);
CREATE INDEX IF NOT EXISTS idx_assets_ativo ON public.assets(ativo);

-- 3. Adicionar coluna asset_id na tabela videos (se não existir)
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL;

-- 4. Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_videos_asset_id ON public.videos(asset_id);

-- 5. Comentários para documentação
COMMENT ON TABLE public.assets IS 'Tabela de assets de mídia (vídeos) com metadados e links';
COMMENT ON COLUMN public.assets.provider IS 'Provider do vídeo: internal (servidor próprio) ou youtube';
COMMENT ON COLUMN public.assets.youtube_id IS 'ID do vídeo no YouTube (extraído da URL)';
COMMENT ON COLUMN public.assets.youtube_url IS 'URL original do vídeo no YouTube';
COMMENT ON COLUMN public.assets.bucket IS 'Bucket S3/MinIO (se usar storage externo)';
COMMENT ON COLUMN public.assets.path IS 'Caminho do arquivo no servidor ou chave no bucket';
COMMENT ON COLUMN public.assets.mime IS 'Tipo MIME do arquivo (ex: video/mp4)';
COMMENT ON COLUMN public.assets.size_bytes IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.assets.duration_seconds IS 'Duração do vídeo em segundos';

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'assets' 
    AND table_schema = 'public'
ORDER BY ordinal_position;




















