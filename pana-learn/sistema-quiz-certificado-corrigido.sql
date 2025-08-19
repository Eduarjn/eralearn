-- ========================================
-- SISTEMA DE QUIZ E CERTIFICADOS CORRIGIDO
-- ========================================
-- Este script corrige completamente o sistema de quiz e certificados
-- Garantindo que cada curso tenha seu quiz específico e certificado correspondente

-- ========================================
-- 1. LIMPAR ESTRUTURA ANTIGA
-- ========================================

-- Remover tabelas antigas na ordem correta
DROP TABLE IF EXISTS public.progresso_quiz CASCADE;
DROP TABLE IF EXISTS public.quiz_perguntas CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.certificados CASCADE;

-- ========================================
-- 2. CRIAR TABELA QUIZZES (RELACIONADA A CURSOS)
-- ========================================

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

-- ========================================
-- 3. CRIAR TABELA QUIZ_PERGUNTAS
-- ========================================

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

-- ========================================
-- 4. CRIAR TABELA PROGRESSO_QUIZ
-- ========================================

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
-- 5. CRIAR TABELA CERTIFICADOS (RELACIONADA A CURSOS)
-- ========================================

CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  curso_nome TEXT NOT NULL,
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
  UNIQUE(usuario_id, curso_id)
);

-- ========================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_quizzes_curso_id ON public.quizzes(curso_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_ativo ON public.quizzes(ativo);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_quiz_id ON public.quiz_perguntas(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_ordem ON public.quiz_perguntas(ordem);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_id ON public.progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_quiz_id ON public.progresso_quiz(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_curso_id ON public.certificados(curso_id);

-- ========================================
-- 7. HABILITAR RLS (ROW LEVEL SECURITY)
-- ========================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. CRIAR POLÍTICAS RLS
-- ========================================

-- Políticas para quizzes (todos podem ver)
CREATE POLICY "Todos podem ver quizzes" ON public.quizzes
  FOR SELECT USING (true);

-- Políticas para perguntas (todos podem ver)
CREATE POLICY "Todos podem ver perguntas" ON public.quiz_perguntas
  FOR SELECT USING (true);

-- Políticas para progresso (usuário só vê seu próprio progresso)
CREATE POLICY "Usuário vê seu próprio progresso" ON public.progresso_quiz
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode inserir seu progresso" ON public.progresso_quiz
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

-- Políticas para certificados (usuário só vê seus próprios certificados)
CREATE POLICY "Usuário vê seus próprios certificados" ON public.certificados
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode inserir seus certificados" ON public.certificados
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

-- ========================================
-- 9. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ========================================

-- Função para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER update_quizzes_updated_at 
  BEFORE UPDATE ON public.quizzes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_perguntas_updated_at 
  BEFORE UPDATE ON public.quiz_perguntas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificados_updated_at 
  BEFORE UPDATE ON public.certificados 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir quizzes para cursos existentes
INSERT INTO public.quizzes (curso_id, titulo, descricao, nota_minima, ativo)
SELECT 
  c.id,
  'Quiz de Conclusão - ' || c.nome,
  'Quiz para avaliar o conhecimento adquirido no curso ' || c.nome,
  70,
  true
FROM public.cursos c
WHERE c.status = 'ativo'
ON CONFLICT (curso_id) DO NOTHING;

-- Inserir perguntas de exemplo para cada quiz
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é o objetivo principal deste curso?',
  ARRAY['Aprender conceitos básicos', 'Dominar técnicas avançadas', 'Conhecer ferramentas essenciais', 'Todas as alternativas'],
  3,
  'O curso aborda desde conceitos básicos até técnicas avançadas e ferramentas essenciais.',
  1
FROM public.quizzes q
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Você conseguiu aplicar os conhecimentos aprendidos?',
  ARRAY['Sim, completamente', 'Parcialmente', 'Ainda não', 'Preciso de mais prática'],
  0,
  'A aplicação prática é fundamental para consolidar o aprendizado.',
  2
FROM public.quizzes q
ON CONFLICT DO NOTHING;

-- ========================================
-- 11. VERIFICAR ESTRUTURA CRIADA
-- ========================================

SELECT '=== ESTRUTURA CRIADA COM SUCESSO ===' as info;

SELECT 'Quizzes criados:' as info;
SELECT 
  q.id,
  q.titulo,
  c.nome as curso_nome,
  q.nota_minima,
  q.ativo
FROM public.quizzes q
JOIN public.cursos c ON q.curso_id = c.id;

SELECT 'Perguntas criadas:' as info;
SELECT 
  qp.id,
  qp.pergunta,
  q.titulo as quiz_titulo,
  qp.ordem
FROM public.quiz_perguntas qp
JOIN public.quizzes q ON qp.quiz_id = q.id
ORDER BY q.titulo, qp.ordem;

SELECT '=== SISTEMA PRONTO PARA USO ===' as info;
