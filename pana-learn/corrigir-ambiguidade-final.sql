-- Script para corrigir definitivamente a ambiguidade na função add_video_comment
-- Execute este script no Supabase SQL Editor

-- Corrigir função add_video_comment (versão FINAL sem ambiguidade)
CREATE OR REPLACE FUNCTION add_video_comment(
  p_video_id UUID,
  p_texto TEXT
)
RETURNS TABLE(
  id UUID,
  texto TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE,
  autor_nome TEXT,
  autor_id UUID
) AS $$
DECLARE
  v_usuario_id UUID;
  v_comentario_id UUID;
BEGIN
  -- Obter ID do usuário atual
  v_usuario_id := auth.uid();
  
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Inserir comentário
  INSERT INTO public.comentarios (video_id, usuario_id, texto)
  VALUES (p_video_id, v_usuario_id, p_texto)
  RETURNING public.comentarios.id INTO v_comentario_id;  -- QUALIFICADO
  
  -- Retornar comentário criado (TODAS as colunas qualificadas)
  RETURN QUERY
  SELECT 
    c.id,
    c.texto,
    c.data_criacao,
    COALESCE(u.nome, u.email)::TEXT as autor_nome,
    c.usuario_id as autor_id
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.id = v_comentario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função corrigida
SELECT 'Função add_video_comment corrigida!' as info;

-- Verificar se a função foi criada corretamente
SELECT 
  proname as nome_funcao,
  prosrc as codigo
FROM pg_proc 
WHERE proname = 'add_video_comment';

-- Teste manual para verificar se funciona
SELECT 'Testando inserção manual:' as info;
INSERT INTO public.comentarios (video_id, usuario_id, texto)
VALUES (
  '8cb86753-98d3-4dfc-ba03-5fa3e840eefc',
  (SELECT id FROM public.usuarios WHERE tipo_usuario = 'cliente' LIMIT 1),
  'Teste após correção'
)
RETURNING id, video_id, usuario_id, texto;






































