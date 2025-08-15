-- Script para corrigir loop infinito que causa piscar
-- Baseado nos logs que mostram re-renders constantes

-- 1. Verificar se a coluna usuario_id existe na tabela video_progress
SELECT '=== VERIFICAR COLUNA USUARIO_ID ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress' 
AND column_name = 'usuario_id';

-- 2. Se a coluna não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_progress' 
        AND column_name = 'usuario_id'
    ) THEN
        ALTER TABLE public.video_progress ADD COLUMN usuario_id UUID REFERENCES public.usuarios(id);
    END IF;
END $$;

-- 3. Verificar políticas RLS que podem estar causando loops
SELECT '=== POLÍTICAS RLS PROBLEMÁTICAS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'modulos'
ORDER BY policyname;

-- 4. Remover políticas problemáticas da tabela modulos
DROP POLICY IF EXISTS "Todos podem ver módulos" ON public.modulos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar módulos" ON public.modulos;
DROP POLICY IF EXISTS "Administradores podem gerenciar módulos" ON public.modulos;

-- 5. Criar políticas mais simples para modulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar módulos" ON public.modulos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 6. Verificar se há triggers que podem estar causando loops
SELECT '=== TRIGGERS PROBLEMÁTICOS ===' as info;
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%progress%' OR trigger_name LIKE '%update%';

-- 7. Verificar triggers problemáticos
SELECT '=== TRIGGERS PROBLEMÁTICOS ===' as info;
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_name LIKE '%progress%' OR trigger_name LIKE '%update%');

-- 8. Verificar se a correção funcionou
SELECT '=== TESTE APÓS CORREÇÃO ===' as info;
SELECT COUNT(*) as total_modulos_acessiveis
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'; 