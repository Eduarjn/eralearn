-- Script para testar autenticação e acesso aos vídeos
-- Problema: Políticas RLS existem mas clientes não conseguem ver vídeos

-- 1. Verificar se há vídeos no curso PABX (teste direto)
SELECT '=== TESTE DIRETO - VÍDEOS PABX ===' as info;
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

-- 2. Verificar se o curso PABX existe
SELECT '=== CURSO PABX ===' as info;
SELECT 
    id,
    nome,
    categoria,
    status
FROM cursos
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 3. Verificar usuários clientes
SELECT '=== USUÁRIOS CLIENTES ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios
WHERE tipo_usuario = 'cliente'
ORDER BY email;

-- 4. Testar consulta como se fosse um cliente autenticado
-- Simular consulta que a aplicação faz
SELECT '=== TESTE CONSULTA CLIENTE ===' as info;
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
AND EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.tipo_usuario = 'cliente' 
    AND u.status = 'ativo'
)
ORDER BY v.data_criacao;

-- 5. Verificar se há problemas de permissão
SELECT '=== VERIFICAR PERMISSÕES ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('videos', 'cursos')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- 6. Testar se a consulta funciona sem RLS
SELECT '=== TESTE SEM RLS ===' as info;
-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos DISABLE ROW LEVEL SECURITY;

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

-- Reabilitar RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY; 