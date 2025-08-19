-- ========================================
-- CRIAR TABELA CERTIFICADOS COM ESTRUTURA CORRETA
-- ========================================
-- Este script recria a tabela certificados com a estrutura adequada

-- ========================================
-- 1. VERIFICAR E REMOVER TABELA ANTIGA
-- ========================================

SELECT '=== REMOVENDO TABELA ANTIGA ===' as info;

-- Remover tabela certificados se existir
DROP TABLE IF EXISTS public.certificados CASCADE;

-- ========================================
-- 2. CRIAR TABELA CERTIFICADOS NOVA
-- ========================================

SELECT '=== CRIANDO TABELA NOVA ===' as info;

CREATE TABLE public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  curso_nome TEXT NOT NULL,
  categoria TEXT,
  categoria_nome TEXT,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  numero_certificado VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado')),
  certificado_url TEXT,
  qr_code_url TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

SELECT '=== CRIANDO ÍNDICES ===' as info;

CREATE INDEX idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX idx_certificados_curso_id ON public.certificados(curso_id);
CREATE INDEX idx_certificados_quiz_id ON public.certificados(quiz_id);
CREATE INDEX idx_certificados_categoria ON public.certificados(categoria);
CREATE INDEX idx_certificados_data_emissao ON public.certificados(data_emissao);
CREATE INDEX idx_certificados_status ON public.certificados(status);
CREATE INDEX idx_certificados_numero ON public.certificados(numero_certificado);
CREATE INDEX idx_certificados_data_conclusao ON public.certificados(data_conclusao);

-- ========================================
-- 4. CRIAR FUNÇÃO PARA GERAR CERTIFICADO
-- ========================================

SELECT '=== CRIANDO FUNÇÕES ===' as info;

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
-- 5. CRIAR FUNÇÃO PARA BUSCAR CERTIFICADOS
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
-- 6. CRIAR FUNÇÃO PARA VALIDAR CERTIFICADO
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
-- 7. CONFIGURAR RLS
-- ========================================

SELECT '=== CONFIGURANDO RLS ===' as info;

-- Habilitar RLS
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Criar políticas
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
-- 8. CRIAR TRIGGER PARA ATUALIZAR DATA_ATUALIZACAO
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
CREATE TRIGGER update_certificados_updated_at 
  BEFORE UPDATE ON public.certificados 
  FOR EACH ROW EXECUTE FUNCTION update_certificados_updated_at();

-- ========================================
-- 9. VERIFICAR RESULTADO
-- ========================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

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

-- Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as funcao,
  prosrc as descricao
FROM pg_proc 
WHERE proname IN ('gerar_certificado_curso', 'buscar_certificados_usuario', 'validar_certificado');

-- Verificar políticas RLS
SELECT 'Políticas RLS criadas:' as info;
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'certificados'
AND schemaname = 'public'
ORDER BY policyname;

-- ========================================
-- 10. EXEMPLOS DE USO
-- ========================================

SELECT '=== EXEMPLOS DE USO ===' as info;

-- Para gerar certificado:
-- SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);

-- Para buscar certificados do usuário:
-- SELECT * FROM buscar_certificados_usuario('usuario_id');

-- Para validar certificado:
-- SELECT * FROM validar_certificado('CERT-123-456-789');

SELECT '=== TABELA CERTIFICADOS CRIADA COM SUCESSO ===' as info;
SELECT 'Agora você pode usar o sistema de certificados!' as mensagem;
