-- Correção: Criar função obter_proxima_ordem_video ausente no Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Criar a função que está faltando
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

-- 3. Verificar se a função foi criada corretamente
SELECT 
    proname as function_name,
    pronargs as num_args,
    proargtypes as arg_types
FROM pg_proc 
WHERE proname = 'obter_proxima_ordem_video';

-- 4. Testar a função
SELECT public.obter_proxima_ordem_video('98f3a689-389c-4ded-9833-846d59fcc183'::uuid) as proxima_ordem;

