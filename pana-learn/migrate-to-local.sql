-- Script para migrar dados do Supabase para ambiente local
-- Execute este script no PostgreSQL local

-- ========================================
-- 1. CRIAR TABELAS PRINCIPAIS
-- ========================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    tipo_usuario TEXT DEFAULT 'usuario',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    url_video TEXT NOT NULL,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    provedor TEXT DEFAULT 'local',
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso de vídeos
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    progresso FLOAT DEFAULT 0,
    concluido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, video_id)
);

-- Tabela de branding
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT DEFAULT '/media/branding/logo.png',
    sub_logo_url TEXT DEFAULT '/media/branding/sub-logo.png',
    favicon_url TEXT DEFAULT '/media/branding/favicon.ico',
    background_url TEXT DEFAULT '/media/branding/background.jpg',
    primary_color TEXT DEFAULT '#CCFF00',
    secondary_color TEXT DEFAULT '#232323',
    company_name TEXT DEFAULT 'ERA Learn',
    company_slogan TEXT DEFAULT 'Smart Training',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. INSERIR DADOS PADRÃO
-- ========================================

-- Usuário admin padrão
INSERT INTO usuarios (email, nome, tipo_usuario) VALUES 
('admin@eralearn.com', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configuração de branding padrão
INSERT INTO branding_config (
    logo_url,
    sub_logo_url,
    favicon_url,
    background_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan
) VALUES (
    '/media/branding/logo.png',
    '/media/branding/sub-logo.png',
    '/media/branding/favicon.ico',
    '/media/branding/background.jpg',
    '#CCFF00',
    '#232323',
    'ERA Learn',
    'Smart Training'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 3. CRIAR FUNÇÕES SQL
-- ========================================

-- Função para obter branding
CREATE OR REPLACE FUNCTION get_branding_config() RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'success', true,
        'data', row_to_json(bc)
    ) INTO result
    FROM branding_config bc
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao obter configurações: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar branding
CREATE OR REPLACE FUNCTION update_branding_config(
    p_logo_url TEXT DEFAULT NULL,
    p_sub_logo_url TEXT DEFAULT NULL,
    p_favicon_url TEXT DEFAULT NULL,
    p_background_url TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_company_name TEXT DEFAULT NULL,
    p_company_slogan TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE branding_config 
    SET 
        logo_url = COALESCE(p_logo_url, logo_url),
        sub_logo_url = COALESCE(p_sub_logo_url, sub_logo_url),
        favicon_url = COALESCE(p_favicon_url, favicon_url),
        background_url = COALESCE(p_background_url, background_url),
        primary_color = COALESCE(p_primary_color, primary_color),
        secondary_color = COALESCE(p_secondary_color, secondary_color),
        company_name = COALESCE(p_company_name, company_name),
        company_slogan = COALESCE(p_company_slogan, company_slogan),
        updated_at = NOW()
    WHERE id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);
    
    SELECT json_build_object(
        'success', true,
        'message', 'Configurações atualizadas com sucesso',
        'data', row_to_json(bc)
    ) INTO result
    FROM branding_config bc
    WHERE bc.id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao atualizar configurações: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_videos_curso_id ON videos(curso_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_usuario_video ON video_progress(usuario_id, video_id);
CREATE INDEX IF NOT EXISTS idx_branding_config_created_at ON branding_config(created_at);

-- ========================================
-- 5. VERIFICAR MIGRAÇÃO
-- ========================================

SELECT '=== VERIFICAÇÃO DA MIGRAÇÃO ===' as info;

SELECT 
    'Usuários' as tabela,
    COUNT(*) as total
FROM usuarios;

SELECT 
    'Cursos' as tabela,
    COUNT(*) as total
FROM cursos;

SELECT 
    'Vídeos' as tabela,
    COUNT(*) as total
FROM videos;

SELECT 
    'Branding' as tabela,
    COUNT(*) as total
FROM branding_config;

-- Testar função de branding
SELECT get_branding_config() as resultado_branding;
























