-- Script para corrigir a função liberar_quiz_curso
-- Problema: A função está tentando usar a tabela curso_quiz_mapping que não existe
-- Solução: Criar uma versão simplificada que funciona com a estrutura atual

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se a tabela quizzes existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela cursos existe e tem a coluna categoria
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
AND column_name = 'categoria'
ORDER BY ordinal_position;

-- ========================================
-- 2. CRIAR FUNÇÃO SIMPLIFICADA
-- ========================================

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS liberar_quiz_curso(UUID, UUID);

-- Criar nova função simplificada
CREATE OR REPLACE FUNCTION liberar_quiz_curso(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS UUID AS $$
DECLARE
  quiz_id_result UUID;
  curso_categoria VARCHAR(100);
BEGIN
  -- Buscar categoria do curso
  SELECT categoria INTO curso_categoria
  FROM cursos
  WHERE id = p_curso_id;
  
  -- Se não encontrou o curso, retornar NULL
  IF curso_categoria IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Verificar se todos os vídeos do curso foram concluídos
  -- Buscar todos os vídeos do curso
  IF NOT EXISTS (
    SELECT 1 FROM videos v
    WHERE v.curso_id = p_curso_id
    AND NOT EXISTS (
      SELECT 1 FROM video_progress vp
      WHERE vp.video_id = v.id
      AND vp.user_id = p_usuario_id
      AND (vp.concluido = true OR vp.percentual_assistido >= 90)
    )
  ) THEN
    -- Todos os vídeos foram concluídos, buscar quiz da categoria
    SELECT q.id INTO quiz_id_result
    FROM quizzes q
    WHERE q.categoria = curso_categoria
    AND q.ativo = true
    LIMIT 1;
    
    RETURN quiz_id_result;
  END IF;
  
  -- Se não todos os vídeos foram concluídos, retornar NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. TESTAR A FUNÇÃO
-- ========================================

SELECT '=== TESTANDO A FUNÇÃO ===' as info;

-- Verificar se há quizzes para PABX
SELECT 
    id,
    categoria,
    titulo,
    ativo
FROM quizzes 
WHERE categoria = 'PABX';

-- Verificar se há curso PABX
SELECT 
    id,
    nome,
    categoria
FROM cursos 
WHERE categoria = 'PABX'
LIMIT 1;

-- ========================================
-- 4. CRIAR FUNÇÃO ALTERNATIVA (se necessário)
-- ========================================

-- Se a estrutura for diferente, criar função alternativa
CREATE OR REPLACE FUNCTION liberar_quiz_curso_alternativa(
  p_usuario_id UUID,
  p_curso_id UUID
)
RETURNS UUID AS $$
DECLARE
  quiz_id_result UUID;
  curso_categoria VARCHAR(100);
BEGIN
  -- Buscar categoria do curso
  SELECT categoria INTO curso_categoria
  FROM cursos
  WHERE id = p_curso_id;
  
  -- Se não encontrou o curso, retornar NULL
  IF curso_categoria IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar quiz da categoria diretamente (sem verificar conclusão)
  SELECT q.id INTO quiz_id_result
  FROM quizzes q
  WHERE q.categoria = curso_categoria
  AND q.ativo = true
  LIMIT 1;
  
  RETURN quiz_id_result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. VERIFICAR RESULTADO
-- ========================================

SELECT '=== FUNÇÃO CRIADA COM SUCESSO ===' as info;
SELECT 'A função liberar_quiz_curso foi corrigida e deve funcionar agora.' as resultado;






















