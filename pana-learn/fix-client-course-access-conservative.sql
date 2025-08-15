-- Script conservador para corrigir problemas de acesso aos cursos para clientes
-- Execute este script no Supabase SQL Editor
-- Este script é seguro e não impacta configurações existentes

-- 1. Verificar estrutura atual (apenas leitura)
SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se video_progress existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') 
        THEN 'Tabela video_progress existe'
        ELSE 'Tabela video_progress NÃO existe'
    END as status_video_progress;

-- Verificar estrutura da tabela video_progress se existir
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 2. Criar tabela video_progress apenas se não existir (seguro)
DO $$ 
BEGIN
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
        
        RAISE NOTICE 'Tabela video_progress criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela video_progress já existe - mantendo estrutura atual';
    END IF;
END $$;

-- 3. Adicionar colunas faltantes apenas se não existirem (seguro)
DO $$ 
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'user_id') THEN
        ALTER TABLE video_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna user_id adicionada';
    END IF;
    
    -- curso_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'curso_id') THEN
        ALTER TABLE video_progress ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna curso_id adicionada';
    END IF;
    
    -- tempo_total
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'tempo_total') THEN
        ALTER TABLE video_progress ADD COLUMN tempo_total INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna tempo_total adicionada';
    END IF;
    
    -- percentual_assistido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'percentual_assistido') THEN
        ALTER TABLE video_progress ADD COLUMN percentual_assistido DECIMAL(5,2) DEFAULT 0.00;
        RAISE NOTICE 'Coluna percentual_assistido adicionada';
    END IF;
END $$;

-- 4. Criar índices apenas se não existirem (seguro)
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso_id ON video_progress(curso_id);

-- 5. Verificar RLS atual (apenas leitura)
SELECT '=== VERIFICANDO RLS ATUAL ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'video_progress'
ORDER BY policyname;

-- 6. Adicionar políticas RLS apenas se não existirem (seguro)
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Todos podem ver progresso de vídeo') THEN
        CREATE POLICY "Todos podem ver progresso de vídeo" ON video_progress
            FOR SELECT USING (true);
        RAISE NOTICE 'Política SELECT criada';
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Usuários autenticados podem inserir progresso') THEN
        CREATE POLICY "Usuários autenticados podem inserir progresso" ON video_progress
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        RAISE NOTICE 'Política INSERT criada';
    END IF;
    
    -- Política para UPDATE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Usuários autenticados podem atualizar progresso') THEN
        CREATE POLICY "Usuários autenticados podem atualizar progresso" ON video_progress
            FOR UPDATE USING (auth.uid() IS NOT NULL);
        RAISE NOTICE 'Política UPDATE criada';
    END IF;
END $$;

-- 7. Verificar progresso_usuario (apenas leitura)
SELECT '=== VERIFICANDO PROGRESSO_USUARIO ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progresso_usuario') 
        THEN 'Tabela progresso_usuario existe'
        ELSE 'Tabela progresso_usuario NÃO existe'
    END as status_progresso_usuario;

-- 8. Adicionar políticas para progresso_usuario apenas se não existirem (seguro)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progresso_usuario') THEN
        -- Política para SELECT
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progresso_usuario' AND policyname = 'Todos podem ver progresso') THEN
            CREATE POLICY "Todos podem ver progresso" ON progresso_usuario
                FOR SELECT USING (true);
            RAISE NOTICE 'Política SELECT para progresso_usuario criada';
        END IF;
        
        -- Política para INSERT
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progresso_usuario' AND policyname = 'Usuários autenticados podem inserir progresso') THEN
            CREATE POLICY "Usuários autenticados podem inserir progresso" ON progresso_usuario
                FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
            RAISE NOTICE 'Política INSERT para progresso_usuario criada';
        END IF;
        
        -- Política para UPDATE
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progresso_usuario' AND policyname = 'Usuários autenticados podem atualizar progresso') THEN
            CREATE POLICY "Usuários autenticados podem atualizar progresso" ON progresso_usuario
                FOR UPDATE USING (auth.uid() IS NOT NULL);
            RAISE NOTICE 'Política UPDATE para progresso_usuario criada';
        END IF;
    END IF;
END $$;

-- 9. Teste de consulta (apenas leitura)
SELECT '=== TESTE DE CONSULTA ===' as info;

-- Testar se video_progress está acessível
SELECT 
    'video_progress' as tabela,
    COUNT(*) as total_registros
FROM video_progress;

-- Testar se progresso_usuario está acessível (se existir)
SELECT 
    'progresso_usuario' as tabela,
    COUNT(*) as total_registros
FROM progresso_usuario;

-- 10. Verificar dados existentes (apenas leitura)
SELECT '=== DADOS EXISTENTES ===' as info;

-- Verificar vídeos disponíveis
SELECT COUNT(*) as total_videos FROM videos;

-- Verificar cursos disponíveis
SELECT COUNT(*) as total_cursos FROM cursos;

-- Verificar usuários
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 11. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Script executado com sucesso!' as status,
    'Configurações existentes foram preservadas.' as mensagem,
    'Agora teste o acesso aos cursos como cliente.' as proximo_passo; 