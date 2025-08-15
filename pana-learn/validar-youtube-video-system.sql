-- Script para validar e garantir suporte a vídeos do YouTube
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR ESTRUTURA DA TABELA VIDEOS
-- ========================================

SELECT '=== ESTRUTURA DA TABELA VIDEOS ===' as info;

-- Verificar se a tabela videos existe e tem as colunas necessárias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR VÍDEOS EXISTENTES
-- ========================================

SELECT '=== VÍDEOS EXISTENTES ===' as info;

-- Verificar todos os vídeos e identificar tipos
SELECT 
    id,
    titulo,
    url_video,
    CASE 
        WHEN url_video LIKE '%youtube.com%' OR url_video LIKE '%youtu.be%' THEN 'YouTube'
        WHEN url_video LIKE '%.mp4%' OR url_video LIKE '%.webm%' OR url_video LIKE '%.mov%' THEN 'Local'
        ELSE 'Outro'
    END as tipo_video,
    duracao,
    curso_id,
    ordem
FROM videos 
ORDER BY curso_id, ordem;

-- ========================================
-- 3. VERIFICAR PROGRESSO DE VÍDEOS
-- ========================================

SELECT '=== PROGRESSO DE VÍDEOS ===' as info;

-- Verificar se há progresso salvo para vídeos
SELECT 
    vp.id,
    v.titulo,
    v.url_video,
    CASE 
        WHEN v.url_video LIKE '%youtube.com%' OR v.url_video LIKE '%youtu.be%' THEN 'YouTube'
        ELSE 'Local'
    END as tipo_video,
    vp.tempo_assistido,
    vp.tempo_total,
    vp.percentual_assistido,
    vp.concluido,
    vp.data_conclusao
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
ORDER BY vp.data_conclusao DESC
LIMIT 10;

-- ========================================
-- 4. VERIFICAR CURSOS E VÍDEOS
-- ========================================

SELECT '=== CURSOS E VÍDEOS ===' as info;

-- Verificar cursos e seus vídeos
SELECT 
    c.nome as curso_nome,
    c.categoria,
    COUNT(v.id) as total_videos,
    COUNT(CASE WHEN v.url_video LIKE '%youtube.com%' OR v.url_video LIKE '%youtu.be%' THEN 1 END) as videos_youtube,
    COUNT(CASE WHEN v.url_video NOT LIKE '%youtube.com%' AND v.url_video NOT LIKE '%youtu.be%' THEN 1 END) as videos_locais
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.categoria
ORDER BY c.categoria, c.nome;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DE PROGRESSO
-- ========================================

SELECT '=== ESTRUTURA DE PROGRESSO ===' as info;

-- Verificar se a tabela video_progress tem as colunas necessárias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. ADICIONAR COLUNAS NECESSÁRIAS (SE NÃO EXISTIREM)
-- ========================================

SELECT '=== ADICIONANDO COLUNAS NECESSÁRIAS ===' as info;

-- Adicionar coluna source se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name = 'source'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE videos ADD COLUMN source VARCHAR(20) DEFAULT 'upload';
        RAISE NOTICE 'Coluna source adicionada à tabela videos';
    ELSE
        RAISE NOTICE 'Coluna source já existe na tabela videos';
    END IF;
END $$;

-- Adicionar coluna youtube_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name = 'youtube_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE videos ADD COLUMN youtube_id VARCHAR(20);
        RAISE NOTICE 'Coluna youtube_id adicionada à tabela videos';
    ELSE
        RAISE NOTICE 'Coluna youtube_id já existe na tabela videos';
    END IF;
END $$;

-- ========================================
-- 7. ATUALIZAR VÍDEOS EXISTENTES
-- ========================================

SELECT '=== ATUALIZANDO VÍDEOS EXISTENTES ===' as info;

-- Função para extrair ID do YouTube
CREATE OR REPLACE FUNCTION extract_youtube_id(url TEXT) 
RETURNS TEXT AS $$
BEGIN
    -- Padrões de URL do YouTube
    IF url ~ 'youtube\.com/watch\?v=([^&]+)' THEN
        RETURN substring(url from 'youtube\.com/watch\?v=([^&]+)');
    ELSIF url ~ 'youtu\.be/([^?]+)' THEN
        RETURN substring(url from 'youtu\.be/([^?]+)');
    ELSIF url ~ 'youtube\.com/embed/([^?]+)' THEN
        RETURN substring(url from 'youtube\.com/embed/([^?]+)');
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Atualizar vídeos do YouTube
UPDATE videos 
SET 
    source = 'youtube',
    youtube_id = extract_youtube_id(url_video)
