-- Verificar se o curso "Fundamentos CALLCENTER" existe
SELECT 
    id,
    nome,
    categoria,
    descricao,
    status,
    created_at
FROM cursos 
WHERE nome ILIKE '%callcenter%' OR nome ILIKE '%CALLCENTER%';

-- Inserir o curso "Fundamentos CALLCENTER" se não existir
INSERT INTO cursos (nome, categoria, descricao, status)
SELECT 
    'Fundamentos CALLCENTER',
    'CALLCENTER',
    'Introdução aos sistemas de call center e suas funcionalidades',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM cursos 
    WHERE nome ILIKE '%callcenter%' OR nome ILIKE '%CALLCENTER%'
);

-- Verificar vídeos da categoria CALLCENTER
SELECT 
    id,
    titulo,
    url_video,
    categoria,
    curso_id,
    created_at
FROM videos 
WHERE categoria ILIKE '%callcenter%' OR categoria ILIKE '%CALLCENTER%'
ORDER BY created_at DESC;

-- Associar vídeos da categoria CALLCENTER ao curso (se não estiverem associados)
UPDATE videos 
SET curso_id = (
    SELECT id FROM cursos 
    WHERE nome ILIKE '%callcenter%' OR nome ILIKE '%CALLCENTER%'
    LIMIT 1
)
WHERE (categoria ILIKE '%callcenter%' OR categoria ILIKE '%CALLCENTER%')
  AND curso_id IS NULL;

-- Verificar resultado final
SELECT 
    c.id as curso_id,
    c.nome as curso_nome,
    c.categoria as curso_categoria,
    COUNT(v.id) as total_videos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.nome ILIKE '%callcenter%' OR c.nome ILIKE '%CALLCENTER%'
GROUP BY c.id, c.nome, c.categoria;

-- Listar todos os vídeos do curso CALLCENTER
SELECT 
    v.id,
    v.titulo,
    v.url_video,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome ILIKE '%callcenter%' OR c.nome ILIKE '%CALLCENTER%'
ORDER BY v.created_at DESC;







