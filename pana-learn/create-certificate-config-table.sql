-- Criar tabela para configurações de certificados por curso
-- Execute estas queries no Supabase SQL Editor

-- 1) Criar tabela de configurações de certificados
CREATE TABLE IF NOT EXISTS certificate_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  validade_dias INTEGER DEFAULT 365,
  qr_code_enabled BOOLEAN DEFAULT true,
  assinatura_enabled BOOLEAN DEFAULT true,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#2563eb',
  fonte TEXT DEFAULT 'Arial',
  alinhamento TEXT DEFAULT 'center' CHECK (alinhamento IN ('left', 'center', 'right')),
  template_html TEXT,
  layout_config JSONB DEFAULT '{}',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_certificate_configs_curso_id ON certificate_configs(curso_id);

-- 3) Adicionar comentários para documentação
COMMENT ON TABLE certificate_configs IS 'Configurações de certificados por curso';
COMMENT ON COLUMN certificate_configs.curso_id IS 'ID do curso associado';
COMMENT ON COLUMN certificate_configs.validade_dias IS 'Validade do certificado em dias';
COMMENT ON COLUMN certificate_configs.qr_code_enabled IS 'Se deve incluir QR code no certificado';
COMMENT ON COLUMN certificate_configs.assinatura_enabled IS 'Se deve incluir assinatura digital';
COMMENT ON COLUMN certificate_configs.logo_url IS 'URL do logo para o certificado';
COMMENT ON COLUMN certificate_configs.cor_primaria IS 'Cor primária do certificado (hex)';
COMMENT ON COLUMN certificate_configs.fonte IS 'Fonte do texto do certificado';
COMMENT ON COLUMN certificate_configs.alinhamento IS 'Alinhamento do texto (left, center, right)';
COMMENT ON COLUMN certificate_configs.template_html IS 'Template HTML personalizado';
COMMENT ON COLUMN certificate_configs.layout_config IS 'Configurações adicionais de layout (JSON)';

-- 4) Habilitar RLS (Row Level Security)
ALTER TABLE certificate_configs ENABLE ROW LEVEL SECURITY;

-- 5) Criar políticas de segurança
-- Permitir que admins vejam todas as configurações
CREATE POLICY "Admins can view all certificate configs" ON certificate_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Permitir que admins insiram configurações
CREATE POLICY "Admins can insert certificate configs" ON certificate_configs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Permitir que admins atualizem configurações
CREATE POLICY "Admins can update certificate configs" ON certificate_configs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Permitir que admins deletem configurações
CREATE POLICY "Admins can delete certificate configs" ON certificate_configs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- 6) Criar função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_certificate_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7) Criar trigger para atualizar data_atualizacao
CREATE TRIGGER update_certificate_config_updated_at
  BEFORE UPDATE ON certificate_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_config_updated_at();

-- 8) Verificar se a tabela foi criada corretamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificate_configs' 
ORDER BY ordinal_position; 