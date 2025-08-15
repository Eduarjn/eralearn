-- Script para corrigir problemas de segurança no Supabase
-- Baseado nos problemas identificados no Security Advisor

-- 1. Habilitar RLS nas tabelas principais
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS para a tabela usuarios
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Administradores podem ver todos os usuários" ON public.usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 3. Criar políticas RLS para a tabela relatorios
CREATE POLICY "Usuários podem ver relatórios de sua empresa" ON public.relatorios
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM public.usuarios 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Administradores podem ver todos os relatórios" ON public.relatorios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 4. Criar políticas RLS para a tabela badges
CREATE POLICY "Todos podem ver badges" ON public.badges
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar badges" ON public.badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 5. Criar políticas RLS para a tabela user_badges
CREATE POLICY "Usuários podem ver seus próprios badges" ON public.user_badges
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar user_badges" ON public.user_badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 6. Criar políticas RLS para a tabela empresas
CREATE POLICY "Usuários podem ver dados de sua empresa" ON public.empresas
    FOR SELECT USING (
        id IN (
            SELECT empresa_id FROM public.usuarios 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Administradores podem gerenciar empresas" ON public.empresas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 7. Corrigir funções com search path mutável
-- Atualizar função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nome, tipo_usuario)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), 'cliente');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função exportar_dados_usuario
CREATE OR REPLACE FUNCTION public.exportar_dados_usuario(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'usuario', u,
        'progresso', p,
        'certificados', c
    ) INTO result
    FROM public.usuarios u
    LEFT JOIN public.progresso_usuario p ON u.id = p.usuario_id
    LEFT JOIN public.certificados c ON u.id = c.usuario_id
    WHERE u.id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar função deletar_dados_usuario
CREATE OR REPLACE FUNCTION public.deletar_dados_usuario(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.progresso_usuario WHERE usuario_id = user_id;
    DELETE FROM public.certificados WHERE usuario_id = user_id;
    DELETE FROM public.user_badges WHERE usuario_id = user_id;
    DELETE FROM public.usuarios WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Criar políticas para outras tabelas importantes
-- Políticas para cursos
CREATE POLICY "Todos podem ver cursos" ON public.cursos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar cursos" ON public.cursos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Políticas para vídeos
CREATE POLICY "Todos podem ver vídeos" ON public.videos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar vídeos" ON public.videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- Políticas para módulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar módulos" ON public.modulos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 9. Verificar se as tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'relatorios', 'badges', 'user_badges', 'empresas', 'cursos', 'videos', 'modulos');

-- 10. Verificar políticas criadas
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
WHERE schemaname = 'public'; 