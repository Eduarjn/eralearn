-- Sistema de Sessão Única
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela para rastrear sessões ativas
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON public.active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON public.active_sessions(expires_at);

-- 3. Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.active_sessions 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Função para verificar se usuário já tem sessão ativa
CREATE OR REPLACE FUNCTION check_user_active_session(p_user_id UUID)
RETURNS TABLE(
    has_active_session BOOLEAN,
    session_id UUID,
    device_info JSONB,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Limpar sessões expiradas primeiro
    PERFORM cleanup_expired_sessions();
    
    RETURN QUERY
    SELECT 
        CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END as has_active_session,
        MAX(id) as session_id,
        MAX(device_info) as device_info,
        MAX(last_activity) as last_activity
    FROM public.active_sessions 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para criar nova sessão (remove sessões anteriores)
CREATE OR REPLACE FUNCTION create_user_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_device_info JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_session_id UUID;
BEGIN
    -- Limpar sessões expiradas
    PERFORM cleanup_expired_sessions();
    
    -- Remover todas as sessões ativas do usuário
    DELETE FROM public.active_sessions 
    WHERE user_id = p_user_id;
    
    -- Criar nova sessão
    INSERT INTO public.active_sessions (
        user_id, 
        session_token, 
        device_info, 
        ip_address, 
        user_agent
    ) VALUES (
        p_user_id, 
        p_session_token, 
        p_device_info, 
        p_ip_address, 
        p_user_agent
    ) RETURNING id INTO new_session_id;
    
    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para validar sessão
CREATE OR REPLACE FUNCTION validate_user_session(
    p_user_id UUID,
    p_session_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    session_exists BOOLEAN;
BEGIN
    -- Limpar sessões expiradas
    PERFORM cleanup_expired_sessions();
    
    -- Verificar se sessão existe e é válida
    SELECT EXISTS(
        SELECT 1 FROM public.active_sessions 
        WHERE user_id = p_user_id 
        AND session_token = p_session_token
        AND expires_at > NOW()
    ) INTO session_exists;
    
    -- Atualizar última atividade se sessão for válida
    IF session_exists THEN
        UPDATE public.active_sessions 
        SET last_activity = NOW()
        WHERE user_id = p_user_id 
        AND session_token = p_session_token;
    END IF;
    
    RETURN session_exists;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para encerrar sessão
CREATE OR REPLACE FUNCTION end_user_session(
    p_user_id UUID,
    p_session_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_session_token IS NULL THEN
        -- Encerrar todas as sessões do usuário
        DELETE FROM public.active_sessions 
        WHERE user_id = p_user_id;
    ELSE
        -- Encerrar sessão específica
        DELETE FROM public.active_sessions 
        WHERE user_id = p_user_id 
        AND session_token = p_session_token;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para limpeza automática (executa a cada hora)
-- Nota: No Supabase, você pode configurar um cron job para executar cleanup_expired_sessions()

-- 9. RLS (Row Level Security) para a tabela
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver suas próprias sessões
CREATE POLICY "Users can view own sessions" ON public.active_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários podem inserir suas próprias sessões
CREATE POLICY "Users can insert own sessions" ON public.active_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias sessões
CREATE POLICY "Users can update own sessions" ON public.active_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias sessões
CREATE POLICY "Users can delete own sessions" ON public.active_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Comentários para documentação
COMMENT ON TABLE public.active_sessions IS 'Tabela para rastrear sessões ativas de usuários (Single Session)';
COMMENT ON COLUMN public.active_sessions.user_id IS 'ID do usuário';
COMMENT ON COLUMN public.active_sessions.session_token IS 'Token único da sessão';
COMMENT ON COLUMN public.active_sessions.device_info IS 'Informações do dispositivo (navegador, OS, etc.)';
COMMENT ON COLUMN public.active_sessions.ip_address IS 'Endereço IP do usuário';
COMMENT ON COLUMN public.active_sessions.user_agent IS 'User Agent do navegador';
COMMENT ON COLUMN public.active_sessions.expires_at IS 'Data de expiração da sessão (7 dias)';











