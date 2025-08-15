-- Adicionar colunas de branding na tabela empresas
-- Este script adiciona suporte para logo, favicon e cores personalizadas

-- Verificar se as colunas já existem antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna logo_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE empresas ADD COLUMN logo_url TEXT;
    END IF;

    -- Adicionar coluna favicon_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'favicon_url'
    ) THEN
        ALTER TABLE empresas ADD COLUMN favicon_url TEXT;
    END IF;

    -- Adicionar coluna cor_primaria se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'cor_primaria'
    ) THEN
        ALTER TABLE empresas ADD COLUMN cor_primaria VARCHAR(7) DEFAULT '#3B82F6';
    END IF;

    -- Adicionar coluna cor_secundaria se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'cor_secundaria'
    ) THEN
        ALTER TABLE empresas ADD COLUMN cor_secundaria VARCHAR(7) DEFAULT '#10B981';
    END IF;

    -- Adicionar comentários nas colunas
    COMMENT ON COLUMN empresas.logo_url IS 'URL do logo da empresa para personalização da plataforma';
    COMMENT ON COLUMN empresas.favicon_url IS 'URL do favicon da empresa para personalização das abas do navegador';
    COMMENT ON COLUMN empresas.cor_primaria IS 'Cor primária da marca da empresa (formato hexadecimal)';
    COMMENT ON COLUMN empresas.cor_secundaria IS 'Cor secundária da marca da empresa (formato hexadecimal)';

END $$;

-- Criar bucket de storage para branding se não existir
-- Nota: Isso deve ser feito manualmente no painel do Supabase
-- INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true);

-- Verificar se as colunas foram adicionadas corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND column_name IN ('logo_url', 'favicon_url', 'cor_primaria', 'cor_secundaria')
ORDER BY column_name;

-- Mostrar estrutura atual da tabela empresas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position; 