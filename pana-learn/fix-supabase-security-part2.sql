-- PARTE 2: Corrigir funções com search path mutável
-- Script para corrigir problemas de segurança no Supabase

-- 1. Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nome, tipo_usuario)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), 'cliente');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Corrigir função exportar_dados_usuario
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

-- 4. Corrigir função deletar_dados_usuario
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