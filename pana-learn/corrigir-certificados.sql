-- ========================================
-- CORREÇÃO E OTIMIZAÇÃO DOS CERTIFICADOS
-- ========================================
-- Este script corrige a estrutura dos certificados para funcionar
-- com o novo sistema de quiz específico por curso

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DOS CERTIFICADOS
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar estrutura da tabela certificados
SELECT 'Estrutura da tabela certificados:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar certificados existentes
SELECT 'Certificados existentes:' as info;
SELECT 
  id,
  usuario_id,
  categoria,
  nota,
  data_conclusao,
  data_criacao
FROM certificados 
ORDER BY data_criacao DESC
LIMIT 10;

-- ========================================
-- 2. CORRIGIR ESTRUTURA DA TABELA CERTIFICADOS
-- ========================================

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS curso_nome TEXT;

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL;

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS numero_certificado VARCHAR(100) UNIQUE;

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado'));

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- ========================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_curso_id ON public.certificados(curso_id);
CREATE INDEX IF NOT EXISTS idx_certificados_quiz_id ON public.certificados(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificados_categoria ON public.certificados(categoria);
CREATE INDEX IF NOT EXISTS idx_certificados_data_emissao ON public.certificados(data_emissao);
CREATE INDEX IF NOT EXISTS idx_certificados_status ON public.certificados(status);
CREATE INDEX IF NOT EXISTS idx_certificados_numero ON public.certificados(numero_certificado);

-- ========================================
-- 4. ATUALIZAR CERTIFICADOS EXISTENTES
-- ========================================

-- Atualizar curso_id baseado na categoria
UPDATE public.certificados 
SET curso_id = c.id,
    curso_nome = c.nome
FROM public.cursos c
WHERE certificados.categoria = c.categoria
AND certificados.curso_id IS NULL;

-- Gerar números de certificado para registros que não têm
UPDATE public.certificados 
SET numero_certificado = 'CERT-' || id::text || '-' || EXTRACT(EPOCH FROM data_criacao)::text
WHERE numero_certificado IS NULL;

-- Atualizar curso_nome para registros que não têm
UPDATE public.certificados 
SET curso_nome = c.nome
FROM public.cursos c
WHERE certificados.curso_id = c.id
AND certificados.curso_nome IS NULL;

-- ========================================
-- 5. CRIAR FUNÇÃO MELHORADA PARA GERAR CERTIFICADO
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
  curso_categoria TEXT;
  numero_certificado TEXT;
  certificado_existente UUID;
BEGIN
  -- Verificar se já existe certificado para este usuário e curso
  SELECT id INTO certificado_existente
  FROM certificados
  WHERE usuario_id = p_usuario_id 
  AND curso_id = p_curso_id
  AND status = 'ativo';
  
  -- Se já existe, retornar o existente
  IF certificado_existente IS NOT NULL THEN
    RETURN certificado_existente;
  END IF;
  
  -- Buscar informações do curso
  SELECT nome, categoria INTO curso_nome, curso_categoria
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
    status,
    certificado_url,
    qr_code_url
  ) VALUES (
    p_usuario_id,
    p_curso_id,
    curso_nome,
    curso_categoria,
    curso_nome,
    p_quiz_id,
    p_nota,
    NOW(),
    NOW(),
    numero_certificado,
    'ativo',
    NULL, -- Será gerado pelo backend
    NULL  -- Será gerado pelo backend
  )
  RETURNING id INTO certificado_id;
  
  RETURN certificado_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. CRIAR FUNÇÃO PARA BUSCAR CERTIFICADOS DO USUÁRIO
-- ========================================

CREATE OR REPLACE FUNCTION buscar_certificados_usuario(
  p_usuario_id UUID
)
RETURNS TABLE (
  id UUID,
  curso_id UUID,
  curso_nome TEXT,
  categoria TEXT,
  nota INTEGER,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  data_emissao TIMESTAMP WITH TIME ZONE,
  numero_certificado TEXT,
  status TEXT,
  certificado_url TEXT,
  qr_code_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.curso_id,
    c.curso_nome,
    c.categoria,
    c.nota,
    c.data_conclusao,
    c.data_emissao,
    c.numero_certificado,
    c.status,
    c.certificado_url,
    c.qr_code_url
  FROM certificados c
  WHERE c.usuario_id = p_usuario_id
  AND c.status = 'ativo'
  ORDER BY c.data_emissao DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. CRIAR FUNÇÃO PARA VALIDAR CERTIFICADO
-- ========================================

CREATE OR REPLACE FUNCTION validar_certificado(
  p_numero_certificado TEXT
)
RETURNS TABLE (
  valido BOOLEAN,
  curso_nome TEXT,
  usuario_nome TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE,
  nota INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.id IS NOT NULL AND c.status = 'ativo' THEN true
      ELSE false
    END as valido,
    c.curso_nome,
    u.nome as usuario_nome,
    c.data_emissao,
    c.nota,
    c.status
  FROM certificados c
  LEFT JOIN usuarios u ON c.usuario_id = u.id
  WHERE c.numero_certificado = p_numero_certificado;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. CONFIGURAR RLS PARA CERTIFICADOS
-- ========================================

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuário vê seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuário pode inserir seus certificados" ON public.certificados;

-- Criar novas políticas
CREATE POLICY "Usuário vê seus próprios certificados" ON public.certificados
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode inserir seus certificados" ON public.certificados
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuário pode atualizar seus certificados" ON public.certificados
  FOR UPDATE USING (auth.uid()::text = usuario_id::text);

-- Política para administradores verem todos os certificados
CREATE POLICY "Admin pode ver todos os certificados" ON public.certificados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::uuid 
      AND tipo_usuario = 'admin'
    )
  );

-- ========================================
-- 9. CRIAR TRIGGER PARA ATUALIZAR DATA_ATUALIZACAO
-- ========================================

-- Função para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION update_certificados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar data_atualizacao
DROP TRIGGER IF EXISTS update_certificados_updated_at ON public.certificados;
CREATE TRIGGER update_certificados_updated_at 
  BEFORE UPDATE ON public.certificados 
  FOR EACH ROW EXECUTE FUNCTION update_certificados_updated_at();

-- ========================================
-- 10. VERIFICAR RESULTADO
-- ========================================

SELECT '=== CERTIFICADOS CORRIGIDOS ===' as info;

-- Verificar estrutura final
SELECT 'Estrutura final da tabela certificados:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar certificados atualizados
SELECT 'Certificados atualizados:' as info;
SELECT 
  id,
  curso_nome,
  categoria,
  nota,
  numero_certificado,
  status,
  data_emissao
FROM certificados 
ORDER BY data_emissao DESC
LIMIT 5;

-- Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as funcao,
  prosrc as descricao
FROM pg_proc 
WHERE proname IN ('gerar_certificado_curso', 'buscar_certificados_usuario', 'validar_certificado');

-- ========================================
-- 11. EXEMPLOS DE USO
-- ========================================

-- Para gerar certificado:
-- SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);

-- Para buscar certificados do usuário:
-- SELECT * FROM buscar_certificados_usuario('usuario_id');

-- Para validar certificado:
-- SELECT * FROM validar_certificado('CERT-123-456-789');

SELECT '=== SISTEMA DE CERTIFICADOS PRONTO ===' as info;
SELECT 'Certificados agora funcionam perfeitamente com o sistema de quiz específico!' as mensagem;
