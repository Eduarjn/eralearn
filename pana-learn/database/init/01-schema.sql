-- ========================================
-- ERA LEARN - SCHEMA COMPLETO LOCAL
-- ========================================
-- Criação do schema completo da plataforma
-- Baseado nas migrations do Supabase

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- TABELA: usuarios
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('admin', 'cliente', 'admin_master')),
    senha_hash VARCHAR(255) NOT NULL,
    domain_id UUID,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: domains
-- ========================================
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    subdominio VARCHAR(100) UNIQUE NOT NULL,
    configuracoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: cursos
-- ========================================
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    thumbnail_url VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    domain_id UUID REFERENCES domains(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: modulos
-- ========================================
CREATE TABLE IF NOT EXISTS modulos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    nome_modulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: videos
-- ========================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duracao INTEGER DEFAULT 0,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    provider VARCHAR(50) DEFAULT 'local',
    video_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: video_progress
-- ========================================
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    tempo_assistido INTEGER DEFAULT 0,
    tempo_total INTEGER DEFAULT 0,
    percentual_assistido DECIMAL(5,2) DEFAULT 0,
    concluido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, video_id)
);

-- ========================================
-- TABELA: quizzes
-- ========================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    nota_minima DECIMAL(5,2) DEFAULT 70.00,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: quiz_perguntas
-- ========================================
CREATE TABLE IF NOT EXISTS quiz_perguntas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL,
    resposta_correta VARCHAR(10) NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: progresso_quiz
-- ========================================
CREATE TABLE IF NOT EXISTS progresso_quiz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    respostas JSONB,
    nota DECIMAL(5,2),
    aprovado BOOLEAN DEFAULT false,
    concluido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, quiz_id)
);

-- ========================================
-- TABELA: certificados
-- ========================================
CREATE TABLE IF NOT EXISTS certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    numero_certificado VARCHAR(100) UNIQUE NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    nota_final DECIMAL(5,2),
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_expiracao TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado')),
    url_certificado VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: branding_config
-- ========================================
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES domains(id),
    logo_url VARCHAR(500),
    sub_logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    background_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#A3E635',
    secondary_color VARCHAR(7) DEFAULT '#1E293B',
    company_name VARCHAR(255) DEFAULT 'ERA Learn',
    company_slogan VARCHAR(255) DEFAULT 'Smart Training Platform',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: sessoes (para autenticação local)
-- ========================================
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: uploads (para gestão de arquivos)
-- ========================================
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) UNIQUE NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanho BIGINT,
    categoria VARCHAR(50) DEFAULT 'outros',
    usuario_id UUID REFERENCES usuarios(id),
    publico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_domain_id ON usuarios(domain_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);

CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_domain_id ON cursos(domain_id);
CREATE INDEX IF NOT EXISTS idx_cursos_ativo ON cursos(ativo);

CREATE INDEX IF NOT EXISTS idx_videos_curso_id ON videos(curso_id);
CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON videos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_videos_ordem ON videos(ordem);

CREATE INDEX IF NOT EXISTS idx_video_progress_usuario ON video_progress(usuario_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso ON video_progress(curso_id);

CREATE INDEX IF NOT EXISTS idx_quiz_perguntas_quiz_id ON quiz_perguntas(quiz_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario ON progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario ON certificados(usuario_id);

CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_expires ON sessoes(expires_at);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON modulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON video_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progresso_quiz_updated_at BEFORE UPDATE ON progresso_quiz FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificados_updated_at BEFORE UPDATE ON certificados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_updated_at BEFORE UPDATE ON branding_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





























