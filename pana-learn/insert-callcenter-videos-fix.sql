-- Script para inserir vídeos do curso CALLCENTER
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para inserção
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 2. Buscar o curso CALLCENTER
WITH callcenter_curso AS (
    SELECT id FROM cursos 
    WHERE nome = 'Fundamentos CALLCENTER'
    LIMIT 1
)

-- 3. Inserir vídeos se não existirem
INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao)
SELECT 
    'Introdução ao Call Center',
    'Conceitos básicos e fundamentos dos sistemas de call center',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    1800 -- 30 minutos
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Introdução ao Call Center' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao)
SELECT 
    'Sistemas de Atendimento',
    'Como funcionam os sistemas de atendimento em call centers',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    2400 -- 40 minutos
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Sistemas de Atendimento' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao)
SELECT 
    'Gestão de Filas de Atendimento',
    'Técnicas para gerenciar filas e otimizar o atendimento',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    2100 -- 35 minutos
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Gestão de Filas de Atendimento' 
    AND categoria = 'CALLCENTER'
);

INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao)
SELECT 
    'Relatórios e Métricas',
    'Como analisar relatórios e métricas de performance',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'CALLCENTER',
    callcenter_curso.id,
    1800 -- 30 minutos
FROM callcenter_curso
WHERE NOT EXISTS (
    SELECT 1 FROM videos 
    WHERE titulo = 'Relatórios e Métricas' 
    AND categoria = 'CALLCENTER'
);

-- 4. Reabilitar RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 5. Verificar vídeos inseridos
SELECT 
    v.id,
    v.titulo,
    v.descricao,
    v.url_video,
    v.categoria,
    v.curso_id,
    v.duracao,
    c.nome as curso_nome
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome = 'Fundamentos CALLCENTER'
ORDER BY v.data_criacao DESC;






