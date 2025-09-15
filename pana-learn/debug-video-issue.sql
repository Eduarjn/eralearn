-- ========================================
-- DEBUG DO PROBLEMA DO VÍDEO
-- ========================================
-- Script para investigar e corrigir o problema específico do vídeo
-- Execute no Supabase SQL Editor

-- 1. Buscar o vídeo específico que está dando erro
-- ID do vídeo do erro: c72babf0-c95a-4c78-96a6-a7d00ee399fd
SELECT 
    id,
    titulo,
    descricao,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo,
    data_criacao,
    data_atualizacao
FROM public.videos 
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';

-- 2. Verificar se o vídeo existe e seus dados
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.videos 
            WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd'
        ) THEN 'VÍDEO ENCONTRADO'
        ELSE 'VÍDEO NÃO ENCONTRADO'
    END as status;

-- 3. Verificar todos os vídeos do curso PABX
SELECT 
    v.id,
    v.titulo,
    v.url_video,
    v.video_url,
    v.source,
    v.ativo,
    c.titulo as curso_titulo,
    c.categoria
FROM public.videos v
LEFT JOIN public.cursos c ON c.id = v.curso_id
WHERE c.categoria = 'PABX' OR v.categoria = 'PABX'
ORDER BY v.data_criacao DESC;

-- 4. Verificar se há vídeos órfãos (sem curso_id)
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    categoria,
    ativo
FROM public.videos 
WHERE curso_id IS NULL 
    AND (categoria = 'PABX' OR titulo ILIKE '%pabx%')
ORDER BY data_criacao DESC;

-- 5. Verificar estrutura da tabela videos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
    AND table_schema = 'public'
    AND column_name IN ('id', 'titulo', 'url_video', 'video_url', 'source', 'curso_id', 'categoria', 'ativo')
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS da tabela videos
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'videos'
ORDER BY policyname;

-- 7. Testar acesso ao vídeo específico (simular query do frontend)
SELECT 
    v.*,
    c.titulo as curso_titulo
FROM public.videos v
LEFT JOIN public.cursos c ON c.id = v.curso_id
WHERE v.id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd'
    AND v.ativo = true;

-- 8. Verificar se há problemas de permissão
-- (Execute como usuário autenticado se possível)
SELECT 
    'Teste de permissão' as teste,
    COUNT(*) as videos_visiveis
FROM public.videos 
WHERE ativo = true;

-- 9. Corrigir dados do vídeo se necessário
-- (Descomente e execute apenas se necessário)
/*
UPDATE public.videos 
SET 
    source = 'upload',
    video_url = COALESCE(video_url, url_video),
    ativo = true
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';
*/

-- 10. Verificar logs de erro (se disponível)
SELECT 
    'Verificação concluída' as status,
    NOW() as timestamp;














