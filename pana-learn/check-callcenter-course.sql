-- Verificar se o curso "Fundamentos CALLCENTER" existe
SELECT 
    id,
    nome,
    categoria,
    descricao,
    status,
    created_at
FROM cursos 
WHERE nome ILIKE '%callcenter%' OR nome ILIKE '%CALLCENTER%'
ORDER BY created_at DESC;

-- Verificar vídeos associados ao curso CALLCENTER
SELECT 
    v.id,
    v.titulo,
    v.url_video,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE c.nome ILIKE '%callcenter%' OR c.nome ILIKE '%CALLCENTER%'
   OR v.categoria ILIKE '%callcenter%' OR v.categoria ILIKE '%CALLCENTER%'
ORDER BY v.created_at DESC;

-- Verificar todos os cursos disponíveis
SELECT 
    id,
    nome,
    categoria,
    status,
    created_at
FROM cursos 
ORDER BY nome;

-- Verificar vídeos sem curso associado
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    created_at
FROM videos 
WHERE curso_id IS NULL
ORDER BY categoria, created_at DESC;

-- Contar vídeos por categoria
SELECT 
    categoria,
    COUNT(*) as total_videos,
    COUNT(curso_id) as videos_com_curso,
    COUNT(*) - COUNT(curso_id) as videos_sem_curso
FROM videos 
GROUP BY categoria
ORDER BY categoria;




































