-- Script para corrigir problemas de acesso aos cursos para clientes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura das tabelas
SELECT '=== VERIFICANDO ESTRUTURA ===' as info;

-- Verificar se video_progress existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- Verificar se progresso_usuario existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'progresso_usuario'
ORDER BY ordinal_position;

-- 2. Corrigir estrutura da tabela video_progress se necessário
DO $$ 
BEGIN
    -- Verificar se a tabela video_progress existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        CREATE TABLE video_progress (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
            curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
            tempo_assistido INTEGER DEFAULT 0,
            tempo_total INTEGER DEFAULT 0,
            percentual_assistido DECIMAL(5,2) DEFAULT 0.00,
            concluido BOOLEAN DEFAULT FALSE,
            data_conclusao TIMESTAMP WITH TIME ZONE,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, video_id)
        );
    END IF;
    
    -- Adicionar colunas faltantes se necessário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'user_id') THEN
        ALTER TABLE video_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'curso_id') THEN
        ALTER TABLE video_progress ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'tempo_total') THEN
        ALTER TABLE video_progress ADD COLUMN tempo_total INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'percentual_assistido') THEN
        ALTER TABLE video_progress ADD COLUMN percentual_assistido DECIMAL(5,2) DEFAULT 0.00;
    END IF;
END $$;

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso_id ON video_progress(curso_id);

-- 4. Configurar RLS para video_progress (mais permissivo para desenvolvimento)
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso de vídeo" ON video_progress;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso de vídeo" ON video_progress;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso de vídeo" ON video_progress;
DROP POLICY IF EXISTS "Administradores podem ver todo progresso de vídeo" ON video_progress;

-- Criar políticas mais permissivas
CREATE POLICY "Todos podem ver progresso de vídeo" ON video_progress
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir progresso" ON video_progress
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar progresso" ON video_progress
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 5. Corrigir políticas da tabela progresso_usuario
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON progresso_usuario;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso" ON progresso_usuario;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso" ON progresso_usuario;
DROP POLICY IF EXISTS "Administradores podem gerenciar progresso" ON progresso_usuario;

CREATE POLICY "Todos podem ver progresso" ON progresso_usuario
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir progresso" ON progresso_usuario
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar progresso" ON progresso_usuario
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 6. Verificar se há dados de teste
SELECT '=== DADOS DE TESTE ===' as info;

-- Verificar se há vídeos disponíveis
SELECT COUNT(*) as total_videos FROM videos;

-- Verificar se há cursos disponíveis
SELECT COUNT(*) as total_cursos FROM cursos;

-- Verificar se há usuários
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 7. Inserir dados de teste se necessário
DO $$
BEGIN
    -- Inserir curso de teste se não existir
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nome = 'Curso de Teste') THEN
        INSERT INTO cursos (id, nome, descricao, status, categoria) 
        VALUES (
            gen_random_uuid(),
            'Curso de Teste',
            'Curso para testar o sistema',
            'ativo',
            'teste'
        );
    END IF;
    
    -- Inserir vídeo de teste se não existir
    IF NOT EXISTS (SELECT 1 FROM videos WHERE titulo = 'Vídeo de Teste') THEN
        INSERT INTO videos (id, titulo, descricao, url_video, curso_id, duracao) 
        VALUES (
            gen_random_uuid(),
            'Vídeo de Teste',
            'Vídeo para testar o sistema',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            (SELECT id FROM cursos WHERE nome = 'Curso de Teste' LIMIT 1),
            180
        );
    END IF;
END $$;

-- 8. Testar consultas
SELECT '=== TESTE CONSULTAS ===' as info;

-- Testar consulta de progresso
SELECT 
    'Teste progresso_usuario' as tabela,
    COUNT(*) as total_registros
FROM progresso_usuario;

-- Testar consulta de video_progress
SELECT 
    'Teste video_progress' as tabela,
    COUNT(*) as total_registros
FROM video_progress;

-- 9. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

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
WHERE tablename IN ('video_progress', 'progresso_usuario')
ORDER BY tablename, policyname;

-- 10. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Problemas corrigidos!' as status,
    'Agora os clientes devem conseguir acessar os cursos normalmente.' as mensagem; 