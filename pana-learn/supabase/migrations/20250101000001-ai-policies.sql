-- ========================================
-- MIGRATION: Módulo de IA - RLS Policies
-- ========================================
-- Data: 2025-01-01
-- Descrição: Configuração de Row Level Security para o módulo de IA
-- Feature Flag: FEATURE_AI=true

-- ========================================
-- 1. FUNÇÕES AUXILIARES
-- ========================================

-- Função para verificar se o usuário é admin do domínio
CREATE OR REPLACE FUNCTION is_domain_admin(domain_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.user_id = auth.uid()
    AND u.tipo_usuario IN ('admin', 'admin_master')
    AND u.domain_id = domain_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o domain_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_domain_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT domain_id FROM public.usuarios
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 2. HABILITAR RLS NAS TABELAS
-- ========================================

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. POLÍTICAS PARA AI_PROVIDERS
-- ========================================

-- Usuários podem ver provedores ativos do seu domínio
CREATE POLICY "Users can view active providers from their domain" ON public.ai_providers
    FOR SELECT USING (
        domain_id = get_user_domain_id()
        AND active = true
    );

-- Admins podem gerenciar provedores do seu domínio
CREATE POLICY "Admins can manage providers from their domain" ON public.ai_providers
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 4. POLÍTICAS PARA AI_PROVIDER_KEYS
-- ========================================

-- Usuários podem ver chaves ativas do seu domínio
CREATE POLICY "Users can view active keys from their domain" ON public.ai_provider_keys
    FOR SELECT USING (
        domain_id = get_user_domain_id()
        AND active = true
    );

-- Admins podem gerenciar chaves do seu domínio
CREATE POLICY "Admins can manage keys from their domain" ON public.ai_provider_keys
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 5. POLÍTICAS PARA AI_ASSISTANTS
-- ========================================

-- Usuários podem ver assistentes ativos do seu domínio
CREATE POLICY "Users can view active assistants from their domain" ON public.ai_assistants
    FOR SELECT USING (
        domain_id = get_user_domain_id()
        AND active = true
    );

-- Admins podem gerenciar assistentes do seu domínio
CREATE POLICY "Admins can manage assistants from their domain" ON public.ai_assistants
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 6. POLÍTICAS PARA AI_KNOWLEDGE_SOURCES
-- ========================================

-- Usuários podem ver fontes de conhecimento do seu domínio
CREATE POLICY "Users can view knowledge sources from their domain" ON public.ai_knowledge_sources
    FOR SELECT USING (
        domain_id = get_user_domain_id()
    );

-- Admins podem gerenciar fontes de conhecimento do seu domínio
CREATE POLICY "Admins can manage knowledge sources from their domain" ON public.ai_knowledge_sources
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 7. POLÍTICAS PARA AI_CHUNKS
-- ========================================

-- Usuários podem ver chunks das fontes do seu domínio
CREATE POLICY "Users can view chunks from their domain" ON public.ai_chunks
    FOR SELECT USING (
        source_id IN (
            SELECT id FROM public.ai_knowledge_sources
            WHERE domain_id = get_user_domain_id()
        )
    );

-- Admins podem gerenciar chunks do seu domínio
CREATE POLICY "Admins can manage chunks from their domain" ON public.ai_chunks
    FOR ALL USING (
        source_id IN (
            SELECT id FROM public.ai_knowledge_sources
            WHERE domain_id = get_user_domain_id()
            AND is_domain_admin(domain_id)
        )
    );

-- ========================================
-- 8. POLÍTICAS PARA AI_CHAT_SESSIONS
-- ========================================

-- Usuários podem ver suas próprias sessões de chat
CREATE POLICY "Users can view their own chat sessions" ON public.ai_chat_sessions
    FOR SELECT USING (
        user_id = auth.uid()
        AND domain_id = get_user_domain_id()
    );

-- Usuários podem criar suas próprias sessões de chat
CREATE POLICY "Users can create their own chat sessions" ON public.ai_chat_sessions
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND domain_id = get_user_domain_id()
    );

-- Usuários podem atualizar suas próprias sessões de chat
CREATE POLICY "Users can update their own chat sessions" ON public.ai_chat_sessions
    FOR UPDATE USING (
        user_id = auth.uid()
        AND domain_id = get_user_domain_id()
    );

-- Admins podem ver todas as sessões do seu domínio
CREATE POLICY "Admins can view all chat sessions from their domain" ON public.ai_chat_sessions
    FOR SELECT USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 9. POLÍTICAS PARA AI_MESSAGES
-- ========================================

-- Usuários podem ver mensagens de suas próprias sessões
CREATE POLICY "Users can view messages from their sessions" ON public.ai_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.ai_chat_sessions
            WHERE user_id = auth.uid()
            AND domain_id = get_user_domain_id()
        )
    );

-- Usuários podem inserir mensagens em suas próprias sessões
CREATE POLICY "Users can insert messages in their sessions" ON public.ai_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM public.ai_chat_sessions
            WHERE user_id = auth.uid()
            AND domain_id = get_user_domain_id()
        )
    );

-- Admins podem ver todas as mensagens do seu domínio
CREATE POLICY "Admins can view all messages from their domain" ON public.ai_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.ai_chat_sessions
            WHERE domain_id = get_user_domain_id()
            AND is_domain_admin(domain_id)
        )
    );

-- ========================================
-- 10. POLÍTICAS PARA AI_USAGE_LIMITS
-- ========================================

-- Usuários podem ver limites de uso do seu domínio
CREATE POLICY "Users can view usage limits from their domain" ON public.ai_usage_limits
    FOR SELECT USING (
        domain_id = get_user_domain_id()
        AND active = true
    );

-- Admins podem gerenciar limites de uso do seu domínio
CREATE POLICY "Admins can manage usage limits from their domain" ON public.ai_usage_limits
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 11. POLÍTICAS PARA AI_SECURITY_SETTINGS
-- ========================================

-- Usuários podem ver configurações de segurança do seu domínio
CREATE POLICY "Users can view security settings from their domain" ON public.ai_security_settings
    FOR SELECT USING (
        domain_id = get_user_domain_id()
    );

-- Admins podem gerenciar configurações de segurança do seu domínio
CREATE POLICY "Admins can manage security settings from their domain" ON public.ai_security_settings
    FOR ALL USING (
        domain_id = get_user_domain_id()
        AND is_domain_admin(domain_id)
    );

-- ========================================
-- 12. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    '✅ RLS POLICIES AI MODULE COMPLETED' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_%';
