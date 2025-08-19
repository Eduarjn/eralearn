-- ========================================
-- CORREÇÃO DO SISTEMA DE QUIZ ESPECÍFICO
-- ========================================
-- Este script corrige o sistema para usar os quizzes existentes
-- e criar relacionamento direto entre cursos e quizzes específicos

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar estrutura da tabela progresso_quiz
SELECT 'Estrutura da tabela progresso_quiz:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar cursos existentes
SELECT 'Cursos existentes:' as info;
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE status = 'ativo'
ORDER BY nome;

-- Verificar quizzes existentes
SELECT 'Quizzes existentes:' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- ========================================
-- 2. CORRIGIR ESTRUTURA DA TABELA PROGRESSO_QUIZ
-- ========================================

SELECT '=== CORRIGINDO ESTRUTURA PROGRESSO_QUIZ ===' as info;

-- Adicionar coluna quiz_id se não existir
ALTER TABLE public.progresso_quiz 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Adicionar coluna usuario_id se não existir
ALTER TABLE public.progresso_quiz 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE;

-- Adicionar coluna nota se não existir
ALTER TABLE public.progresso_quiz 
ADD COLUMN IF NOT EXISTS nota INTEGER CHECK (nota >= 0 AND nota <= 100);

-- Adicionar coluna aprovado se não existir
ALTER TABLE public.progresso_quiz 
ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT false;

