-- ========================================
-- CORREÇÃO DO ERRO 406 NO VÍDEO
-- ========================================
-- Script para corrigir o erro 406 (Not Acceptable) no vídeo
-- Execute no Supabase SQL Editor

-- 1. Verificar o vídeo específico que está dando erro
SELECT 
    'Vídeo com problema' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';

-- 2. Corrigir dados do vídeo
UPDATE public.videos 
SET 
    source = 'upload',
    video_url = COALESCE(video_url, url_video),
    ativo = true,
    data_atualizacao = NOW()
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';

-- 3. Verificar se a correção foi aplicada
SELECT 
    'Vídeo corrigido' as status,
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo,
    data_atualizacao
FROM public.videos 
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';

-- 4. Verificar se há outros vídeos com problemas similares
SELECT 
    'Vídeos com problemas' as status,
    COUNT(*) as quantidade
FROM public.videos 
WHERE 
    (source IS NULL OR source = '')
    OR (video_url IS NULL OR video_url = '')
    OR ativo = false;

-- 5. Corrigir todos os vídeos com problemas similares
UPDATE public.videos 
SET 
    source = 'upload',
    video_url = COALESCE(video_url, url_video),
    ativo = true,
    data_atualizacao = NOW()
WHERE 
    (source IS NULL OR source = '')
    OR (video_url IS NULL OR video_url = '')
    OR ativo = false;

-- 6. Verificar políticas RLS que podem estar causando o erro 406
SELECT 
    'Políticas RLS' as tipo,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'videos'
ORDER BY policyname;

-- 7. Criar/atualizar política RLS se necessário
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Todos podem ver vídeos ativos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem inserir vídeos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem atualizar vídeos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem deletar vídeos" ON public.videos;

-- Criar políticas mais permissivas
CREATE POLICY "Todos podem ver vídeos ativos" ON public.videos
    FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem inserir vídeos" ON public.videos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Administradores podem atualizar vídeos" ON public.videos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Administradores podem deletar vídeos" ON public.videos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- 8. Verificar se RLS está habilitado
SELECT 
    'RLS Status' as tipo,
    CASE 
        WHEN relrowsecurity THEN 'HABILITADO'
        ELSE 'DESABILITADO'
    END as status
FROM pg_class 
WHERE relname = 'videos' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 9. Habilitar RLS se necessário
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 10. Teste final - verificar se o vídeo está acessível
SELECT 
    'Teste final' as status,
    id,
    titulo,
    source,
    video_url,
    ativo,
    'Vídeo deve estar acessível agora' as resultado
FROM public.videos 
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';









