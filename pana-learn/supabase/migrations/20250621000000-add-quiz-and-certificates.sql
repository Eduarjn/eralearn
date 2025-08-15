-- Criar tabela de configuração de quiz
CREATE TABLE IF NOT EXISTS quiz_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  nota_minima INTEGER NOT NULL DEFAULT 70 CHECK (nota_minima >= 0 AND nota_minima <= 100),
  perguntas JSONB NOT NULL DEFAULT '[]',
  mensagem_sucesso TEXT NOT NULL DEFAULT 'Parabéns! Você foi aprovado no quiz e pode prosseguir para obter seu certificado.',
  mensagem_reprova TEXT NOT NULL DEFAULT 'Você não atingiu a nota mínima. Revise o conteúdo e tente novamente.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(categoria_id)
);

-- Criar tabela de certificados
CREATE TABLE IF NOT EXISTS certificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  categoria_nome TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL,
  certificado_url TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, categoria_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quiz_config_categoria_id ON quiz_config(categoria_id);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_categoria_id ON certificados(categoria_id);
CREATE INDEX IF NOT EXISTS idx_certificados_data_conclusao ON certificados(data_conclusao);

-- Adicionar RLS (Row Level Security)
ALTER TABLE quiz_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Políticas para quiz_config (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage quiz config" ON quiz_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario = 'admin'
    )
  );

-- Políticas para certificados
CREATE POLICY "Users can view their own certificates" ON certificados
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own certificates" ON certificados
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins can view all certificates" ON certificados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_quiz_config_updated_at 
  BEFORE UPDATE ON quiz_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificados_updated_at 
  BEFORE UPDATE ON certificados 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo para quiz (opcional)
INSERT INTO quiz_config (categoria_id, nota_minima, perguntas, mensagem_sucesso, mensagem_reprova) 
SELECT 
  c.id,
  70,
  '[
    {
      "id": "q1",
      "pergunta": "O que significa PABX?",
      "tipo": "multipla_escolha",
      "alternativas": [
        "Private Automatic Branch Exchange",
        "Public Automatic Branch Exchange", 
        "Personal Automatic Branch Exchange",
        "Private Automatic Business Exchange"
      ],
      "resposta_correta": 0,
      "explicacao": "PABX significa Private Automatic Branch Exchange, um sistema telefônico privado usado em empresas."
    },
    {
      "id": "q2", 
      "pergunta": "Um sistema PABX pode integrar com softwares de CRM?",
      "tipo": "verdadeiro_falso",
      "alternativas": ["Verdadeiro", "Falso"],
      "resposta_correta": 0,
      "explicacao": "Sim, sistemas PABX modernos podem integrar com CRMs para melhorar o atendimento ao cliente."
    }
  ]'::jsonb,
  'Parabéns! Você demonstrou conhecimento sólido sobre sistemas PABX. Seu certificado está disponível!',
  'Continue estudando! Revise o conteúdo sobre PABX e tente novamente.'
FROM categorias c 
WHERE c.nome = 'PABX'
ON CONFLICT (categoria_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE quiz_config IS 'Configurações de quiz para conclusão de cursos por categoria';
COMMENT ON TABLE certificados IS 'Certificados emitidos para usuários que concluíram cursos';
COMMENT ON COLUMN quiz_config.perguntas IS 'Array JSON com perguntas do quiz';
COMMENT ON COLUMN certificados.certificado_url IS 'URL do PDF do certificado gerado';
COMMENT ON COLUMN certificados.qr_code_url IS 'URL do QR code para validação do certificado'; 