-- Script de inicialização do banco local ERA Learn
-- Este script cria todas as tabelas e dados necessários

-- Criar role anon se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END
$$;

-- Garantir permissões
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'aluno',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url_video TEXT NOT NULL,
    curso_id UUID REFERENCES cursos(id),
    provedor VARCHAR(50) DEFAULT 'local',
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso de vídeos
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    video_id UUID REFERENCES videos(id),
    progresso DECIMAL(5,2) DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, video_id)
);

-- Tabela de configuração de branding
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT DEFAULT '/logotipoeralearn.png',
    sub_logo_url TEXT DEFAULT '/era-sub-logo.png',
    favicon_url TEXT DEFAULT '/favicon.ico',
    background_url TEXT DEFAULT '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    primary_color TEXT DEFAULT '#CCFF00',
    secondary_color TEXT DEFAULT '#232323',
    company_name TEXT DEFAULT 'ERA Learn',
    company_slogan TEXT DEFAULT 'Smart Training',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados padrão
INSERT INTO branding_config (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Inserir usuário admin padrão
INSERT INTO usuarios (id, email, nome, tipo_usuario) 
VALUES (gen_random_uuid(), 'admin@eralearn.com', 'Administrador', 'admin') 
ON CONFLICT (email) DO NOTHING;

-- Inserir curso de exemplo
INSERT INTO cursos (id, titulo, descricao) 
VALUES (gen_random_uuid(), 'Curso de Exemplo', 'Curso demonstrativo do ERA Learn') 
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cursos_updated_at ON cursos;
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_videos_updated_at_column();

DROP TRIGGER IF EXISTS update_video_progress_updated_at ON video_progress;
CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON video_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_config_updated_at ON branding_config;
CREATE TRIGGER update_branding_config_updated_at BEFORE UPDATE ON branding_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funções RPC para branding
CREATE OR REPLACE FUNCTION get_branding_config()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(t) INTO result
    FROM (
        SELECT * FROM branding_config LIMIT 1
    ) t;
    
    IF result IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Nenhuma configuração encontrada');
    END IF;
    
    RETURN json_build_object('success', true, 'data', result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_branding_config(
    p_logo_url TEXT DEFAULT NULL,
    p_sub_logo_url TEXT DEFAULT NULL,
    p_favicon_url TEXT DEFAULT NULL,
    p_background_url TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_company_name TEXT DEFAULT NULL,
    p_company_slogan TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    UPDATE branding_config SET
        logo_url = COALESCE(p_logo_url, logo_url),
        sub_logo_url = COALESCE(p_sub_logo_url, sub_logo_url),
        favicon_url = COALESCE(p_favicon_url, favicon_url),
        background_url = COALESCE(p_background_url, background_url),
        primary_color = COALESCE(p_primary_color, primary_color),
        secondary_color = COALESCE(p_secondary_color, secondary_color),
        company_name = COALESCE(p_company_name, company_name),
        company_slogan = COALESCE(p_company_slogan, company_slogan),
        updated_at = NOW();
    
    RETURN json_build_object('success', true, 'message', 'Configuração atualizada com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissões nas funções
GRANT EXECUTE ON FUNCTION get_branding_config() TO anon;
GRANT EXECUTE ON FUNCTION update_branding_config(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;






























