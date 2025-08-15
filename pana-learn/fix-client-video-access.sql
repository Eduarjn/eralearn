-- Script para corrigir acesso dos clientes aos vídeos
-- Problema: Vídeos existem no banco mas clientes não conseguem ver

-- 1. Verificar políticas RLS da tabela videos
SELECT '=== POLÍTICAS RLS VIDEOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'videos'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado para videos
SELECT '=== STATUS RLS VIDEOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'videos';

-- 3. Habilitar RLS se não estiver
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 4. Remover TODAS as políticas existentes da tabela videos
DROP POLICY IF EXISTS "Apenas administradores podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Usuários podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Todos podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos" ON public.videos;
DROP POLICY IF EXISTS "Política de acesso a vídeos" ON public.videos;

-- 5. Criar políticas mais permissivas para videos (só se não existirem)
DO $$
BEGIN
    -- Política para SELECT (permitir todos verem)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver vídeos" ON public.videos
            FOR SELECT USING (true);
        RAISE NOTICE 'Política SELECT criada para videos';
    END IF;
    
    -- Política para administradores gerenciarem
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND cmd = 'ALL'
    ) THEN
        CREATE POLICY "Administradores podem gerenciar vídeos" ON public.videos
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.usuarios
                    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política ALL criada para videos';
    END IF;
END $$;

-- 6. Verificar políticas RLS da tabela cursos
SELECT '=== POLÍTICAS RLS CURSOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cursos'
ORDER BY policyname;

-- 7. Habilitar RLS para cursos se não estiver
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- 8. Remover TODAS as políticas existentes da tabela cursos
DROP POLICY IF EXISTS "Apenas administradores podem ver cursos" ON public.cursos;
DROP POLICY IF EXISTS "Usuários podem ver cursos" ON public.cursos;
DROP POLICY IF EXISTS "Todos podem ver cursos" ON public.cursos;
DROP POLICY IF EXISTS "Administradores podem gerenciar cursos" ON public.cursos;

-- 9. Criar políticas mais permissivas para cursos (só se não existirem)
DO $$
BEGIN
    -- Política para SELECT (permitir todos verem)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cursos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver cursos" ON public.cursos
            FOR SELECT USING (true);
        RAISE NOTICE 'Política SELECT criada para cursos';
    END IF;
    
    -- Política para administradores gerenciarem
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cursos' 
        AND cmd = 'ALL'
    ) THEN
        CREATE POLICY "Administradores podem gerenciar cursos" ON public.cursos
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.usuarios
                    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política ALL criada para cursos';
    END IF;
END $$;

-- 10. Testar acesso aos vídeos do curso PABX
SELECT '=== TESTE ACESSO VÍDEOS PABX ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.duracao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao;

-- 11. Verificar políticas finais
SELECT '=== POLÍTICAS FINAIS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('videos', 'cursos', 'modulos')
ORDER BY tablename, policyname; 