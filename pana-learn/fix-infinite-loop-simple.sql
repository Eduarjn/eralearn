-- Script simplificado para corrigir loop infinito
-- Baseado nos logs que mostram re-renders constantes

-- 1. Verificar políticas RLS que podem estar causando loops
SELECT '=== POLÍTICAS RLS PROBLEMÁTICAS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'modulos'
ORDER BY policyname;

-- 2. Remover políticas problemáticas da tabela modulos
DROP POLICY IF EXISTS "Todos podem ver módulos" ON public.modulos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar módulos" ON public.modulos;
DROP POLICY IF EXISTS "Administradores podem gerenciar módulos" ON public.modulos;

-- 3. Criar políticas mais simples para modulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar módulos" ON public.modulos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 4. Verificar se a correção funcionou
SELECT '=== TESTE APÓS CORREÇÃO ===' as info;
SELECT COUNT(*) as total_modulos_acessiveis
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 5. Verificar se há dados na tabela video_progress
SELECT '=== DADOS VIDEO_PROGRESS ===' as info;
SELECT COUNT(*) as total_video_progress
FROM video_progress; 