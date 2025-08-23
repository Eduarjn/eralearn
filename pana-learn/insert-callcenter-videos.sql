-- Inserir vídeos de exemplo para o curso CALLCENTER
-- Primeiro, obter o ID do curso CALLCENTER
WITH callcenter_curso AS (
    SELECT id FROM cursos 
    WHERE nome ILIKE '%callcenter%' OR nome ILIKE '%CALLCENTER%'
    LIMIT 1
)

-- Inserir vídeos se não existirem
INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao, ordem)
SELECT 
    'Introdução ao Call Center',
    'Conceitos básicos e fundamentos dos sistemas de call center',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    1800, -- 30 minutos
    1
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Introdução ao Call Center' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao, ordem)
SELECT 
    'Sistemas de Atendimento',
    'Como funcionam os sistemas de atendimento em call centers',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    2400, -- 40 minutos
    2
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Sistemas de Atendimento' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao, ordem)
SELECT 
    'Gestão de Filas de Atendimento',
    'Técnicas para gerenciar filas e otimizar o atendimento',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    2100, -- 35 minutos
    3
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Gestão de Filas de Atendimento' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao, ordem)
SELECT 
    'Relatórios e Métricas',
    'Como analisar relatórios e métricas de performance',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    1800, -- 30 minutos
    4
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Relatórios e Métricas' 
    AND categoria = 'CALLCENTER'
);

-- Verificar vídeos inseridos
SELECT 
    v.id,
    v.titulo,
    v.descricao,
    v.url_video,
    v.categoria,
    v.curso_id,
    v.duracao,
    v.ordem,
    c.nome as curso_nome
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome ILIKE '%callcenter%' OR c.nome ILIKE '%CALLCENTER%'
ORDER BY v.ordem, v.created_at DESC;















