-- Script para adicionar vídeos de exemplo ao curso PABX
-- Este script garante que o curso PABX tenha vídeos disponíveis para clientes

-- 1. Verificar curso PABX
SELECT '=== CURSO PABX ===' as info;
SELECT
    id,
    nome,
    categoria,
    status,
    ativo
FROM cursos
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR categoria = 'PABX';

-- 2. Verificar vídeos existentes do curso PABX
SELECT '=== VÍDEOS EXISTENTES PABX ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.ativo,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR v.categoria = 'PABX'
ORDER BY v.data_criacao;

-- 3. Adicionar vídeos de exemplo se não existirem
DO $$
DECLARE
    curso_id UUID := '98f3a689-389c-4ded-9833-846d59fcc183';
    video_count INTEGER;
BEGIN
    -- Verificar quantos vídeos já existem para o curso PABX
    SELECT COUNT(*) INTO video_count
    FROM videos
    WHERE curso_id = curso_id
    AND ativo = true;

    -- Se não há vídeos, adicionar alguns de exemplo
    IF video_count = 0 THEN
        INSERT INTO videos (id, titulo, descricao, url_video, curso_id, categoria, duracao, ativo) VALUES
        (gen_random_uuid(), 'Introdução ao PABX', 'Conceitos básicos de sistemas PABX e sua importância nas empresas', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', curso_id, 'PABX', 300, true),
        (gen_random_uuid(), 'Configuração de URA', 'Como configurar URA (Unidade de Resposta Automática) no PABX', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', curso_id, 'PABX', 540, true),
        (gen_random_uuid(), 'Teste de Captura de Chamadas', 'Testando funcionalidades de captura e redirecionamento', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', curso_id, 'PABX', 120, true),
        (gen_random_uuid(), 'Webphone na Prática', 'Treinamento prático de webphone e suas funcionalidades', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', curso_id, 'PABX', 360, true),
        (gen_random_uuid(), 'Relatórios e Analytics', 'Como gerar relatórios e analisar dados do PABX', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', curso_id, 'PABX', 420, true);

        RAISE NOTICE 'Vídeos de exemplo adicionados ao curso PABX';
    ELSE
        RAISE NOTICE 'Vídeos já existem para o curso PABX (% vídeos)', video_count;
    END IF;
END $$;

-- 4. Verificar vídeos após adição
SELECT '=== VÍDEOS APÓS ADIÇÃO ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.ativo,
    v.duracao,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND v.ativo = true
ORDER BY v.data_criacao;

-- 5. Verificar total de vídeos disponíveis
SELECT '=== RESUMO FINAL ===' as info;
SELECT
    'Total vídeos PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND ativo = true
UNION ALL
SELECT
    'Total vídeos ativos' as tipo,
    COUNT(*) as total
FROM videos
WHERE ativo = true
UNION ALL
SELECT
    'Total vídeos categoria PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE categoria = 'PABX'
AND ativo = true;

-- 6. Testar consulta como cliente
SELECT '=== TESTE CONSULTA CLIENTE ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.ativo
FROM videos v
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND v.ativo = true
ORDER BY v.data_criacao; 