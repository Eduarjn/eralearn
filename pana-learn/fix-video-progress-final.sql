-- Script final para corrigir estrutura da tabela video_progress
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 2. Criar tabela se não existir
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

-- 3. Adicionar colunas faltantes
DO $$ 
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'user_id') THEN
        ALTER TABLE video_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- curso_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'curso_id') THEN
        ALTER TABLE video_progress ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE;
    END IF;
    
    -- concluido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'concluido') THEN
        ALTER TABLE video_progress ADD COLUMN concluido BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- progresso
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'progresso') THEN
        ALTER TABLE video_progress ADD COLUMN progresso FLOAT DEFAULT 0;
    END IF;
    
    -- tempo_assistido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'tempo_assistido') THEN
        ALTER TABLE video_progress ADD COLUMN tempo_assistido INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso_id ON video_progress(curso_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_video ON video_progress(user_id, video_id);

-- 5. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 6. Configurar RLS (opcional - pode ser desabilitado para desenvolvimento)
-- ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- 7. Criar policies básicas (opcional)
-- DO $$
-- BEGIN
--     -- Policy básica para desenvolvimento
--     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Allow all for development') THEN
--         CREATE POLICY "Allow all for development" ON video_progress
--             FOR ALL USING (true);
--     END IF;
-- END $$;

-- 8. Testar consulta
SELECT '=== TESTE CONSULTA ===' as info;
SELECT 
    COUNT(*) as total_registros
FROM video_progress;

-- 9. Verificar vídeos disponíveis
SELECT '=== VÍDEOS DISPONÍVEIS ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.curso_id,
    c.nome as nome_curso
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LIMIT 5;

-- 10. Verificar se a tabela está funcionando
SELECT '=== TESTE FINAL ===' as info;
SELECT 
    'Tabela video_progress criada com sucesso!' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'video_progress'; 