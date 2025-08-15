-- Create ENUM types
CREATE TYPE user_type AS ENUM ('admin', 'cliente');
CREATE TYPE status_type AS ENUM ('ativo', 'inativo', 'suspenso');
CREATE TYPE course_status AS ENUM ('ativo', 'inativo', 'rascunho');
CREATE TYPE progress_status AS ENUM ('nao_iniciado', 'em_andamento', 'concluido');

-- Create usuarios table
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    nome VARCHAR NOT NULL,
    senha_hashed VARCHAR NOT NULL,
    tipo_usuario user_type NOT NULL DEFAULT 'cliente',
    status status_type NOT NULL DEFAULT 'ativo',
    matricula VARCHAR,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categorias table
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    descricao TEXT,
    cor VARCHAR DEFAULT '#3B82F6',
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    url_video TEXT,
    thumbnail_url TEXT,
    duracao INTEGER,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create cursos table
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    descricao TEXT,
    categoria VARCHAR NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    imagem_url TEXT,
    video_id UUID REFERENCES videos(id),
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    status course_status NOT NULL DEFAULT 'ativo',
    ordem INTEGER DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create modulos table
CREATE TABLE modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES cursos(id),
    nome_modulo VARCHAR NOT NULL,
    descricao TEXT,
    link_video TEXT,
    video_id UUID REFERENCES videos(id),
    duracao INTEGER,
    ordem INTEGER DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create progresso_usuario table
CREATE TABLE progresso_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    curso_id UUID NOT NULL REFERENCES cursos(id),
    modulo_id UUID REFERENCES modulos(id),
    status progress_status NOT NULL DEFAULT 'nao_iniciado',
    percentual_concluido NUMERIC DEFAULT 0.00,
    tempo_total_assistido INTEGER DEFAULT 0,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create certificados table
CREATE TABLE certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    curso_id UUID NOT NULL REFERENCES cursos(id),
    numero_certificado VARCHAR,
    nota_final NUMERIC,
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    link_pdf_certificado TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create avaliacoes table
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    curso_id UUID NOT NULL REFERENCES cursos(id),
    nota INTEGER,
    comentario TEXT,
    data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create profiles table for compatibility
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, created_at)
    VALUES (NEW.id, NEW.email, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some sample data
INSERT INTO categorias (nome, descricao, cor) VALUES
('PABX', 'Treinamentos sobre sistemas PABX', '#3B82F6'),
('Omnichannel', 'Treinamentos sobre soluções omnichannel', '#84CC16'),
('Telefonia', 'Conceitos básicos de telefonia', '#EF4444');

INSERT INTO cursos (nome, descricao, categoria) VALUES
('Fundamentos do PABX', 'Aprenda os conceitos fundamentais dos sistemas PABX', 'PABX'),
('Configuração Avançada PABX', 'Configurações avançadas e troubleshooting', 'PABX'),
('Introdução ao Omnichannel', 'Conceitos e implementação de soluções omnichannel', 'Omnichannel'),
('Telefonia IP', 'Fundamentos da telefonia sobre IP', 'Telefonia');

-- Seed de demonstração para relatório visual
-- Usuário Bianca
INSERT INTO categorias (nome, descricao, cor)
VALUES ('Avançado', 'Cursos avançados', '#6366F1')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuarios (nome, email, senha_hashed, tipo_usuario, status, matricula)
VALUES ('Bianca', 'biancacc2008@gmail.com', 'demopass', 'cliente', 'ativo', 'biancacc2008@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO cursos (nome, descricao, categoria, status)
VALUES ('OMNICHANNEL para Empresas', 'Implementação de soluções omnichannel em ambientes empresariais', 'Avançado', 'ativo')
ON CONFLICT (nome) DO NOTHING;

-- Vincular IDs para progresso_usuario
WITH u AS (
  SELECT id as usuario_id FROM usuarios WHERE email = 'biancacc2008@gmail.com'
),
 c AS (
  SELECT id as curso_id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas'
)
INSERT INTO progresso_usuario (usuario_id, curso_id, status, percentual_concluido, data_inicio, data_conclusao)
SELECT u.usuario_id, c.curso_id, 'concluido', 100, '2025-06-01', '2025-06-15'
FROM u, c
ON CONFLICT DO NOTHING;
