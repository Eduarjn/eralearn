-- Script para corrigir políticas RLS que estão causando erros 403 e 400
-- Baseado nos logs do Supabase mostrando muitos erros de permissão

-- 1. Primeiro, vamos verificar quais políticas existem
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Remover políticas problemáticas da tabela modulos
DROP POLICY IF EXISTS "Todos podem ver módulos" ON public.modulos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar módulos" ON public.modulos;

-- 3. Criar políticas mais permissivas para modulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Todos podem inserir módulos" ON public.modulos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar módulos" ON public.modulos
    FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar módulos" ON public.modulos
    FOR DELETE USING (true);

-- 4. Corrigir políticas da tabela usuarios para permitir inserção
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON public.usuarios;

-- 5. Criar políticas mais permissivas para usuarios
CREATE POLICY "Todos podem ver usuários" ON public.usuarios
    FOR SELECT USING (true);

CREATE POLICY "Todos podem inserir usuários" ON public.usuarios
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Administradores podem gerenciar usuários" ON public.usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 6. Corrigir políticas da tabela video_progress
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso de vídeo" ON public.video_progress;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso de vídeo" ON public.video_progress;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso de vídeo" ON public.video_progress;
DROP POLICY IF EXISTS "Administradores podem gerenciar progresso de vídeo" ON public.video_progress;

-- 7. Criar políticas mais permissivas para video_progress
CREATE POLICY "Todos podem ver progresso de vídeo" ON public.video_progress
    FOR SELECT USING (true);

CREATE POLICY "Todos podem inserir progresso de vídeo" ON public.video_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seu próprio progresso de vídeo" ON public.video_progress
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar progresso de vídeo" ON public.video_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 8. Corrigir políticas da tabela progresso_usuario
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON public.progresso_usuario;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso" ON public.progresso_usuario;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso" ON public.progresso_usuario;
DROP POLICY IF EXISTS "Administradores podem gerenciar progresso" ON public.progresso_usuario;

-- 9. Criar políticas mais permissivas para progresso_usuario
CREATE POLICY "Todos podem ver progresso" ON public.progresso_usuario
    FOR SELECT USING (true);

CREATE POLICY "Todos podem inserir progresso" ON public.progresso_usuario
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seu próprio progresso" ON public.progresso_usuario
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar progresso" ON public.progresso_usuario
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 10. Verificar se as tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'modulos', 'video_progress', 'progresso_usuario', 'videos', 'cursos');

-- 11. Verificar políticas atualizadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'modulos', 'video_progress', 'progresso_usuario', 'videos', 'cursos')
ORDER BY tablename, policyname; 