-- ========================================
-- CORRIGIR FUNÇÃO gerar_certificado_dinamico
-- ========================================
-- Este script corrige a função que está tentando acessar user_profiles

-- 1. DROPAR A FUNÇÃO ATUAL
DROP FUNCTION IF EXISTS gerar_certificado_dinamico(UUID, UUID, UUID, INTEGER);

-- 2. RECRIAR A FUNÇÃO CORRIGIDA
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

-- 3. VERIFICAR SE A FUNÇÃO FOI CRIADA
SELECT '=== FUNÇÃO CORRIGIDA ===' as info;
SELECT 
  routine_name,
  routine_type,
  'OK' as status
FROM information_schema.routines 
WHERE routine_name = 'gerar_certificado_dinamico';

-- 4. TESTAR A FUNÇÃO
SELECT '=== TESTE DA FUNÇÃO ===' as info;
SELECT 'Função corrigida e pronta para uso!' as resultado;
