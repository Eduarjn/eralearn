-- Script para criar sistema de comentários completo
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de comentários
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ativo BOOLEAN NOT NULL DEFAULT true
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_comentarios_video_id ON public.comentarios(video_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_id ON public.comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_data_criacao ON public.comentarios(data_criacao);

-- 3. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_comentarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar timestamp
DROP TRIGGER IF EXISTS update_comentarios_updated_at_trigger ON public.comentarios;
CREATE TRIGGER update_comentarios_updated_at_trigger
  BEFORE UPDATE ON public.comentarios
  FOR EACH ROW
  EXECUTE FUNCTION update_comentarios_updated_at();

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
-- Política para visualizar comentários (todos podem ver)
CREATE POLICY "Usuários podem visualizar comentários" ON public.comentarios
  FOR SELECT USING (true);

-- Política para criar comentários (usuários autenticados)
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.comentarios
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id AND 
    ativo = true
  );

-- Política para atualizar comentários (apenas o autor)
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.comentarios
  FOR UPDATE USING (
    auth.uid() = usuario_id
  );

-- Política para deletar comentários (apenas o autor ou admin)
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.comentarios
  FOR DELETE USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- 7. Criar função para buscar comentários de um vídeo
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

-- 8. Criar função para adicionar comentário
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
  
  -- Retornar comentário criado
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

-- 9. Criar função para deletar comentário
CREATE OR REPLACE FUNCTION delete_video_comment(p_comentario_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_usuario_id UUID;
  v_comentario_usuario_id UUID;
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
  
  -- Obter usuário do comentário
  SELECT usuario_id INTO v_comentario_usuario_id
  FROM public.comentarios
  WHERE id = p_comentario_id;
  
  -- Verificar permissão
  IF v_comentario_usuario_id != v_usuario_id AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Sem permissão para deletar este comentário';
  END IF;
  
  -- Deletar comentário (soft delete)
  UPDATE public.comentarios 
  SET ativo = false 
  WHERE id = p_comentario_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Inserir dados de teste
INSERT INTO public.comentarios (video_id, usuario_id, texto) 
SELECT 
  v.id as video_id,
  u.id as usuario_id,
  'Comentário de teste para o vídeo ' || v.titulo
FROM public.videos v
CROSS JOIN public.usuarios u
WHERE u.tipo_usuario = 'cliente'
LIMIT 5;

-- 11. Verificar estrutura criada
SELECT 'Tabela comentarios criada:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'comentarios' 
ORDER BY ordinal_position;

-- 12. Verificar políticas RLS
SELECT 'Políticas RLS criadas:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'comentarios';

-- 13. Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT 
  proname as nome_funcao,
  prosrc as codigo
FROM pg_proc 
WHERE proname IN ('get_video_comments', 'add_video_comment', 'delete_video_comment');

-- 14. Testar funções
SELECT 'Testando função get_video_comments:' as info;
SELECT * FROM get_video_comments(
  (SELECT id FROM public.videos LIMIT 1)
);

-- 15. Resumo
SELECT 'Sistema de comentários criado com sucesso!' as info;
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
