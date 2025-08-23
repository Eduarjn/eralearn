-- Script para adicionar sistema de ordenação de vídeos
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna ordem na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- 2. Criar índice para melhor performance na ordenação
CREATE INDEX IF NOT EXISTS idx_videos_ordem ON videos(ordem);

-- 3. Atualizar vídeos existentes com ordem baseada na data de criação
UPDATE videos 
SET ordem = EXTRACT(EPOCH FROM (data_criacao - '2024-01-01'::timestamp))::integer
WHERE ordem = 0 OR ordem IS NULL;

-- 4. Criar função para reordenar vídeos de um curso
CREATE OR REPLACE FUNCTION reordenar_videos_curso(
    p_curso_id UUID,
    p_video_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    video_id UUID;
    ordem_atual INTEGER := 1;
BEGIN
    -- Verificar se todos os vídeos pertencem ao curso
    IF EXISTS (
        SELECT 1 FROM videos 
        WHERE id = ANY(p_video_ids) 
        AND curso_id != p_curso_id
    ) THEN
        RAISE EXCEPTION 'Alguns vídeos não pertencem ao curso especificado';
    END IF;
    
    -- Atualizar ordem dos vídeos
    FOREACH video_id IN ARRAY p_video_ids
    LOOP
        UPDATE videos 
        SET ordem = ordem_atual,
            data_atualizacao = NOW()
        WHERE id = video_id;
        
        ordem_atual := ordem_atual + 1;
    END LOOP;
    
    RAISE NOTICE 'Vídeos reordenados com sucesso para o curso %', p_curso_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para obter próxima ordem disponível
CREATE OR REPLACE FUNCTION obter_proxima_ordem_video(p_curso_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_ordem INTEGER;
BEGIN
    SELECT COALESCE(MAX(ordem), 0) + 1
    INTO max_ordem
    FROM videos 
    WHERE curso_id = p_curso_id;
    
    RETURN max_ordem;
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUALIZADA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND column_name = 'ordem';

-- 7. Verificar vídeos com ordem
SELECT '=== VÍDEOS COM ORDEM ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.curso_id,
    c.nome as curso_nome,
    v.ordem,
    v.data_criacao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.curso_id, v.ordem, v.data_criacao;

-- 8. Exemplo de uso da função de reordenação
-- SELECT reordenar_videos_curso(
--     '98f3a689-389c-4ded-9833-846d59fcc183', -- ID do curso PABX
--     ARRAY['video-id-1', 'video-id-2', 'video-id-3']::UUID[]
-- );