WHERE url_video LIKE '%youtube.com%' OR url_video LIKE '%youtu.be%';

-- Atualizar vídeos locais
UPDATE videos 
SET source = 'upload'
WHERE url_video NOT LIKE '%youtube.com%' AND url_video NOT LIKE '%youtu.be%';

-- ========================================
-- 8. VERIFICAR RESULTADO APÓS ATUALIZAÇÕES
-- ========================================

SELECT '=== RESULTADO APÓS ATUALIZAÇÕES ===' as info;

-- Verificar vídeos atualizados
SELECT 
    id,
    titulo,
    url_video,
    source,
    youtube_id,
    duracao,
    curso_id
FROM videos 
ORDER BY curso_id, ordem;

-- ========================================
-- 9. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT '=== POLÍTICAS RLS ===' as info;

-- Verificar políticas RLS para video_progress
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    using_expression
FROM pg_policies 
WHERE tablename = 'video_progress'
ORDER BY policyname;

-- ========================================
-- 10. CRIAR POLÍTICAS RLS SE NECESSÁRIO
-- ========================================

SELECT '=== CRIANDO POLÍTICAS RLS ===' as info;

DO $$
BEGIN
    -- Política para SELECT - Usuários podem ver seu próprio progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Usuarios podem ver seu progresso') THEN
        CREATE POLICY "Usuarios podem ver seu progresso" ON video_progress
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Política SELECT criada para video_progress';
    ELSE
        RAISE NOTICE 'Política SELECT já existe para video_progress';
    END IF;
    
    -- Política para INSERT - Usuários podem criar seu progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Usuarios podem criar progresso') THEN
        CREATE POLICY "Usuarios podem criar progresso" ON video_progress
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política INSERT criada para video_progress';
    ELSE
        RAISE NOTICE 'Política INSERT já existe para video_progress';
    END IF;
    
    -- Política para UPDATE - Usuários podem atualizar seu progresso
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Usuarios podem atualizar progresso') THEN
        CREATE POLICY "Usuarios podem atualizar progresso" ON video_progress
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política UPDATE criada para video_progress';
    ELSE
        RAISE NOTICE 'Política UPDATE já existe para video_progress';
    END IF;
END $$;

-- ========================================
-- 11. TESTE DE FUNCIONAMENTO
-- ========================================

SELECT '=== TESTE DE FUNCIONAMENTO ===' as info;

-- Simular consulta que o frontend fará
SELECT 
    'Teste de vídeos YouTube:' as info,
    COUNT(CASE WHEN source = 'youtube' THEN 1 END) as total_youtube,
    COUNT(CASE WHEN source = 'upload' THEN 1 END) as total_upload,
    COUNT(CASE WHEN youtube_id IS NOT NULL THEN 1 END) as com_youtube_id
FROM videos;

-- ========================================
-- 12. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM videos WHERE source = 'youtube'
        ) THEN '✅ VÍDEOS YOUTUBE SUPORTADOS'
        ELSE '⚠️ NENHUM VÍDEO YOUTUBE ENCONTRADO'
    END as status_youtube,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'video_progress'
        ) THEN '✅ POLÍTICAS RLS CONFIGURADAS'
        ELSE '❌ POLÍTICAS RLS PENDENTES'
    END as status_rls,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'videos' AND column_name = 'source'
        ) THEN '✅ ESTRUTURA ATUALIZADA'
        ELSE '❌ ESTRUTURA PENDENTE'
    END as status_estrutura;

-- ========================================
-- 13. INSTRUÇÕES FINAIS
-- ========================================

SELECT '=== INSTRUÇÕES FINAIS ===' as info;

SELECT 
    '✅ SISTEMA YOUTUBE VALIDADO' as status,
    'O sistema agora suporta vídeos do YouTube com controle de progresso.' as mensagem,
    'Teste no frontend com vídeos do YouTube para confirmar funcionamento.' as proximo_passo; 