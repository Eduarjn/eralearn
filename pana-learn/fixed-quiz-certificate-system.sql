-- Script corrigido para sistema de Quiz e Certificados
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

SELECT 'Verificando tabelas existentes...' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY table_name;

-- ========================================
-- 2. CRIAR TABELA QUIZZES (se não existir)
-- ========================================

-- Criar tabela de quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_minima INTEGER NOT NULL DEFAULT 70 CHECK (nota_minima >= 0 AND nota_minima <= 100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(categoria)
);

-- Criar tabela de perguntas do quiz
CREATE TABLE IF NOT EXISTS public.quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL,
  resposta_correta INTEGER NOT NULL CHECK (resposta_correta >= 0),
  explicacao TEXT,
  ordem INTEGER DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela de progresso do quiz
CREATE TABLE IF NOT EXISTS public.progresso_quiz (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL DEFAULT '{}',
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  aprovado BOOLEAN DEFAULT FALSE,
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, quiz_id)
);

-- ========================================
-- 3. CRIAR TABELA CERTIFICADOS (se não existir)
-- ========================================

-- Criar tabela de certificados
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  categoria_nome TEXT NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL,
  certificado_url TEXT,
  qr_code_url TEXT,
  numero_certificado VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado')),
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, categoria)
);

-- ========================================
-- 4. CRIAR ÍNDICES
-- ========================================

-- Índices para quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_categoria ON public.quizzes(categoria);
CREATE INDEX IF NOT EXISTS idx_quizzes_ativo ON public.quizzes(ativo);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_quiz_id ON public.quiz_perguntas(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_ordem ON public.quiz_perguntas(ordem);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_id ON public.progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_quiz_id ON public.progresso_quiz(quiz_id);

-- Índices para certificados
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_categoria ON public.certificados(categoria);
CREATE INDEX IF NOT EXISTS idx_certificados_data_emissao ON public.certificados(data_emissao);
CREATE INDEX IF NOT EXISTS idx_certificados_status ON public.certificados(status);
CREATE INDEX IF NOT EXISTS idx_certificados_numero ON public.certificados(numero_certificado);

-- ========================================
-- 5. CONFIGURAR RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Todos podem ver quizzes ativos" ON public.quizzes;
DROP POLICY IF EXISTS "Admins podem gerenciar quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Todos podem ver perguntas de quizzes ativos" ON public.quiz_perguntas;
DROP POLICY IF EXISTS "Admins podem gerenciar perguntas" ON public.quiz_perguntas;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem ver todo progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem ver seus certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem inserir seus certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem ver todos certificados" ON public.certificados;

-- Políticas RLS para quizzes
CREATE POLICY "Todos podem ver quizzes ativos" ON public.quizzes
  FOR SELECT USING (ativo = TRUE);

CREATE POLICY "Admins podem gerenciar quizzes" ON public.quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Políticas RLS para quiz_perguntas
CREATE POLICY "Todos podem ver perguntas de quizzes ativos" ON public.quiz_perguntas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      WHERE quizzes.id = quiz_perguntas.quiz_id 
      AND quizzes.ativo = TRUE
    )
  );

CREATE POLICY "Admins podem gerenciar perguntas" ON public.quiz_perguntas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Políticas RLS para progresso_quiz
CREATE POLICY "Usuários podem ver seu próprio progresso" ON public.progresso_quiz
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio progresso" ON public.progresso_quiz
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins podem ver todo progresso" ON public.progresso_quiz
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- Políticas RLS para certificados
CREATE POLICY "Usuários podem ver seus certificados" ON public.certificados
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir seus certificados" ON public.certificados
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins podem ver todos certificados" ON public.certificados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

CREATE POLICY "Admins podem gerenciar certificados" ON public.certificados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- ========================================
-- 6. CRIAR TRIGGERS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_quizzes_updated_at 
  BEFORE UPDATE ON public.quizzes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_perguntas_updated_at 
  BEFORE UPDATE ON public.quiz_perguntas 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificados_updated_at 
  BEFORE UPDATE ON public.certificados 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 7. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir quiz para categorias existentes
