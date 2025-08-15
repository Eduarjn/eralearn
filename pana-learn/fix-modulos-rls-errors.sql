-- Script para corrigir erros RLS da tabela modulos
-- Erros: POST 403 e DELETE 400

-- 1. Verificar políticas RLS atuais da tabela modulos
SELECT '=== POLÍTICAS RLS ATUAIS MODULOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'modulos'
ORDER BY policyname;

-- 2. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Todos podem ver módulos" ON public.modulos;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar módulos" ON public.modulos;
DROP POLICY IF EXISTS "Administradores podem gerenciar módulos" ON public.modulos;
DROP POLICY IF EXISTS "Usuários podem ver módulos" ON public.modulos;

-- 3. Criar políticas mais permissivas para modulos
CREATE POLICY "Todos podem ver módulos" ON public.modulos
    FOR SELECT USING (true);

CREATE POLICY "Todos podem inserir módulos" ON public.modulos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar módulos" ON public.modulos
    FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar módulos" ON public.modulos
    FOR DELETE USING (true);

-- 4. Verificar se RLS está habilitado
SELECT '=== STATUS RLS MODULOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 5. Habilitar RLS se não estiver
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas após correção
SELECT '=== POLÍTICAS APÓS CORREÇÃO ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'modulos'
ORDER BY policyname;

-- 7. Testar acesso aos módulos
SELECT '=== TESTE ACESSO MODULOS ===' as info;
SELECT COUNT(*) as total_modulos_acessiveis
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'; 