-- ========================================
-- MIGRATION: Módulo de IA - Tabelas
-- ========================================
-- Data: 2025-01-01
-- Descrição: Criação das tabelas para o módulo de IA
-- Prefixo: ai_ (não interfere com tabelas existentes)
-- Feature Flag: FEATURE_AI=true

-- ========================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ========================================

-- Habilitar pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Habilitar pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================
-- 2. TABELA: AI_PROVIDERS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'azure', 'openrouter')),
  api_base TEXT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_id, provider),
  CONSTRAINT valid_api_base CHECK (
    (provider = 'openai' AND api_base IS NULL) OR
    (provider = 'azure' AND api_base IS NOT NULL) OR
    (provider = 'openrouter' AND api_base IS NULL)
  )
);

-- ========================================
-- 3. TABELA: AI_PROVIDER_KEYS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_provider_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  owner_scope VARCHAR(20) NOT NULL CHECK (owner_scope IN ('platform', 'tenant')),
  key_ciphertext TEXT NOT NULL, -- Chave criptografada
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_id, provider_id, owner_scope)
);

-- ========================================
-- 4. TABELA: AI_ASSISTANTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_assistants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  system_prompt TEXT NOT NULL,
  default_model VARCHAR(100) NOT NULL,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER NOT NULL DEFAULT 1000 CHECK (max_tokens > 0 AND max_tokens <= 4000),
  tools JSONB DEFAULT '[]'::jsonb, -- Array de ferramentas habilitadas
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_id, name)
);

-- ========================================
-- 5. TABELA: AI_KNOWLEDGE_SOURCES
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_knowledge_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('url', 'text')),
  content TEXT, -- Para tipo 'text'
  url TEXT, -- Para tipo 'url'
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'indexing', 'ok', 'error')),
  metadata JSONB DEFAULT '{}'::jsonb, -- Configurações de chunk, idioma, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 6. TABELA: AI_CHUNKS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.ai_knowledge_sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- Embedding do conteúdo
  metadata JSONB DEFAULT '{}'::jsonb, -- Metadados do chunk
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 7. TABELA: AI_CHAT_SESSIONS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 8. TABELA: AI_MESSAGES
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  sources JSONB DEFAULT '[]'::jsonb, -- Fontes citadas do RAG
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 9. TABELA: AI_USAGE_LIMITS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_usage_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  limit_type VARCHAR(50) NOT NULL CHECK (limit_type IN ('requests_per_minute', 'tokens_per_day', 'cost_per_day')),
  limit_value DECIMAL(15,2) NOT NULL,
  scope VARCHAR(20) NOT NULL DEFAULT 'domain' CHECK (scope IN ('domain', 'user')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_id, limit_type, scope)
);

-- ========================================
-- 10. TABELA: AI_SECURITY_SETTINGS
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  requests_per_minute INTEGER DEFAULT 10,
  tokens_per_day INTEGER DEFAULT 10000,
  max_tokens_per_request INTEGER DEFAULT 2000,
  mask_pii BOOLEAN DEFAULT true,
  block_terms BOOLEAN DEFAULT true,
  blocked_terms TEXT, -- Lista de termos bloqueados (um por linha)
  escalate_to_human BOOLEAN DEFAULT false,
  escalation_threshold INTEGER DEFAULT 3,
  escalation_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(domain_id)
);

-- ========================================
-- 11. ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para ai_providers
CREATE INDEX IF NOT EXISTS idx_ai_providers_domain_id ON public.ai_providers(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON public.ai_providers(active);

-- Índices para ai_provider_keys
CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_domain_id ON public.ai_provider_keys(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_provider_id ON public.ai_provider_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_active ON public.ai_provider_keys(active);

-- Índices para ai_assistants
CREATE INDEX IF NOT EXISTS idx_ai_assistants_domain_id ON public.ai_assistants(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_active ON public.ai_assistants(active);

-- Índices para ai_knowledge_sources
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_domain_id ON public.ai_knowledge_sources(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_assistant_id ON public.ai_knowledge_sources(assistant_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_status ON public.ai_knowledge_sources(status);

-- Índices para ai_chunks
CREATE INDEX IF NOT EXISTS idx_ai_chunks_source_id ON public.ai_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_chunks_embedding ON public.ai_chunks USING ivfflat (embedding vector_cosine_ops);

-- Índices para ai_chat_sessions
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_domain_id ON public.ai_chat_sessions(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_assistant_id ON public.ai_chat_sessions(assistant_id);

-- Índices para ai_messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON public.ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);

-- Índices para ai_usage_limits
CREATE INDEX IF NOT EXISTS idx_ai_usage_limits_domain_id ON public.ai_usage_limits(domain_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_limits_active ON public.ai_usage_limits(active);

-- ========================================
-- 12. TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas com updated_at
CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_provider_keys_updated_at BEFORE UPDATE ON public.ai_provider_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_assistants_updated_at BEFORE UPDATE ON public.ai_assistants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_knowledge_sources_updated_at BEFORE UPDATE ON public.ai_knowledge_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_chat_sessions_updated_at BEFORE UPDATE ON public.ai_chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_usage_limits_updated_at BEFORE UPDATE ON public.ai_usage_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_security_settings_updated_at BEFORE UPDATE ON public.ai_security_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 13. DADOS INICIAIS
-- ========================================

-- Inserir configurações padrão de segurança para domínios existentes
INSERT INTO public.ai_security_settings (domain_id, mask_pii, escalate_to_human)
SELECT id, true, false
FROM public.domains
WHERE id NOT IN (SELECT domain_id FROM public.ai_security_settings)
ON CONFLICT (domain_id) DO NOTHING;

-- ========================================
-- 14. COMENTÁRIOS DAS TABELAS
-- ========================================

COMMENT ON TABLE public.ai_providers IS 'Provedores de IA configurados por domínio';
COMMENT ON TABLE public.ai_provider_keys IS 'Chaves de API dos provedores (criptografadas)';
COMMENT ON TABLE public.ai_assistants IS 'Assistentes de IA configurados';
COMMENT ON TABLE public.ai_knowledge_sources IS 'Fontes de conhecimento para RAG';
COMMENT ON TABLE public.ai_chunks IS 'Chunks de texto com embeddings para busca semântica';
COMMENT ON TABLE public.ai_chat_sessions IS 'Sessões de chat com assistentes';
COMMENT ON TABLE public.ai_messages IS 'Mensagens das sessões de chat';
COMMENT ON TABLE public.ai_usage_limits IS 'Limites de uso por domínio/usuário';
COMMENT ON TABLE public.ai_security_settings IS 'Configurações de segurança para IA';

-- ========================================
-- 15. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    '✅ MIGRATION AI MODULE COMPLETED' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%';
