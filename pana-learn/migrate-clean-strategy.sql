-- Script de migração LIMPA - Sem duplicação de dados
-- Execute este script para migrar do Supabase para local

-- ========================================
-- 1. LIMPAR AMBIENTE LOCAL (se existir)
-- ========================================

SELECT '=== LIMPANDO AMBIENTE LOCAL ===' as info;

-- Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS video_progress CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS branding_config CASCADE;

-- Remover funções existentes
DROP FUNCTION IF EXISTS get_branding_config();
DROP FUNCTION IF EXISTS update_branding_config();

-- ========================================
-- 2. CRIAR ESTRUTURA LIMPA
-- ========================================

SELECT '=== CRIANDO ESTRUTURA LIMPA ===' as info;

-- Tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    tipo_usuario TEXT DEFAULT 'usuario',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vídeos
CREATE TABLE videos (
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
CREATE TABLE video_progress (
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
CREATE TABLE branding_config (
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
-- 3. INSERIR DADOS PADRÃO (ÚNICOS)
-- ========================================

SELECT '=== INSERINDO DADOS PADRÃO ===' as info;

-- Usuário admin padrão (único)
INSERT INTO usuarios (email, nome, tipo_usuario) VALUES 
('admin@eralearn.com', 'Administrador', 'admin');

-- Configuração de branding padrão (única)
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
);

-- ========================================
-- 4. CRIAR FUNÇÕES SQL
-- ========================================

SELECT '=== CRIANDO FUNÇÕES SQL ===' as info;

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
-- 5. CRIAR ÍNDICES
-- ========================================

SELECT '=== CRIANDO ÍNDICES ===' as info;

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_videos_curso_id ON videos(curso_id);
CREATE INDEX idx_video_progress_usuario_video ON video_progress(usuario_id, video_id);
CREATE INDEX idx_branding_config_created_at ON branding_config(created_at);

-- ========================================
-- 6. VERIFICAR MIGRAÇÃO LIMPA
-- ========================================

SELECT '=== VERIFICAÇÃO DA MIGRAÇÃO LIMPA ===' as info;

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

-- ========================================
-- 7. CONFIRMAR AMBIENTE LIMPO
-- ========================================

SELECT '=== AMBIENTE LOCAL LIMPO E PRONTO ===' as info;
SELECT '✅ Migração limpa concluída - Sem duplicação de dados' as status;






























