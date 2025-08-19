-- ========================================
-- CRIAR MAPEAMENTO QUIZ DO ZERO
-- ========================================
-- Script muito simples para criar o mapeamento curso-quiz

-- ========================================
-- 1. REMOVER TABELA SE EXISTIR
-- ========================================

SELECT '=== REMOVENDO TABELA ANTIGA ===' as info;

DROP TABLE IF EXISTS public.curso_quiz_mapping CASCADE;

-- ========================================
-- 2. CRIAR TABELA NOVA
-- ========================================

SELECT '=== CRIANDO TABELA NOVA ===' as info;

CREATE TABLE public.curso_quiz_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(curso_id, quiz_id)
);

-- ========================================
-- 3. CRIAR ÍNDICES
-- ========================================

SELECT '=== CRIANDO ÍNDICES ===' as info;

CREATE INDEX idx_curso_quiz_mapping_curso_id ON public.curso_quiz_mapping(curso_id);
CREATE INDEX idx_curso_quiz_mapping_quiz_id ON public.curso_quiz_mapping(quiz_id);

-- ========================================
-- 4. INSERIR DADOS
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
WHERE c.status = 'ativo' AND q.ativo = true;

-- ========================================
-- 5. VERIFICAR RESULTADO
-- ========================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar estrutura da tabela
SELECT 'Estrutura da tabela:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'curso_quiz_mapping' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT 'Mapeamentos criados:' as info;
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.categoria as categoria_quiz
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- ========================================
-- 6. CRIAR FUNÇÕES
-- ========================================

SELECT '=== CRIANDO FUNÇÕES ===' as info;

-- Função para liberar quiz
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

-- Função para gerar certificado
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
-- 7. CONFIGURAR RLS
-- ========================================

SELECT '=== CONFIGURANDO RLS ===' as info;

-- Habilitar RLS
ALTER TABLE public.curso_quiz_mapping ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura
CREATE POLICY "Todos podem ver mapeamentos" ON public.curso_quiz_mapping
  FOR SELECT USING (true);

-- ========================================
-- 8. VERIFICAR FUNÇÕES
-- ========================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as info;

SELECT 
  proname as funcao
FROM pg_proc 
WHERE proname IN ('liberar_quiz_curso', 'gerar_certificado_curso')
ORDER BY proname;

SELECT '=== MAPEAMENTO CRIADO COM SUCESSO ===' as info;
SELECT 'Sistema de quiz pronto para uso!' as mensagem;
