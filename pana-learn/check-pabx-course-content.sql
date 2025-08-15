-- Script para verificar e corrigir conteúdo do curso PABX
-- Problema: "Nenhum vídeo disponível neste curso"

-- 1. Verificar se o curso PABX existe
SELECT '=== CURSO PABX EXISTE? ===' as info;
SELECT 
    id,
    nome,
    categoria,
    descricao
FROM cursos
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR nome ILIKE '%PABX%'
OR categoria = 'PABX';

-- 2. Verificar vídeos do curso PABX
SELECT '=== VÍDEOS DO CURSO PABX ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR v.categoria = 'PABX'
ORDER BY v.data_criacao;

-- 3. Se não há vídeos, criar alguns vídeos de exemplo
DO $$
BEGIN
    -- Verificar se há vídeos para o curso PABX
    IF NOT EXISTS (
        SELECT 1 FROM videos 
        WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
    ) THEN
        -- Inserir vídeos de exemplo para o curso PABX
        INSERT INTO videos (titulo, descricao, url_video, curso_id, categoria, duracao) VALUES
        ('Introdução ao PABX', 'Conceitos básicos de sistemas PABX', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '98f3a689-389c-4ded-9833-846d59fcc183', 'PABX', 300),
        ('Configuração de URA', 'Como configurar URA no PABX', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '98f3a689-389c-4ded-9833-846d59fcc183', 'PABX', 540),
        ('Teste de captura de chamadas', 'Testando funcionalidades de captura', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '98f3a689-389c-4ded-9833-846d59fcc183', 'PABX', 120),
        ('Webphone na Prática', 'Treinamento prático de webphone', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '98f3a689-389c-4ded-9833-846d59fcc183', 'PABX', 360);
        
        RAISE NOTICE 'Vídeos de exemplo criados para o curso PABX';
    ELSE
        RAISE NOTICE 'Vídeos já existem para o curso PABX';
    END IF;
END $$;

-- 4. Verificar vídeos após correção
SELECT '=== VÍDEOS APÓS CORREÇÃO ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.duracao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao; 