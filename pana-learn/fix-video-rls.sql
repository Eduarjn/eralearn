-- Script para corrigir políticas RLS da tabela de vídeos
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
WHERE tablename = 'videos'
ORDER BY policyname;

-- 2. Remover políticas RLS existentes para vídeos
DROP POLICY IF EXISTS "Usuários autenticados podem ver vídeos" ON public.videos;
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos" ON public.videos;

-- 3. Criar novas políticas RLS mais permissivas
-- Política para todos os usuários autenticados verem vídeos
CREATE POLICY "Todos os usuários autenticados podem ver vídeos" 
  ON public.videos 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Política para administradores gerenciarem vídeos
CREATE POLICY "Administradores podem gerenciar vídeos" 
  ON public.videos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- 4. Verificar se a tabela videos tem RLS habilitado
SELECT 'Verificando se RLS está habilitado...' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'videos';

-- 5. Habilitar RLS se não estiver habilitado
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas RLS após correção
SELECT 'Verificando políticas RLS após correção...' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'videos'
ORDER BY policyname;

-- 7. Testar consulta de vídeos
SELECT 'Testando consulta de vídeos...' as info;
SELECT 
  id,
  titulo,
  duracao,
  categoria,
  curso_id,
  modulo_id,
  data_criacao
FROM videos 
ORDER BY data_criacao DESC
LIMIT 5;

-- 8. Verificar se há vídeos na tabela
SELECT 'Verificando total de vídeos...' as info;
SELECT COUNT(*) as total_videos FROM videos;

-- 9. Listar vídeos com relacionamentos
SELECT 'Listando vídeos com relacionamentos...' as info;
SELECT 
  v.id,
  v.titulo,
  v.categoria,
  v.curso_id,
  v.modulo_id,
  c.nome as curso_nome,
  m.nome_modulo as modulo_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN modulos m ON v.modulo_id = m.id
ORDER BY v.data_criacao DESC; 