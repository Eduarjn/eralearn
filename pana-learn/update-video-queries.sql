-- Script para atualizar consultas de vídeos para usar o campo ordem
-- Execute este script após executar add-video-order-system.sql

-- 1. Atualizar consulta no VideoChecklist.tsx
-- Antes: .order('data_criacao', { ascending: true })
-- Depois: .order('ordem', { ascending: true })

-- 2. Atualizar consulta no CursoDetalhe.tsx
-- Antes: .order('data_criacao', { ascending: false })
-- Depois: .order('ordem', { ascending: true })

-- 3. Atualizar consulta no ClienteCursoDetalhe.tsx
-- Antes: (sem ordenação específica)
-- Depois: .order('ordem', { ascending: true })

-- 4. Verificar vídeos ordenados por curso
SELECT '=== VÍDEOS ORDENADOS POR CURSO ===' as info;
SELECT 
    c.nome as curso_nome,
    v.titulo,
    v.ordem,
    v.duracao,
    v.data_criacao
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE v.ativo = true
ORDER BY c.nome, v.ordem;

-- 5. Verificar vídeos sem ordem definida
SELECT '=== VÍDEOS SEM ORDEM DEFINIDA ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.curso_id,
    c.nome as curso_nome,
    v.ordem,
    v.data_criacao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.ordem = 0 OR v.ordem IS NULL
ORDER BY v.data_criacao;

-- 6. Atualizar vídeos sem ordem (se houver)
UPDATE videos 
SET ordem = EXTRACT(EPOCH FROM (data_criacao - '2024-01-01'::timestamp))::integer
WHERE ordem = 0 OR ordem IS NULL;

-- 7. Verificar se todos os vídeos têm ordem
SELECT '=== VERIFICAÇÃO FINAL ===' as info;
SELECT 
    COUNT(*) as total_videos,
    COUNT(CASE WHEN ordem > 0 THEN 1 END) as videos_com_ordem,
    COUNT(CASE WHEN ordem = 0 OR ordem IS NULL THEN 1 END) as videos_sem_ordem
FROM videos
WHERE ativo = true;

-- 8. Exemplo de consulta otimizada para frontend
SELECT '=== CONSULTA OTIMIZADA PARA FRONTEND ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.descricao,
    v.duracao,
    v.url_video,
    v.thumbnail_url,
    v.ordem,
    v.curso_id,
    v.modulo_id,
    v.categoria,
    c.nome as curso_nome,
    m.nome_modulo as modulo_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN modulos m ON v.modulo_id = m.id
WHERE v.ativo = true
  AND v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183' -- Exemplo: curso PABX
ORDER BY v.ordem ASC, v.data_criacao ASC;
