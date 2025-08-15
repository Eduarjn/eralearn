-- Script para corrigir políticas RLS da tabela de cursos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar políticas RLS atuais
SELECT 'Verificando políticas RLS atuais...' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'cursos'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 'Verificando se RLS está habilitado...' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'cursos';

-- 3. Remover políticas RLS existentes para cursos
DROP POLICY IF EXISTS "Usuários autenticados podem ver cursos" ON public.cursos;
DROP POLICY IF EXISTS "Administradores podem gerenciar cursos" ON public.cursos;
DROP POLICY IF EXISTS "Todos podem ver cursos ativos" ON public.cursos;

-- 4. Criar novas políticas RLS mais permissivas
-- Política para todos os usuários autenticados verem cursos ativos
CREATE POLICY "Todos os usuários autenticados podem ver cursos ativos" 
  ON public.cursos 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND status = 'ativo'
  );

-- Política para administradores gerenciarem todos os cursos
CREATE POLICY "Administradores podem gerenciar todos os cursos" 
  ON public.cursos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE user_id = auth.uid() 
      AND tipo_usuario = 'admin'
    )
  );

-- 5. Verificar se as políticas foram criadas
SELECT 'Verificando novas políticas...' as info;
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'cursos'
ORDER BY policyname;

-- 6. Testar consulta como usuário autenticado
SELECT 'Testando consulta de cursos...' as info;
-- Esta consulta deve retornar dados se as políticas RLS estiverem corretas
SELECT 
  COUNT(*) as total_cursos_ativos,
  COUNT(DISTINCT categoria) as total_categorias
FROM cursos 
WHERE status = 'ativo';

-- 7. Listar todos os cursos ativos
SELECT 'Listando cursos ativos...' as info;
SELECT 
  nome,
  categoria,
  status,
  ordem
FROM cursos 
WHERE status = 'ativo'
ORDER BY ordem; 