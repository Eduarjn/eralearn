-- ========================================
-- SISTEMA DE QUIZ SIMPLES E DIRETO
-- ========================================
-- Script simplificado para configurar o sistema de quiz

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

SELECT '=== VERIFICANDO TABELAS ===' as info;

-- Verificar se as tabelas principais existem
SELECT 'Tabelas existentes:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('cursos', 'quizzes', 'progresso_quiz', 'certificados')
AND table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- 2. CRIAR TABELA DE MAPEAMENTO CURSO-QUIZ
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
-- 3. INSERIR MAPEAMENTOS ESPECÍFICOS
-- ========================================

SELECT '=== INSERINDO MAPEAMENTOS ===' as info;

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
-- 4. CRIAR FUNÇÃO SIMPLES PARA LIBERAR QUIZ
-- ========================================

SELECT '=== CRIANDO FUNÇÃO LIBERAR QUIZ ===' as info;

CREATE OR REPLACE FUNCTION liberar_quiz_curso(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS UUID AS $$
DECLARE
  quiz_id_result UUID;
BEGIN
  -- Buscar quiz associado ao curso
  SELECT cqm.quiz_id INTO quiz_id_result
  FROM curso_quiz_mapping cqm
  WHERE cqm.curso_id = p_curso_id
  LIMIT 1;
  
  RETURN quiz_id_result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. CRIAR FUNÇÃO SIMPLES PARA GERAR CERTIFICADO
-- ========================================

SELECT '=== CRIANDO FUNÇÃO GERAR CERTIFICADO ===' as info;

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
    curso_nome,
    categoria,
    categoria_nome,
    quiz_id,
    nota,
    data_conclusao,
    data_emissao,
    numero_certificado,
    status
  ) VALUES (
    p_usuario_id,
    p_curso_id,
    curso_nome,
    (SELECT categoria FROM cursos WHERE id = p_curso_id),
    curso_nome,
    p_quiz_id,
    p_nota,
    NOW(),
    NOW(),
    numero_certificado,
    'ativo'
  )
  RETURNING id INTO certificado_id;
  
  RETURN certificado_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. CONFIGURAR RLS SIMPLES
-- ========================================

SELECT '=== CONFIGURANDO RLS ===' as info;

-- Habilitar RLS na tabela de mapeamento
ALTER TABLE public.curso_quiz_mapping ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura
CREATE POLICY "Todos podem ver mapeamentos" ON public.curso_quiz_mapping
  FOR SELECT USING (true);

-- ========================================
-- 7. VERIFICAR RESULTADO
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

-- Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as funcao
FROM pg_proc 
WHERE proname IN ('liberar_quiz_curso', 'gerar_certificado_curso')
ORDER BY proname;

-- ========================================
-- 8. EXEMPLOS DE USO
-- ========================================

SELECT '=== EXEMPLOS DE USO ===' as info;

-- Para verificar se um usuário pode fazer quiz de um curso:
-- SELECT liberar_quiz_curso('usuario_id', 'curso_id');

-- Para gerar certificado após aprovação no quiz:
-- SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);

SELECT '=== SISTEMA DE QUIZ PRONTO ===' as info;
SELECT 'Sistema de quiz configurado com sucesso!' as mensagem;
