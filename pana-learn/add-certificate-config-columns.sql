-- Adicionar colunas de configuração à tabela certificados
-- Execute este script no Supabase SQL Editor se as colunas não existirem

-- Verificar se as colunas já existem
DO $$
BEGIN
    -- Template do certificado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'template_html') THEN
        ALTER TABLE certificados ADD COLUMN template_html TEXT;
    END IF;

    -- Validade em dias
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'validade_dias') THEN
        ALTER TABLE certificados ADD COLUMN validade_dias INTEGER DEFAULT 365;
    END IF;

    -- Configurações de QR Code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'qr_code_enabled') THEN
        ALTER TABLE certificados ADD COLUMN qr_code_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Configurações de assinatura
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'assinatura_enabled') THEN
        ALTER TABLE certificados ADD COLUMN assinatura_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Logo da empresa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'logo_url') THEN
        ALTER TABLE certificados ADD COLUMN logo_url TEXT;
    END IF;

    -- Cor primária
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'cor_primaria') THEN
        ALTER TABLE certificados ADD COLUMN cor_primaria VARCHAR(7) DEFAULT '#3B82F6';
    END IF;

    -- Fonte
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'fonte') THEN
        ALTER TABLE certificados ADD COLUMN fonte VARCHAR(50) DEFAULT 'Arial';
    END IF;

    -- Alinhamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'alinhamento') THEN
        ALTER TABLE certificados ADD COLUMN alinhamento VARCHAR(20) DEFAULT 'center';
    END IF;

    -- Configurações de layout
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificados' AND column_name = 'layout_config') THEN
        ALTER TABLE certificados ADD COLUMN layout_config JSONB DEFAULT '{}';
    END IF;
END $$;

-- Adicionar comentários às colunas
COMMENT ON COLUMN certificados.template_html IS 'Template HTML personalizado do certificado';
COMMENT ON COLUMN certificados.validade_dias IS 'Validade do certificado em dias';
COMMENT ON COLUMN certificados.qr_code_enabled IS 'Habilitar QR Code no certificado';
COMMENT ON COLUMN certificados.assinatura_enabled IS 'Habilitar assinatura digital';
COMMENT ON COLUMN certificados.logo_url IS 'URL do logo da empresa';
COMMENT ON COLUMN certificados.cor_primaria IS 'Cor primária do certificado (hex)';
COMMENT ON COLUMN certificados.fonte IS 'Fonte utilizada no certificado';
COMMENT ON COLUMN certificados.alinhamento IS 'Alinhamento do texto (left, center, right)';
COMMENT ON COLUMN certificados.layout_config IS 'Configurações adicionais de layout (JSON)';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND column_name IN ('template_html', 'validade_dias', 'qr_code_enabled', 'assinatura_enabled', 'logo_url', 'cor_primaria', 'fonte', 'alinhamento', 'layout_config')
ORDER BY column_name; 