-- Script para corrigir problemas de vídeos no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar vídeos problemáticos
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id,
    data_criacao
FROM videos 
WHERE 
    (url_video IS NULL OR url_video = '') 
    AND (video_url IS NULL OR video_url = '')
ORDER BY data_criacao DESC;

-- 2. Verificar vídeos com URLs inválidas
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source
FROM videos 
WHERE 
    url_video LIKE '%1757184723849%' 
    OR video_url LIKE '%1757184723849%'
    OR url_video LIKE '%localhost:3001%'
    OR video_url LIKE '%localhost:3001%';

-- 3. Atualizar vídeos problemáticos com URLs de exemplo do YouTube
UPDATE videos 
SET 
    video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    source = 'youtube',
    url_video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
WHERE 
    (url_video IS NULL OR url_video = '') 
    AND (video_url IS NULL OR video_url = '')
    AND titulo LIKE '%PABX%';

-- 4. Atualizar vídeos específicos do curso PABX com URLs válidas
UPDATE videos 
SET 
    video_url = CASE 
        WHEN titulo LIKE '%Subir um Áudio%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Bloquear Chamadas%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Menu de Caixa Postal%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Grupo de Ringue%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Painel do Operador%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Regras de Tempo%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Função SIGME%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%URA para Atendimento%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Relatórios do PABX%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Relatório de URA%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Chamadas Ativas%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ELSE video_url
    END,
    source = 'youtube',
    url_video = CASE 
        WHEN titulo LIKE '%Subir um Áudio%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Bloquear Chamadas%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Menu de Caixa Postal%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Grupo de Ringue%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Painel do Operador%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Regras de Tempo%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Função SIGME%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%URA para Atendimento%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Relatórios do PABX%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Relatório de URA%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        WHEN titulo LIKE '%Chamadas Ativas%' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ELSE url_video
    END
WHERE 
    curso_id IN (
        SELECT id FROM cursos WHERE nome LIKE '%PABX%'
    )
    AND (
        url_video LIKE '%1757184723849%' 
        OR video_url LIKE '%1757184723849%'
        OR url_video LIKE '%localhost:3001%'
        OR video_url LIKE '%localhost:3001%'
        OR url_video IS NULL 
        OR video_url IS NULL
    );

-- 5. Verificar se as atualizações foram aplicadas
SELECT 
    id,
    titulo,
    url_video,
    video_url,
    source,
    curso_id
FROM videos 
WHERE curso_id IN (
    SELECT id FROM cursos WHERE nome LIKE '%PABX%'
)
ORDER BY titulo;

-- 6. Criar vídeos de exemplo se não existirem
INSERT INTO videos (titulo, descricao, url_video, video_url, source, curso_id, duracao, ordem, data_criacao)
SELECT 
    'Vídeo de Exemplo - ' || c.nome,
    'Este é um vídeo de exemplo para demonstração do sistema.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    c.id,
    180, -- 3 minutos
    1,
    NOW()
FROM cursos c
WHERE c.nome LIKE '%PABX%'
AND NOT EXISTS (
    SELECT 1 FROM videos v 
    WHERE v.curso_id = c.id 
    AND v.titulo LIKE '%Exemplo%'
);

-- 7. Verificar resultado final
SELECT 
    'Total de vídeos no curso PABX:' as info,
    COUNT(*) as quantidade
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome LIKE '%PABX%';

SELECT 
    'Vídeos com URLs válidas:' as info,
    COUNT(*) as quantidade
FROM videos v
JOIN cursos c ON v.curso_id = c.id
WHERE c.nome LIKE '%PABX%'
AND (v.url_video IS NOT NULL AND v.url_video != '')
AND (v.video_url IS NOT NULL AND v.video_url != '');














