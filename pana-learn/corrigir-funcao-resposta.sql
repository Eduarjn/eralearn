-- Script para corrigir a função add_video_reply
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna parent_id existe
SELECT 'Verificando coluna parent_id:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
  AND column_name = 'parent_id';

-- 2. Adicionar coluna parent_id se não existir
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE;

-- 3. Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_comentarios_parent_id ON public.comentarios(parent_id);

-- 4. Corrigir função add_video_reply (versão simplificada)
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

-- 5. Verificar se a função foi criada
SELECT 'Verificando função add_video_reply:' as info;
SELECT 
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros
FROM pg_proc 
WHERE proname = 'add_video_reply';

-- 6. Testar a função manualmente
SELECT 'Testando função add_video_reply:' as info;

-- Primeiro, vamos ver se há comentários para testar
SELECT 'Comentários disponíveis para teste:' as info;
SELECT 
  id,
  texto,
  video_id
FROM public.comentarios 
WHERE parent_id IS NULL 
  AND ativo = true
LIMIT 3;

-- 7. Verificar usuários admin
SELECT 'Usuários admin disponíveis:' as info;
SELECT 
  id,
  nome,
  email,
  tipo_usuario
FROM public.usuarios 
WHERE tipo_usuario = 'admin'
LIMIT 3;

-- 8. Teste manual de inserção (substitua os UUIDs pelos reais)
SELECT 'Teste manual de inserção de resposta:' as info;
INSERT INTO public.comentarios (video_id, usuario_id, texto, parent_id)
VALUES (
  (SELECT video_id FROM public.comentarios WHERE parent_id IS NULL AND ativo = true LIMIT 1),
  (SELECT id FROM public.usuarios WHERE tipo_usuario = 'admin' LIMIT 1),
  'Resposta de teste do administrador',
  (SELECT id FROM public.comentarios WHERE parent_id IS NULL AND ativo = true LIMIT 1)
)
RETURNING id, video_id, usuario_id, texto, parent_id;

-- 9. Verificar estrutura final
SELECT 'Estrutura final da tabela comentarios:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
ORDER BY ordinal_position;

-- 10. Resumo
SELECT 'Correção concluída!' as info;
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
































