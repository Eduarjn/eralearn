-- Script para corrigir definitivamente a ambiguidade na função add_video_reply
-- Execute este script no Supabase SQL Editor

-- 1. Corrigir função add_video_reply (versão FINAL sem ambiguidade)
DROP FUNCTION IF EXISTS add_video_reply(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION add_video_reply(
  p_video_id UUID,
  p_parent_id UUID,
  p_texto TEXT
)
RETURNS TABLE(
  id UUID,
  texto TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE,
  autor_nome TEXT,
  autor_id UUID,
  parent_id UUID,
  is_admin BOOLEAN,
  nivel_resposta INTEGER
) AS $$
DECLARE
  v_usuario_id UUID;
  v_comentario_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Obter ID do usuário atual
  v_usuario_id := auth.uid();
  
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se é admin
  SELECT tipo_usuario = 'admin' INTO v_is_admin
  FROM public.usuarios
  WHERE id = v_usuario_id;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem responder comentários';
  END IF;
  
  -- Verificar se o comentário pai existe
  IF NOT EXISTS (
    SELECT 1 FROM public.comentarios 
    WHERE id = p_parent_id AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Comentário pai não encontrado';
  END IF;
  
  -- Inserir resposta (QUALIFICADO)
  INSERT INTO public.comentarios (video_id, usuario_id, texto, parent_id)
  VALUES (p_video_id, v_usuario_id, p_texto, p_parent_id)
  RETURNING public.comentarios.id INTO v_comentario_id;
  
  -- Retornar resposta criada (TODAS as colunas qualificadas)
  RETURN QUERY
  SELECT 
    c.id,
    c.texto,
    c.data_criacao,
    COALESCE(u.nome, u.email)::TEXT as autor_nome,
    c.usuario_id as autor_id,
    c.parent_id,
    (u.tipo_usuario = 'admin')::BOOLEAN as is_admin,
    1 as nivel_resposta
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.id = v_comentario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Verificar se a função foi criada
SELECT 'Função add_video_reply corrigida!' as info;
SELECT 
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros
FROM pg_proc 
WHERE proname = 'add_video_reply';

-- 3. Teste manual de inserção (para verificar se funciona)
SELECT 'Teste manual de inserção:' as info;
INSERT INTO public.comentarios (video_id, usuario_id, texto, parent_id)
VALUES (
  (SELECT video_id FROM public.comentarios WHERE parent_id IS NULL AND ativo = true LIMIT 1),
  (SELECT id FROM public.usuarios WHERE tipo_usuario = 'admin' LIMIT 1),
  'Resposta de teste do administrador - CORRIGIDA',
  (SELECT id FROM public.comentarios WHERE parent_id IS NULL AND ativo = true LIMIT 1)
)
RETURNING id, video_id, usuario_id, texto, parent_id;

-- 4. Verificar estrutura da tabela
SELECT 'Estrutura da tabela comentarios:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
ORDER BY ordinal_position;

-- 5. Resumo final
SELECT 'Correção finalizada!' as info;
SELECT 
  'Total de comentários:' as metric,
  COUNT(*) as value
FROM public.comentarios
UNION ALL
SELECT 
  'Comentários principais:' as metric,
  COUNT(*) as value
FROM public.comentarios
WHERE parent_id IS NULL AND ativo = true
UNION ALL
SELECT 
  'Respostas:' as metric,
  COUNT(*) as value
FROM public.comentarios
WHERE parent_id IS NOT NULL AND ativo = true;







