-- Script conservador para corrigir problemas RLS específicos
-- Mantém a segurança mas corrige problemas identificados

-- 1. Primeiro, vamos verificar se a tabela modulos tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 2. Se modulos não tem RLS habilitado, habilitar
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- 3. Verificar se já existem políticas para modulos
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 4. Se não existem políticas para modulos, criar políticas básicas
-- (Só executa se não existirem políticas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'modulos'
    ) THEN
        -- Criar políticas básicas para modulos
        CREATE POLICY "Todos podem ver módulos" ON public.modulos
            FOR SELECT USING (true);
            
        CREATE POLICY "Administradores podem gerenciar módulos" ON public.modulos
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.usuarios 
                    WHERE id = auth.uid() AND tipo_usuario = 'admin'
                )
            );
    END IF;
END $$;

-- 5. Verificar se video_progress tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'video_progress';

-- 6. Se video_progress não tem RLS habilitado, habilitar
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- 7. Verificar políticas de video_progress
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'video_progress';

-- 8. Se não existem políticas para video_progress, criar políticas básicas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'video_progress'
    ) THEN
        -- Criar políticas básicas para video_progress
        CREATE POLICY "Usuários podem ver seu próprio progresso de vídeo" ON public.video_progress
            FOR SELECT USING (usuario_id = auth.uid());
            
        CREATE POLICY "Usuários podem inserir seu próprio progresso de vídeo" ON public.video_progress
            FOR INSERT WITH CHECK (usuario_id = auth.uid());
            
        CREATE POLICY "Usuários podem atualizar seu próprio progresso de vídeo" ON public.video_progress
            FOR UPDATE USING (usuario_id = auth.uid());
            
        CREATE POLICY "Administradores podem gerenciar progresso de vídeo" ON public.video_progress
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.usuarios 
                    WHERE id = auth.uid() AND tipo_usuario = 'admin'
                )
            );
    END IF;
END $$;

-- 9. Verificar se progresso_usuario tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'progresso_usuario';

-- 10. Se progresso_usuario não tem RLS habilitado, habilitar
ALTER TABLE public.progresso_usuario ENABLE ROW LEVEL SECURITY;

-- 11. Verificar políticas de progresso_usuario
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'progresso_usuario';

-- 12. Se não existem políticas para progresso_usuario, criar políticas básicas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'progresso_usuario'
    ) THEN
        -- Criar políticas básicas para progresso_usuario
        CREATE POLICY "Usuários podem ver seu próprio progresso" ON public.progresso_usuario
            FOR SELECT USING (usuario_id = auth.uid());
            
        CREATE POLICY "Usuários podem inserir seu próprio progresso" ON public.progresso_usuario
            FOR INSERT WITH CHECK (usuario_id = auth.uid());
            
        CREATE POLICY "Usuários podem atualizar seu próprio progresso" ON public.progresso_usuario
            FOR UPDATE USING (usuario_id = auth.uid());
            
        CREATE POLICY "Administradores podem gerenciar progresso" ON public.progresso_usuario
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.usuarios 
                    WHERE id = auth.uid() AND tipo_usuario = 'admin'
                )
            );
    END IF;
END $$;

-- 13. Verificar se usuarios tem políticas adequadas
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'usuarios';

-- 14. Se não existem políticas adequadas para usuarios, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'usuarios'
        AND cmd = 'INSERT'
    ) THEN
        -- Criar política de inserção para usuarios
        CREATE POLICY "Todos podem inserir usuários" ON public.usuarios
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 15. Verificar resultado final
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'modulos', 'video_progress', 'progresso_usuario')
ORDER BY tablename, policyname; 