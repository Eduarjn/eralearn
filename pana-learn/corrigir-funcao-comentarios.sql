-- Script para corrigir a função add_video_comment
-- Execute este script no Supabase SQL Editor

-- Corrigir função add_video_comment (problema de ambiguidade na coluna id)
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
  RETURNING id INTO v_comentario_id;
  
  -- Retornar comentário criado (CORRIGIDO: especificar tabela para evitar ambiguidade)
  RETURN QUERY
  SELECT 
    c.id,
    c.texto,
    c.data_criacao,
    COALESCE(u.nome, u.email) as autor_nome,
    c.usuario_id as autor_id
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.id = v_comentario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função get_video_comments também (para garantir)
CREATE OR REPLACE FUNCTION get_video_comments(p_video_id UUID)
RETURNS TABLE(
  id UUID,
  texto TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE,
  autor_nome TEXT,
  autor_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.texto,
    c.data_criacao,
    COALESCE(u.nome, u.email) as autor_nome,
    c.usuario_id as autor_id
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.video_id = p_video_id 
    AND c.ativo = true
  ORDER BY c.data_criacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função corrigida
SELECT 'Testando função add_video_comment corrigida:' as info;

-- Verificar se a função foi corrigida
SELECT 
  proname as nome_funcao,
  prosrc as codigo
FROM pg_proc 
WHERE proname = 'add_video_comment';

-- Verificar se há comentários de teste
SELECT 'Verificando comentários existentes:' as info;
SELECT 
  'Total de comentários:' as metric,
  COUNT(*) as value
FROM public.comentarios
UNION ALL
SELECT 
  'Comentários ativos:' as metric,
  COUNT(*) as value
FROM public.comentarios
WHERE ativo = true;

-- Testar função get_video_comments
SELECT 'Testando função get_video_comments:' as info;
SELECT * FROM get_video_comments(
  (SELECT id FROM public.videos LIMIT 1)
);
