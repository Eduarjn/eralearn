-- Script para corrigir upload de vídeos
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/oqoxhavdhrgd/sql

-- 1. Criar função obter_proxima_ordem_video ausente
CREATE OR REPLACE FUNCTION public.obter_proxima_ordem_video(p_curso_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    proxima_ordem integer;
BEGIN
    -- Busca a maior ordem atual para o curso e adiciona 1
    SELECT COALESCE(MAX(ordem), 0) + 1 
    INTO proxima_ordem
    FROM videos 
    WHERE curso_id = p_curso_id;
    
    RETURN proxima_ordem;
END;
$$;

-- 2. Dar permissões necessárias
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO authenticated;

-- 3. Testar a função com o curso PABX
SELECT public.obter_proxima_ordem_video('98f3a689-389c-4ded-9833-846d59fcc183'::uuid) as proxima_ordem;

-- 4. Verificar se foi criada corretamente
SELECT 
    proname as function_name,
    pronargs as num_args,
    proargtypes as arg_types
FROM pg_proc 
WHERE proname = 'obter_proxima_ordem_video';

-- 5. Criar índice para melhor performance se não existir
CREATE INDEX IF NOT EXISTS idx_videos_curso_ordem ON videos(curso_id, ordem);

-- 6. Comentário para documentação
COMMENT ON FUNCTION public.obter_proxima_ordem_video(uuid) IS 'Retorna a próxima ordem disponível para um vídeo em um curso específico';

-- Mensagem de sucesso
SELECT 'Função obter_proxima_ordem_video criada com sucesso!' as status;
