-- PARTE 3: Criar políticas para outras tabelas importantes
-- Script para corrigir problemas de segurança no Supabase

-- 1. Políticas para cursos
CREATE POLICY "Todos podem ver cursos" ON public.cursos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar cursos" ON public.cursos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 2. Políticas para vídeos
CREATE POLICY "Todos podem ver vídeos" ON public.videos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar vídeos" ON public.videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 3. Políticas para módulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem gerenciar módulos" ON public.modulos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 4. Políticas para progresso_usuario
CREATE POLICY "Usuários podem ver seu próprio progresso" ON public.progresso_usuario
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio progresso" ON public.progresso_usuario
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio progresso" ON public.progresso_usuario
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar progresso" ON public.progresso_usuario
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 5. Políticas para certificados
CREATE POLICY "Usuários podem ver seus próprios certificados" ON public.certificados
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar certificados" ON public.certificados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    );

-- 6. Políticas para video_progress
CREATE POLICY "Usuários podem ver seu próprio progresso de vídeo" ON public.video_progress
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio progresso de vídeo" ON public.video_progress
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio progresso de vídeo" ON public.video_progress
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar progresso de vídeo" ON public.video_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'admin'
        )
    ); 