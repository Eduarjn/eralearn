-- Script para corrigir permissões de vídeos
-- Problema: Vídeos aparecem apenas para administradores, não para clientes

-- 1. Verificar políticas RLS atuais da tabela videos
SELECT '=== POLÍTICAS RLS ATUAIS VIDEOS ===' as info;
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado para videos
SELECT '=== STATUS RLS VIDEOS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'videos';

-- 3. Habilitar RLS se não estiver
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas problemáticas que restringem acesso
DROP POLICY IF EXISTS "Apenas administradores podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Usuários podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Todos podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos" ON public.videos;
DROP POLICY IF EXISTS "Política de acesso a vídeos" ON public.videos;
DROP POLICY IF EXISTS "Política restritiva de vídeos" ON public.videos;

-- 5. Criar políticas corretas para videos
-- Política para SELECT: Todos os usuários autenticados podem ver vídeos ativos
CREATE POLICY "Todos podem ver vídeos ativos" ON public.videos
    FOR SELECT USING (
        ativo = true
    );

-- Política para INSERT: Apenas administradores podem inserir
CREATE POLICY "Administradores podem inserir vídeos" ON public.videos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- Política para UPDATE: Apenas administradores podem atualizar
CREATE POLICY "Administradores podem atualizar vídeos" ON public.videos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- Política para DELETE: Apenas administradores podem deletar
CREATE POLICY "Administradores podem deletar vídeos" ON public.videos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- 6. Verificar se há vídeos inativos que precisam ser ativados
SELECT '=== VÍDEOS INATIVOS ===' as info;
SELECT
    id,
    titulo,
    categoria,
    curso_id,
    ativo
FROM videos
WHERE ativo = false
ORDER BY data_criacao;

-- 7. Ativar vídeos que estão inativos (se necessário)
UPDATE videos
SET ativo = true
WHERE ativo = false
AND curso_id IS NOT NULL;

-- 8. Verificar vídeos órfãos e associá-los aos cursos corretos
SELECT '=== VÍDEOS ÓRFÃOS ===' as info;
SELECT
    id,
    titulo,
    categoria,
    curso_id
FROM videos
WHERE curso_id IS NULL
AND ativo = true;

-- 9. Associar vídeos órfãos aos cursos baseado na categoria
UPDATE videos
SET curso_id = (
    SELECT id FROM cursos
    WHERE categoria = videos.categoria
    AND ativo = true
    LIMIT 1
)
WHERE curso_id IS NULL
AND ativo = true
AND categoria IS NOT NULL;

-- 10. Verificar políticas após correção
SELECT '=== POLÍTICAS APÓS CORREÇÃO ===' as info;
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY policyname;

-- 11. Testar acesso aos vídeos do curso PABX
SELECT '=== TESTE ACESSO VÍDEOS PABX ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.ativo
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND v.ativo = true
ORDER BY v.data_criacao;

-- 12. Verificar total de vídeos disponíveis
SELECT '=== TOTAL VÍDEOS DISPONÍVEIS ===' as info;
SELECT
    'Total vídeos ativos' as tipo,
    COUNT(*) as total
FROM videos
WHERE ativo = true
UNION ALL
SELECT
    'Vídeos curso PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND ativo = true
UNION ALL
SELECT
    'Vídeos categoria PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE categoria = 'PABX'
AND ativo = true; 