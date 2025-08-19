-- ========================================
-- SISTEMA DE CERTIFICADOS DINÂMICOS
-- ========================================
-- Este script cria um sistema completo de certificados
-- que calcula automaticamente a carga horária e gera certificados únicos

-- ========================================
-- 1. FUNÇÃO PARA CALCULAR CARGA HORÁRIA DO CURSO
-- ========================================

CREATE OR REPLACE FUNCTION calcular_carga_horaria_curso(p_curso_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_minutos INTEGER := 0;
  curso_nome TEXT;
BEGIN
  -- Calcular duração total dos vídeos do curso
  SELECT 
    COALESCE(SUM(COALESCE(v.duracao, 0)), 0),
    c.nome
  INTO total_minutos, curso_nome
  FROM videos v
  JOIN cursos c ON v.curso_id = c.id
  WHERE v.curso_id = p_curso_id
  GROUP BY c.nome;
  
  -- Converter minutos para horas (arredondando para cima)
  RETURN CEIL(total_minutos / 60.0);
END;
$$;

-- ========================================
-- 2. FUNÇÃO PARA GERAR NÚMERO ÚNICO DE CERTIFICADO
-- ========================================

CREATE OR REPLACE FUNCTION gerar_numero_certificado(p_curso_id UUID, p_usuario_id UUID)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  curso_sigla VARCHAR(10);
  ano_atual VARCHAR(4);
  sequencial INTEGER;
  numero_final VARCHAR(50);
BEGIN
  -- Obter sigla do curso (primeiras 3 letras)
  SELECT UPPER(LEFT(nome, 3)) INTO curso_sigla
  FROM cursos WHERE id = p_curso_id;
  
  -- Ano atual
  ano_atual := EXTRACT(YEAR FROM NOW())::VARCHAR;
  
  -- Sequencial do ano (quantos certificados já foram emitidos este ano)
  SELECT COALESCE(COUNT(*), 0) + 1 INTO sequencial
  FROM certificados
  WHERE EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM NOW());
  
  -- Formato: CURSO-ANO-SEQUENCIAL-USUARIO
  numero_final := curso_sigla || '-' || ano_atual || '-' || 
                  LPAD(sequencial::VARCHAR, 4, '0') || '-' ||
                  LEFT(p_usuario_id::VARCHAR, 8);
  
  RETURN numero_final;
END;
$$;

-- ========================================
-- 3. FUNÇÃO PRINCIPAL PARA GERAR CERTIFICADO
-- ========================================

CREATE OR REPLACE FUNCTION gerar_certificado_dinamico(
  p_usuario_id UUID,
  p_curso_id UUID,
  p_quiz_id UUID,
  p_nota INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_certificado_id UUID;
  v_curso_nome TEXT;
  v_usuario_nome TEXT;
  v_carga_horaria INTEGER;
  v_numero_certificado VARCHAR(50);
  v_categoria TEXT;
BEGIN
  -- Verificar se já existe certificado para este usuário e curso
  IF EXISTS (
    SELECT 1 FROM certificados 
    WHERE usuario_id = p_usuario_id AND curso_id = p_curso_id
  ) THEN
    RAISE EXCEPTION 'Certificado já existe para este usuário e curso';
  END IF;
  
  -- Obter dados do curso
  SELECT 
    c.nome,
    c.categoria
  INTO v_curso_nome, v_categoria
  FROM cursos c
  WHERE c.id = p_curso_id;
  
  -- Obter nome do usuário (usando apenas tabela usuarios)
  SELECT 
    COALESCE(u.nome, u.email)
  INTO v_usuario_nome
  FROM usuarios u
  WHERE u.id = p_usuario_id;
  
  -- Calcular carga horária
  v_carga_horaria := calcular_carga_horaria_curso(p_curso_id);
  
  -- Gerar número único do certificado
  v_numero_certificado := gerar_numero_certificado(p_curso_id, p_usuario_id);
  
  -- Inserir certificado
  INSERT INTO certificados (
    usuario_id,
    curso_id,
    curso_nome,
    categoria,
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
    v_curso_nome,
    v_categoria,
    p_quiz_id,
    p_nota,
    NOW(),
    NOW(),
    v_numero_certificado,
    'ativo',
    NULL, -- URL será gerada pelo frontend
    NULL  -- QR Code será gerado pelo frontend
  ) RETURNING id INTO v_certificado_id;
  
  RETURN v_certificado_id;
END;
$$;

-- ========================================
-- 4. FUNÇÃO PARA BUSCAR CERTIFICADOS DO USUÁRIO
-- ========================================

CREATE OR REPLACE FUNCTION buscar_certificados_usuario_dinamico(p_usuario_id UUID)
RETURNS TABLE (
  id UUID,
  curso_nome TEXT,
  categoria TEXT,
  numero_certificado VARCHAR(50),
  data_emissao TIMESTAMP WITH TIME ZONE,
  carga_horaria INTEGER,
  nota INTEGER,
  status VARCHAR(20),
  certificado_url TEXT,
  qr_code_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.curso_nome,
    c.categoria,
    c.numero_certificado,
    c.data_emissao,
    calcular_carga_horaria_curso(c.curso_id) as carga_horaria,
    c.nota,
    c.status,
    c.certificado_url,
    c.qr_code_url
  FROM certificados c
  WHERE c.usuario_id = p_usuario_id
  ORDER BY c.data_emissao DESC;
END;
$$;

-- ========================================
-- 5. FUNÇÃO PARA VALIDAR CERTIFICADO
-- ========================================

CREATE OR REPLACE FUNCTION validar_certificado_dinamico(p_numero_certificado VARCHAR(50))
RETURNS TABLE (
  valido BOOLEAN,
  curso_nome TEXT,
  usuario_nome TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE,
  carga_horaria INTEGER,
  nota INTEGER,
  status VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_certificado RECORD;
  v_usuario_nome TEXT;
BEGIN
  -- Buscar certificado
  SELECT 
    c.*,
    COALESCE(u.nome, u.email) as nome_usuario
  INTO v_certificado
  FROM certificados c
  JOIN usuarios u ON c.usuario_id = u.id
  WHERE c.numero_certificado = p_numero_certificado;
  
  -- Verificar se encontrou e se está ativo
  IF v_certificado.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::INTEGER, NULL::INTEGER, NULL::VARCHAR(20);
    RETURN;
  END IF;
  
  IF v_certificado.status != 'ativo' THEN
    RETURN QUERY SELECT false, v_certificado.curso_nome, v_certificado.nome_usuario, v_certificado.data_emissao, calcular_carga_horaria_curso(v_certificado.curso_id), v_certificado.nota, v_certificado.status;
    RETURN;
  END IF;
  
  -- Certificado válido
  RETURN QUERY SELECT true, v_certificado.curso_nome, v_certificado.nome_usuario, v_certificado.data_emissao, calcular_carga_horaria_curso(v_certificado.curso_id), v_certificado.nota, v_certificado.status;
END;
$$;

-- ========================================
-- 6. TESTAR AS FUNÇÕES
-- ========================================

SELECT '=== TESTANDO FUNÇÕES ===' as info;

-- Testar cálculo de carga horária
SELECT 
  c.nome as curso,
  calcular_carga_horaria_curso(c.id) as carga_horaria_horas
FROM cursos c
LIMIT 5;

-- Testar geração de número de certificado
SELECT 
  c.nome as curso,
  gerar_numero_certificado(c.id, '00000000-0000-0000-0000-000000000000') as numero_exemplo
FROM cursos c
LIMIT 3;

SELECT '=== SISTEMA DE CERTIFICADOS DINÂMICOS CRIADO ===' as info;
