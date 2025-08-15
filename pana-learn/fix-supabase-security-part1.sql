-- PARTE 1: Habilitar RLS e criar políticas básicas
-- Script para corrigir problemas de segurança no Supabase

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