-- Adicionar coluna data_conclusao se não existir
ALTER TABLE public.progresso_quiz 
ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_id ON public.progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_quiz_id ON public.progresso_quiz(quiz_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_aprovado ON public.progresso_quiz(aprovado);

-- ========================================
-- 3. CRIAR TABELA DE MAPEAMENTO CURSO-QUIZ
-- ========================================

SELECT '=== CRIANDO MAPEAMENTO CURSO-QUIZ ===' as info;

-- Criar tabela para mapear cursos específicos com quizzes específicos
CREATE TABLE IF NOT EXISTS public.curso_quiz_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(curso_id, quiz_id)
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_curso_quiz_mapping_curso_id ON public.curso_quiz_mapping(curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_quiz_mapping_quiz_id ON public.curso_quiz_mapping(quiz_id);

-- ========================================
-- 4. INSERIR MAPEAMENTOS ESPECÍFICOS
-- ========================================

-- Mapear cada curso com seu quiz específico
INSERT INTO public.curso_quiz_mapping (curso_id, quiz_id)
SELECT 
  c.id as curso_id,
  q.id as quiz_id
FROM public.cursos c
JOIN public.quizzes q ON (
  CASE 
    -- PABX
    WHEN c.nome = 'Fundamentos de PABX' AND q.categoria = 'PABX_FUNDAMENTOS' THEN true
    WHEN c.nome = 'Configurações Avançadas PABX' AND q.categoria = 'PABX_AVANCADO' THEN true
    -- OMNICHANNEL
    WHEN c.nome = 'OMNICHANNEL para Empresas' AND q.categoria = 'OMNICHANNEL_EMPRESAS' THEN true
    WHEN c.nome = 'Configurações Avançadas OMNI' AND q.categoria = 'OMNICHANNEL_AVANCADO' THEN true
    -- CALLCENTER
    WHEN c.nome = 'Fundamentos CALLCENTER' AND q.categoria = 'CALLCENTER_FUNDAMENTOS' THEN true
    ELSE false
  END
)
WHERE c.status = 'ativo' AND q.ativo = true
ON CONFLICT (curso_id, quiz_id) DO NOTHING;

-- ========================================
-- 5. CRIAR FUNÇÃO PARA VERIFICAR CONCLUSÃO DO CURSO
-- ========================================

SELECT '=== CRIANDO FUNÇÕES ===' as info;

CREATE OR REPLACE FUNCTION verificar_conclusao_curso(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  total_videos INTEGER;
  videos_concluidos INTEGER;
  curso_completo BOOLEAN := FALSE;
BEGIN
  -- Contar total de vídeos do curso
  SELECT COUNT(*) INTO total_videos
  FROM videos v
  WHERE v.curso_id = p_curso_id;
  
  -- Contar vídeos concluídos pelo usuário
  SELECT COUNT(*) INTO videos_concluidos
  FROM video_progress vp
  JOIN videos v ON vp.video_id = v.id
  WHERE v.curso_id = p_curso_id 
  AND vp.user_id = p_usuario_id
  AND vp.concluido = true;
  
  -- Verificar se todos os vídeos foram concluídos
  IF total_videos > 0 AND videos_concluidos >= total_videos THEN
    curso_completo := TRUE;
  END IF;
  
  RETURN curso_completo;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. CRIAR FUNÇÃO PARA LIBERAR QUIZ
-- ========================================

CREATE OR REPLACE FUNCTION liberar_quiz_curso(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS UUID AS $$
DECLARE
  quiz_id_result UUID;
BEGIN
  -- Verificar se curso foi concluído
  IF NOT verificar_conclusao_curso(p_usuario_id, p_curso_id) THEN
    RETURN NULL;
  END IF;
  
  -- Buscar quiz associado ao curso
  SELECT cqm.quiz_id INTO quiz_id_result
  FROM curso_quiz_mapping cqm
  WHERE cqm.curso_id = p_curso_id
  LIMIT 1;
  
  RETURN quiz_id_result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. CRIAR FUNÇÃO PARA GERAR CERTIFICADO
-- ========================================

CREATE OR REPLACE FUNCTION gerar_certificado_curso(
  p_usuario_id UUID,
  p_curso_id UUID,
  p_quiz_id UUID,
  p_nota INTEGER
)
RETURNS UUID AS $$
DECLARE
  certificado_id UUID;
  curso_nome TEXT;
  numero_certificado TEXT;
BEGIN
  -- Buscar nome do curso
  SELECT nome INTO curso_nome
  FROM cursos
  WHERE id = p_curso_id;
  
  -- Gerar número único do certificado
  numero_certificado := 'CERT-' || p_curso_id::text || '-' || p_usuario_id::text || '-' || EXTRACT(EPOCH FROM NOW())::text;
  
  -- Inserir certificado
  INSERT INTO certificados (
    usuario_id,
    curso_id,
    categoria,
    categoria_nome,
    quiz_id,
    nota,
    data_conclusao,
    numero_certificado,
    status
  ) VALUES (
    p_usuario_id,
    p_curso_id,
    (SELECT categoria FROM cursos WHERE id = p_curso_id),
    curso_nome,
    p_quiz_id,
    p_nota,
    NOW(),
    numero_certificado,
    'ativo'
  )
  RETURNING id INTO certificado_id;
  
  RETURN certificado_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. CONFIGURAR RLS PARA PROGRESSO_QUIZ
-- ========================================

SELECT '=== CONFIGURANDO RLS ===' as info;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuário vê seu próprio progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuário pode inserir seu progresso" ON public.progresso_quiz;

-- Criar novas políticas
CREATE POLICY "Usuário vê seu próprio progresso" ON public.progresso_quiz
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode inserir seu progresso" ON public.progresso_quiz
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode atualizar seu progresso" ON public.progresso_quiz
  FOR UPDATE USING (auth.uid()::text = usuario_id::text);

-- ========================================
-- 9. CONFIGURAR RLS PARA CURSO_QUIZ_MAPPING
-- ========================================

-- Habilitar RLS
ALTER TABLE public.curso_quiz_mapping ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir leitura
CREATE POLICY "Todos podem ver mapeamentos" ON public.curso_quiz_mapping
  FOR SELECT USING (true);

-- ========================================
-- 10. VERIFICAR RESULTADO
-- ========================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar mapeamentos criados
SELECT 'Mapeamentos curso-quiz criados:' as info;
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.categoria as categoria_quiz
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- Verificar estrutura final da tabela progresso_quiz
SELECT 'Estrutura final da tabela progresso_quiz:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as funcao,
  prosrc as descricao
FROM pg_proc 
WHERE proname IN ('verificar_conclusao_curso', 'liberar_quiz_curso', 'gerar_certificado_curso');

-- ========================================
-- 11. EXEMPLOS DE USO
-- ========================================

SELECT '=== EXEMPLOS DE USO ===' as info;

-- Para verificar se um usuário pode fazer quiz de um curso:
-- SELECT liberar_quiz_curso('usuario_id', 'curso_id');

-- Para gerar certificado após aprovação no quiz:
-- SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);

-- Para verificar conclusão de curso:
-- SELECT verificar_conclusao_curso('usuario_id', 'curso_id');

SELECT '=== SISTEMA PRONTO ===' as info;
SELECT 'Agora cada curso tem seu quiz especifico associado!' as mensagem;
