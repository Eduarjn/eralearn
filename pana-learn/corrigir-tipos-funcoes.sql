-- Script para corrigir tipos de dados nas funções de comentários
-- Execute este script no Supabase SQL Editor

-- Corrigir função get_video_comments (problema de tipo VARCHAR vs TEXT)
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
    COALESCE(u.nome, u.email)::TEXT as autor_nome,  -- CAST para TEXT
    c.usuario_id as autor_id
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.video_id = p_video_id 
    AND c.ativo = true
  ORDER BY c.data_criacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função add_video_comment (problema de tipo VARCHAR vs TEXT)
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
  
  -- Retornar comentário criado (CORRIGIDO: CAST para TEXT)
  RETURN QUERY
  SELECT 
    c.id,
    c.texto,
    c.data_criacao,
    COALESCE(u.nome, u.email)::TEXT as autor_nome,  -- CAST para TEXT
    c.usuario_id as autor_id
  FROM public.comentarios c
  INNER JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.id = v_comentario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar estrutura da tabela usuarios para confirmar tipos
SELECT 'Verificando tipos da tabela usuarios:' as info;
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND column_name IN ('nome', 'email')
ORDER BY column_name;

-- Verificar estrutura da tabela comentarios
SELECT 'Verificando tipos da tabela comentarios:' as info;
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
ORDER BY ordinal_position;

-- Testar função get_video_comments corrigida
SELECT 'Testando função get_video_comments corrigida:' as info;
SELECT * FROM get_video_comments(
  (SELECT id FROM public.videos LIMIT 1)
);

-- Verificar se as funções foram corrigidas
SELECT 'Funções corrigidas:' as info;
SELECT 
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros,
  prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname IN ('get_video_comments', 'add_video_comment');

-- Inserir dados de teste se não existirem
INSERT INTO public.comentarios (video_id, usuario_id, texto) 
SELECT 
  v.id as video_id,
  u.id as usuario_id,
  'Comentário de teste para o vídeo ' || v.titulo
FROM public.videos v
CROSS JOIN public.usuarios u
WHERE u.tipo_usuario = 'cliente'
  AND NOT EXISTS (
    SELECT 1 FROM public.comentarios c 
    WHERE c.video_id = v.id AND c.usuario_id = u.id
  )
LIMIT 3;

-- Resumo final
SELECT 'Sistema de comentários corrigido com sucesso!' as info;
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




























