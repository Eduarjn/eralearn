-- =====================================================
-- SISTEMA DE SUPORTE COM IA - TABELAS E CONFIGURAÇÕES
-- =====================================================

-- 1. Tabela para controle de uso de tokens por usuário
CREATE TABLE IF NOT EXISTS ai_token_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_used INTEGER DEFAULT 0,
    tokens_limit INTEGER DEFAULT 10000,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para histórico de chat com IA
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
    tokens_used INTEGER DEFAULT 0,
    course_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para configurações da IA
CREATE TABLE IF NOT EXISTS ai_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela para base de conhecimento (FAQ)
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para ai_token_usage
CREATE INDEX IF NOT EXISTS idx_ai_token_usage_user_id ON ai_token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_token_usage_tokens_used ON ai_token_usage(tokens_used DESC);

-- Índices para ai_chat_history
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_course_id ON ai_chat_history(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_sender ON ai_chat_history(sender);

-- Índices para ai_knowledge_base
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_is_active ON ai_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_tags ON ai_knowledge_base USING GIN(tags);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE ai_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_token_usage
CREATE POLICY "Usuários podem ver seus próprios tokens" ON ai_token_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os tokens" ON ai_token_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem atualizar seus próprios tokens" ON ai_token_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir tokens" ON ai_token_usage
    FOR INSERT WITH CHECK (true);

-- Políticas para ai_chat_history
CREATE POLICY "Usuários podem ver seu próprio histórico" ON ai_chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todo o histórico" ON ai_chat_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem inserir suas mensagens" ON ai_chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para ai_config
CREATE POLICY "Apenas admins podem gerenciar configurações" ON ai_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- Políticas para ai_knowledge_base
CREATE POLICY "Todos podem ver base de conhecimento ativa" ON ai_knowledge_base
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins podem gerenciar base de conhecimento" ON ai_knowledge_base
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para criar registro de tokens automaticamente
CREATE OR REPLACE FUNCTION create_user_token_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_token_usage (user_id, tokens_used, tokens_limit)
    VALUES (NEW.id, 0, 10000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar registro de tokens quando usuário é criado
CREATE TRIGGER trigger_create_user_token_usage
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_token_usage();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER trigger_update_ai_token_usage_updated_at
    BEFORE UPDATE ON ai_token_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ai_config_updated_at
    BEFORE UPDATE ON ai_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ai_knowledge_base_updated_at
    BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão da IA
INSERT INTO ai_config (config_key, config_value, description) VALUES
('ai_model', 'gpt-3.5-turbo', 'Modelo de IA utilizado'),
('max_tokens_per_response', '1000', 'Máximo de tokens por resposta'),
('temperature', '0.7', 'Temperatura da IA (criatividade)'),
('default_token_limit', '10000', 'Limite padrão de tokens por usuário'),
('system_prompt', 'Você é um assistente especializado em suporte técnico para a plataforma ERA Learn. Responda de forma clara e objetiva.', 'Prompt do sistema para a IA')
ON CONFLICT (config_key) DO NOTHING;

-- Inserir base de conhecimento inicial
INSERT INTO ai_knowledge_base (title, content, category, tags, created_by) VALUES
('Como acessar os cursos?', 'Para acessar os cursos, faça login na plataforma e navegue até a seção "Cursos". Você verá todos os cursos disponíveis para seu perfil.', 'Acesso', ARRAY['cursos', 'acesso', 'login'], NULL),
('Como fazer upload de vídeos?', 'Apenas administradores podem fazer upload de vídeos. Acesse o curso desejado e clique no botão "Adicionar Vídeo". Formatos aceitos: MP4, MOV, AVI.', 'Vídeos', ARRAY['upload', 'vídeos', 'admin'], NULL),
('Como configurar quizzes?', 'Os quizzes podem ser configurados na seção de configurações do curso. Você pode adicionar perguntas, respostas e definir pontuação.', 'Quizzes', ARRAY['quiz', 'configuração', 'perguntas'], NULL),
('Como gerar certificados?', 'Os certificados são gerados automaticamente quando o usuário completa um curso. Eles podem ser baixados na seção "Certificados".', 'Certificados', ARRAY['certificado', 'conclusão', 'download'], NULL),
('Problemas de login', 'Se você está tendo problemas para fazer login, verifique se o email e senha estão corretos. Se o problema persistir, entre em contato com o suporte.', 'Suporte', ARRAY['login', 'problemas', 'senha'], NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas de uso de tokens
CREATE OR REPLACE VIEW ai_token_stats AS
SELECT 
    u.email,
    up.nome,
    up.tipo_usuario,
    atu.tokens_used,
    atu.tokens_limit,
    ROUND((atu.tokens_used::DECIMAL / atu.tokens_limit) * 100, 2) as usage_percentage,
    atu.last_reset,
    atu.updated_at
FROM ai_token_usage atu
JOIN auth.users u ON atu.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY atu.tokens_used DESC;

-- View para histórico de chat com informações do usuário
CREATE OR REPLACE VIEW ai_chat_history_with_user AS
SELECT 
    ach.id,
    u.email as user_email,
    up.nome as user_name,
    ach.content,
    ach.sender,
    ach.tokens_used,
    c.nome as course_name,
    ach.created_at
FROM ai_chat_history ach
JOIN auth.users u ON ach.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN cursos c ON ach.course_id = c.id
ORDER BY ach.created_at DESC;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE ai_token_usage IS 'Controle de uso de tokens de IA por usuário';
COMMENT ON TABLE ai_chat_history IS 'Histórico de conversas com a IA';
COMMENT ON TABLE ai_config IS 'Configurações do sistema de IA';
COMMENT ON TABLE ai_knowledge_base IS 'Base de conhecimento para a IA';

COMMENT ON COLUMN ai_token_usage.tokens_used IS 'Total de tokens utilizados pelo usuário';
COMMENT ON COLUMN ai_token_usage.tokens_limit IS 'Limite de tokens permitido para o usuário';
COMMENT ON COLUMN ai_token_usage.last_reset IS 'Data do último reset dos tokens';

COMMENT ON COLUMN ai_chat_history.sender IS 'Remetente da mensagem: user, ai, system';
COMMENT ON COLUMN ai_chat_history.tokens_used IS 'Tokens utilizados na mensagem';
COMMENT ON COLUMN ai_chat_history.course_id IS 'ID do curso relacionado à conversa';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%'
ORDER BY table_name;








































