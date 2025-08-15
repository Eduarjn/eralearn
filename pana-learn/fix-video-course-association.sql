-- Script para corrigir associação dos vídeos PABX
-- Associar todos os vídeos PABX ao curso correto

-- 1. Verificar quantos vídeos PABX estão no curso errado
SELECT '=== VÍDEOS PABX NO CURSO ERRADO ===' as info;
SELECT COUNT(*) as total_videos_curso_errado
FROM videos 
WHERE categoria = 'PABX' 
AND curso_id = 'ffb3391c-a260-4095-9794-18e3f2437bdd';

-- 2. Verificar quantos vídeos PABX estão no curso correto
SELECT '=== VÍDEOS PABX NO CURSO CORRETO ===' as info;
SELECT COUNT(*) as total_videos_curso_correto
FROM videos 
WHERE categoria = 'PABX' 
AND curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 3. Mover todos os vídeos PABX para o curso correto
UPDATE videos 
SET curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
WHERE categoria = 'PABX' 
AND curso_id = 'ffb3391c-a260-4095-9794-18e3f2437bdd';

-- 4. Verificar se a correção funcionou
SELECT '=== VÍDEOS PABX APÓS CORREÇÃO ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id
FROM videos 
WHERE categoria = 'PABX'
ORDER BY data_criacao DESC;

-- 5. Verificar total de vídeos no curso PABX
SELECT '=== TOTAL VÍDEOS NO CURSO PABX ===' as info;
SELECT COUNT(*) as total_videos_curso_pabx
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'; 