INSERT INTO public.quizzes (categoria, titulo, descricao, nota_minima)
VALUES 
  ('PABX', 'Quiz de Conclusão - PABX', 'Quiz para avaliar o conhecimento sobre sistemas PABX', 70),
  ('CALLCENTER', 'Quiz de Conclusão - Call Center', 'Quiz para avaliar o conhecimento sobre call centers', 70),
  ('Omnichannel', 'Quiz de Conclusão - Omnichannel', 'Quiz para avaliar o conhecimento sobre plataformas omnichannel', 70),
  ('VoIP', 'Quiz de Conclusão - VoIP', 'Quiz para avaliar o conhecimento sobre tecnologias VoIP', 70)
ON CONFLICT (categoria) DO NOTHING;

-- Inserir perguntas de exemplo para o quiz PABX
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa PABX?',
  ARRAY['Private Automatic Branch Exchange', 'Public Automatic Branch Exchange', 'Personal Automatic Branch Exchange', 'Private Automatic Business Exchange'],
  0,
  'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado usado em empresas.',
  1
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Um sistema PABX pode integrar com softwares de CRM?',
  ARRAY['Verdadeiro', 'Falso'],
  0,
  'Sim, sistemas PABX modernos podem integrar com CRMs para melhorar o atendimento ao cliente.',
  2
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a principal vantagem de um sistema PABX?',
  ARRAY['Reduzir custos de telefonia', 'Aumentar a velocidade da internet', 'Melhorar a qualidade do vídeo', 'Aumentar o armazenamento'],
  0,
  'A principal vantagem é reduzir custos de telefonia através de chamadas internas gratuitas.',
  3
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

-- Inserir perguntas de exemplo para o quiz Call Center
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é o objetivo principal de um call center?',
  ARRAY['Atender clientes', 'Vender produtos', 'Gerenciar estoque', 'Processar pagamentos'],
  0,
  'O objetivo principal de um call center é atender clientes de forma eficiente.',
  1
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa SLA em um call center?',
  ARRAY['Service Level Agreement', 'System Level Access', 'Service License Agreement', 'System License Access'],
  0,
  'SLA significa Service Level Agreement, um acordo sobre o nível de serviço prestado.',
  2
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER'
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. VERIFICAR RESULTADO
-- ========================================

-- Verificar tabelas criadas
SELECT 'Verificando tabelas criadas...' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'Verificando dados inseridos...' as info;
SELECT COUNT(*) as total_quizzes FROM public.quizzes;
SELECT COUNT(*) as total_perguntas FROM public.quiz_perguntas;
SELECT COUNT(*) as total_progresso FROM public.progresso_quiz;
SELECT COUNT(*) as total_certificados FROM public.certificados;

-- Verificar quiz criado
SELECT 'Quiz criado:' as info;
SELECT q.id, q.categoria, q.titulo, q.nota_minima, COUNT(qp.id) as total_perguntas
FROM public.quizzes q
LEFT JOIN public.quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.nota_minima;

-- Comentários para documentação
COMMENT ON TABLE public.quizzes IS 'Quizzes configurados para cada categoria';
COMMENT ON TABLE public.quiz_perguntas IS 'Perguntas de cada quiz';
COMMENT ON TABLE public.progresso_quiz IS 'Progresso dos usuários nos quizzes';
COMMENT ON TABLE public.certificados IS 'Certificados emitidos para usuários que concluíram quizzes';
COMMENT ON COLUMN public.quiz_perguntas.opcoes IS 'Array de strings com as opções de resposta';
COMMENT ON COLUMN public.quiz_perguntas.resposta_correta IS 'Índice da resposta correta no array opcoes (baseado em 0)';
COMMENT ON COLUMN public.progresso_quiz.respostas IS 'JSON com as respostas do usuário: {"pergunta_id": "resposta_index"}';
COMMENT ON COLUMN public.certificados.numero_certificado IS 'Número único do certificado gerado automaticamente';
COMMENT ON COLUMN public.certificados.certificado_url IS 'URL do PDF do certificado gerado';
COMMENT ON COLUMN public.certificados.qr_code_url IS 'URL do QR code para validação do certificado'; 