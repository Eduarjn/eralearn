-- ========================================
-- CONFIGURAÇÃO RLS PARA TABELA ASSETS
-- ========================================
-- Script para configurar Row Level Security na tabela assets
-- Execute no Supabase SQL Editor APÓS criar a tabela assets

-- 1. Habilitar RLS na tabela assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 2. Política para SELECT: Usuários podem ver assets se estão matriculados no curso
CREATE POLICY "read assets if enrolled" ON public.assets
FOR SELECT USING (
  ativo = true AND (
    -- Se o asset está associado a uma aula, verificar se o usuário está matriculado
    EXISTS (
      SELECT 1
      FROM public.videos v
      JOIN public.cursos c ON c.id = v.curso_id
      JOIN public.matriculas m ON m.curso_id = c.id AND m.usuario_id = auth.uid()
      WHERE v.asset_id = assets.id
    ) OR
    -- Se não há associação com aula, permitir acesso (para assets gerais)
    NOT EXISTS (
      SELECT 1
      FROM public.videos v
      WHERE v.asset_id = assets.id
    )
  )
);

-- 3. Política para INSERT: Apenas administradores podem inserir assets
CREATE POLICY "admin can insert assets" ON public.assets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 4. Política para UPDATE: Apenas administradores podem atualizar assets
CREATE POLICY "admin can update assets" ON public.assets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 5. Política para DELETE: Apenas administradores podem deletar assets
CREATE POLICY "admin can delete assets" ON public.assets
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- 6. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'assets'
ORDER BY policyname;

-- 7. Teste básico das políticas (opcional - remover após teste)
-- SELECT 'RLS configurado com sucesso para tabela assets' as status;










