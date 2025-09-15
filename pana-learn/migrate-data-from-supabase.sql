-- Script para migrar dados EXISTENTES do Supabase para local
-- Execute APENAS se quiser migrar dados existentes
-- ⚠️ ATENÇÃO: Este script assume que você já executou migrate-clean-strategy.sql

-- ========================================
-- 1. VERIFICAR SE AMBIENTE LOCAL ESTÁ PRONTO
-- ========================================

SELECT '=== VERIFICANDO AMBIENTE LOCAL ===' as info;

-- Verificar se tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('usuarios', 'cursos', 'videos', 'branding_config')
ORDER BY table_name;

-- ========================================
-- 2. MIGRAR DADOS DO SUPABASE (OPCIONAL)
-- ========================================

-- ⚠️ IMPORTANTE: Para migrar dados do Supabase, você precisa:
-- 1. Fazer backup dos dados do Supabase
-- 2. Copiar os dados para este script
-- 3. Executar manualmente

-- Exemplo de como migrar dados (descomente e adapte):

/*
-- Migrar usuários existentes
INSERT INTO usuarios (id, email, nome, tipo_usuario, avatar_url, created_at, updated_at)
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    avatar_url,
    created_at,
    updated_at
FROM supabase_backup.usuarios
ON CONFLICT (email) DO NOTHING;

-- Migrar cursos existentes
INSERT INTO cursos (id, titulo, descricao, imagem_url, created_at, updated_at)
SELECT 
    id,
    titulo,
    descricao,
    imagem_url,
    created_at,
    updated_at
FROM supabase_backup.cursos
ON CONFLICT (id) DO NOTHING;

-- Migrar vídeos existentes (convertendo URLs)
INSERT INTO videos (id, titulo, descricao, url_video, curso_id, provedor, storage_path, created_at, updated_at)
SELECT 
    id,
    titulo,
    descricao,
    -- Converter URLs do Supabase para local
    CASE 
        WHEN url_video LIKE '%supabase%' THEN 
            '/media/videos/' || split_part(url_video, '/', -1)
        ELSE url_video
    END as url_video,
    curso_id,
    'local' as provedor,
    'videos/' || split_part(url_video, '/', -1) as storage_path,
    created_at,
    updated_at
FROM supabase_backup.videos
ON CONFLICT (id) DO NOTHING;

-- Migrar progresso de vídeos
INSERT INTO video_progress (id, usuario_id, video_id, progresso, concluido, created_at, updated_at)
SELECT 
    id,
    usuario_id,
    video_id,
    progresso,
    concluido,
    created_at,
    updated_at
FROM supabase_backup.video_progress
ON CONFLICT (usuario_id, video_id) DO NOTHING;
*/

-- ========================================
-- 3. VERIFICAR DADOS MIGRADOS
-- ========================================

SELECT '=== VERIFICANDO DADOS MIGRADOS ===' as info;

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
    'Progresso' as tabela,
    COUNT(*) as total
FROM video_progress;

-- ========================================
-- 4. INSTRUÇÕES PARA MIGRAÇÃO MANUAL
-- ========================================

SELECT '=== INSTRUÇÕES PARA MIGRAÇÃO MANUAL ===' as info;

/*
Para migrar dados do Supabase:

1. FAZER BACKUP DO SUPABASE:
   - No Supabase Dashboard > SQL Editor
   - Execute: SELECT * FROM usuarios;
   - Execute: SELECT * FROM cursos;
   - Execute: SELECT * FROM videos;
   - Execute: SELECT * FROM video_progress;
   - Copie os resultados

2. PREPARAR DADOS:
   - Converta URLs do Supabase para local
   - Ajuste IDs se necessário
   - Verifique integridade referencial

3. EXECUTAR MIGRAÇÃO:
   - Descomente as seções acima
   - Adapte os dados conforme necessário
   - Execute este script

4. VERIFICAR:
   - Teste a aplicação
   - Verifique se arquivos foram copiados
   - Confirme integridade dos dados
*/

-- ========================================
-- 5. SCRIPT DE BACKUP AUTOMÁTICO
-- ========================================

-- Para fazer backup do Supabase (execute no Supabase SQL Editor):
/*
-- Backup de usuários
COPY (
    SELECT row_to_json(usuarios.*) 
    FROM usuarios
) TO '/tmp/usuarios_backup.json';

-- Backup de cursos
COPY (
    SELECT row_to_json(cursos.*) 
    FROM cursos
) TO '/tmp/cursos_backup.json';

-- Backup de vídeos
COPY (
    SELECT row_to_json(videos.*) 
    FROM videos
) TO '/tmp/videos_backup.json';

-- Backup de progresso
COPY (
    SELECT row_to_json(video_progress.*) 
    FROM video_progress
) TO '/tmp/video_progress_backup.json';
*/

SELECT '=== MIGRAÇÃO CONCLUÍDA ===' as info;
SELECT '✅ Ambiente local pronto - Sem duplicação de dados' as status;
























