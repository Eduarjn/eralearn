-- Script para corrigir estrutura da tabela video_progress e resolver problemas de flickering
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela video_progress
SELECT '=== ESTRUTURA ATUAL TABELA VIDEO_PROGRESS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    progresso FLOAT DEFAULT 0,
    concluido BOOLEAN DEFAULT FALSE,
    tempo_assistido INTEGER DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- 3. Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
    -- Adicionar coluna user_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'user_id') THEN
        ALTER TABLE video_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar coluna curso_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'curso_id') THEN
        ALTER TABLE video_progress ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar coluna concluido se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'concluido') THEN
        ALTER TABLE video_progress ADD COLUMN concluido BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Adicionar coluna progresso se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'progresso') THEN
        ALTER TABLE video_progress ADD COLUMN progresso FLOAT DEFAULT 0;
    END IF;
    
    -- Adicionar coluna tempo_assistido se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'tempo_assistido') THEN
        ALTER TABLE video_progress ADD COLUMN tempo_assistido INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso_id ON video_progress(curso_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_video ON video_progress(user_id, video_id);

-- 5. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL TABELA VIDEO_PROGRESS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 6. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT video_id) as videos_unicos,
    COUNT(DISTINCT curso_id) as cursos_unicos
FROM video_progress;

-- 7. Verificar vídeos sem progresso
SELECT '=== VÍDEOS SEM PROGRESSO ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.curso_id,
    c.nome as nome_curso
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN video_progress vp ON v.id = vp.video_id
WHERE vp.video_id IS NULL
LIMIT 10;

-- 8. Criar RLS policies se não existirem
DO $$
BEGIN
    -- Policy para usuários verem apenas seu próprio progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Users can view own progress') THEN
        CREATE POLICY "Users can view own progress" ON video_progress
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Policy para usuários inserirem seu próprio progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Users can insert own progress') THEN
        CREATE POLICY "Users can insert own progress" ON video_progress
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Policy para usuários atualizarem seu próprio progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Users can update own progress') THEN
        CREATE POLICY "Users can update own progress" ON video_progress
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Policy para admins verem todo progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Admins can view all progress') THEN
        CREATE POLICY "Admins can view all progress" ON video_progress
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario = 'admin'
                )
            );
    END IF;
END $$;

-- 9. Habilitar RLS na tabela
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- 10. Verificar policies criadas
SELECT '=== POLICIES CRIADAS ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'video_progress';

-- 11. Testar consulta de progresso
SELECT '=== TESTE CONSULTA PROGRESSO ===' as info;
SELECT 
    vp.user_id,
    vp.video_id,
    vp.progresso,
    vp.concluido,
    v.titulo as video_titulo
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
LIMIT 5; 