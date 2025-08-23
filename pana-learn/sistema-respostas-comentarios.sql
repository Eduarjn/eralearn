-- Script para adicionar sistema de respostas aos comentários
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna parent_id à tabela comentarios
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE;

-- 2. Criar índice para parent_id
CREATE INDEX IF NOT EXISTS idx_comentarios_parent_id ON public.comentarios(parent_id);

-- 3. Atualizar função get_video_comments para incluir respostas
CREATE OR REPLACE FUNCTION get_video_comments_with_replies(p_video_id UUID)
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
BEGIN
  RETURN QUERY
  WITH RECURSIVE comentarios_hierarquia AS (
    -- Comentários principais (sem parent_id)
    SELECT 
      c.id,
      c.texto,
      c.data_criacao,
      COALESCE(u.nome, u.email)::TEXT as autor_nome,
      c.usuario_id as autor_id,
      c.parent_id,
      (u.tipo_usuario = 'admin')::BOOLEAN as is_admin,
      0 as nivel_resposta
    FROM public.comentarios c
    INNER JOIN public.usuarios u ON c.usuario_id = u.id
    WHERE c.video_id = p_video_id 
      AND c.ativo = true
      AND c.parent_id IS NULL
    
    UNION ALL
    
    -- Respostas (com parent_id)
    SELECT 
      c.id,
      c.texto,
      c.data_criacao,
      COALESCE(u.nome, u.email)::TEXT as autor_nome,
      c.usuario_id as autor_id,
      c.parent_id,
      (u.tipo_usuario = 'admin')::BOOLEAN as is_admin,
      ch.nivel_resposta + 1
    FROM public.comentarios c
    INNER JOIN public.usuarios u ON c.usuario_id = u.id
    INNER JOIN comentarios_hierarquia ch ON c.parent_id = ch.id
    WHERE c.ativo = true
  )
  SELECT * FROM comentarios_hierarquia
  ORDER BY nivel_resposta, data_criacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função para adicionar resposta (para admins)
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
  
  -- Verificar se o comentário pai existe e pertence ao mesmo vídeo
  IF NOT EXISTS (
    SELECT 1 FROM public.comentarios 
    WHERE id = p_parent_id AND video_id = p_video_id AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Comentário pai não encontrado';
  END IF;
  
  -- Inserir resposta
  INSERT INTO public.comentarios (video_id, usuario_id, texto, parent_id)
  VALUES (p_video_id, v_usuario_id, p_texto, p_parent_id)
  RETURNING public.comentarios.id INTO v_comentario_id;
  
  -- Retornar resposta criada
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

-- 5. Atualizar função delete_video_comment para permitir admin deletar qualquer comentário
CREATE OR REPLACE FUNCTION delete_video_comment_admin(p_comentario_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_usuario_id UUID;
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
    RAISE EXCEPTION 'Apenas administradores podem deletar comentários';
  END IF;
  
  -- Deletar comentário (soft delete)
  UPDATE public.comentarios 
  SET ativo = false 
  WHERE id = p_comentario_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar política RLS para respostas
DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON public.comentarios;
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.comentarios
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id AND 
    ativo = true
  );

-- 7. Inserir dados de teste (respostas de admin)
INSERT INTO public.comentarios (video_id, usuario_id, texto, parent_id) 
SELECT 
  c.video_id,
  u.id as usuario_id,
  'Resposta do administrador ao comentário: ' || c.texto,
  c.id as parent_id
FROM public.comentarios c
CROSS JOIN public.usuarios u
WHERE u.tipo_usuario = 'admin'
  AND c.parent_id IS NULL
  AND c.ativo = true
LIMIT 3;

-- 8. Verificar estrutura atualizada
SELECT 'Estrutura da tabela comentarios:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
ORDER BY ordinal_position;

-- 9. Testar função get_video_comments_with_replies
SELECT 'Testando função get_video_comments_with_replies:' as info;
SELECT * FROM get_video_comments_with_replies(
  (SELECT id FROM public.videos LIMIT 1)
);

-- 10. Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros
FROM pg_proc 
WHERE proname IN ('get_video_comments_with_replies', 'add_video_reply', 'delete_video_comment_admin');

-- 11. Resumo final
SELECT 'Sistema de respostas criado com sucesso!' as info;
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







