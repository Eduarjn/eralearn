-- Migração para criar tabela de quizzes por curso
-- Data: 2025-06-27

-- Criar tabela de quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_minima INTEGER NOT NULL DEFAULT 70 CHECK (nota_minima >= 0 AND nota_minima <= 100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(curso_id)
);

-- Criar tabela de perguntas do quiz
CREATE TABLE IF NOT EXISTS public.quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL, -- Array de strings com as opções
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
  respostas JSONB NOT NULL DEFAULT '{}', -- Respostas do usuário
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  aprovado BOOLEAN DEFAULT FALSE,
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, quiz_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quizzes_curso_id ON public.quizzes(curso_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_ativo ON public.quizzes(ativo);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_quiz_id ON public.quiz_perguntas(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_ordem ON public.quiz_perguntas(ordem);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_id ON public.progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_quiz_id ON public.progresso_quiz(quiz_id);

-- Habilitar RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;

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

-- Triggers para atualizar updated_at
CREATE TRIGGER update_quizzes_updated_at 
  BEFORE UPDATE ON public.quizzes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_perguntas_updated_at 
  BEFORE UPDATE ON public.quiz_perguntas 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo (opcional)
-- Quiz para o primeiro curso encontrado
INSERT INTO public.quizzes (curso_id, titulo, descricao, nota_minima)
SELECT 
  c.id,
  'Quiz de Conclusão - ' || c.nome,
  'Quiz para avaliar o conhecimento adquirido no curso ' || c.nome,
  70
FROM public.cursos c
WHERE c.status = 'ativo'
LIMIT 1
ON CONFLICT (curso_id) DO NOTHING;

-- Inserir perguntas de exemplo para o quiz criado
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa PABX?',
  ARRAY['Private Automatic Branch Exchange', 'Public Automatic Branch Exchange', 'Personal Automatic Branch Exchange', 'Private Automatic Business Exchange'],
  0,
  'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado usado em empresas.',
  1
FROM public.quizzes q
WHERE q.titulo LIKE '%PABX%'
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
WHERE q.titulo LIKE '%PABX%'
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.quizzes IS 'Quizzes configurados para cada curso';
COMMENT ON TABLE public.quiz_perguntas IS 'Perguntas de cada quiz';
COMMENT ON TABLE public.progresso_quiz IS 'Progresso dos usuários nos quizzes';
COMMENT ON COLUMN public.quiz_perguntas.opcoes IS 'Array de strings com as opções de resposta';
COMMENT ON COLUMN public.quiz_perguntas.resposta_correta IS 'Índice da resposta correta no array opcoes (baseado em 0)';
COMMENT ON COLUMN public.progresso_quiz.respostas IS 'JSON com as respostas do usuário: {"pergunta_id": "resposta_index"}'; 