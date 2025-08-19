-- ========================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA QUIZ E CERTIFICADOS
-- ========================================
-- Este script corrige as políticas RLS que estão causando erros 406

-- ========================================
-- 1. CORRIGIR POLÍTICAS DA TABELA CERTIFICADOS
-- ========================================

SELECT '=== CORRIGINDO RLS CERTIFICADOS ===' as info;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem ver todos os certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem inserir certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem atualizar certificados" ON public.certificados;

-- Criar políticas corretas
CREATE POLICY "Usuários podem ver seus próprios certificados" ON public.certificados
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Usuários podem inserir seus próprios certificados" ON public.certificados
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar certificados" ON public.certificados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- ========================================
-- 2. CORRIGIR POLÍTICAS DA TABELA PROGRESSO_QUIZ
-- ========================================

SELECT '=== CORRIGINDO RLS PROGRESSO_QUIZ ===' as info;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem ver todo progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem inserir progresso" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem atualizar progresso" ON public.progresso_quiz;

-- Criar políticas corretas
CREATE POLICY "Usuários podem ver seu próprio progresso" ON public.progresso_quiz
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Usuários podem inserir seu próprio progresso" ON public.progresso_quiz
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio progresso" ON public.progresso_quiz
  FOR UPDATE USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- ========================================
-- 3. CORRIGIR POLÍTICAS DA TABELA QUIZZES
-- ========================================

SELECT '=== CORRIGINDO RLS QUIZZES ===' as info;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem ver quizzes ativos" ON public.quizzes;
DROP POLICY IF EXISTS "Admins podem gerenciar quizzes" ON public.quizzes;

-- Criar políticas corretas
CREATE POLICY "Todos podem ver quizzes ativos" ON public.quizzes
  FOR SELECT USING (
    ativo = true OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem gerenciar quizzes" ON public.quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- ========================================
-- 4. CORRIGIR POLÍTICAS DA TABELA CURSO_QUIZ_MAPPING
-- ========================================

SELECT '=== CORRIGINDO RLS CURSO_QUIZ_MAPPING ===' as info;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem ver mapeamentos" ON public.curso_quiz_mapping;
DROP POLICY IF EXISTS "Admins podem gerenciar mapeamentos" ON public.curso_quiz_mapping;

-- Criar políticas corretas
CREATE POLICY "Todos podem ver mapeamentos" ON public.curso_quiz_mapping
  FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar mapeamentos" ON public.curso_quiz_mapping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- ========================================
-- 5. VERIFICAR SE AS TABELAS ESTÃO HABILITADAS PARA RLS
-- ========================================

SELECT '=== VERIFICANDO RLS ===' as info;

-- Habilitar RLS nas tabelas
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_quiz_mapping ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. VERIFICAR POLÍTICAS CRIADAS
-- ========================================

SELECT '=== POLÍTICAS CRIADAS ===' as info;

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
WHERE schemaname = 'public' 
AND tablename IN ('certificados', 'progresso_quiz', 'quizzes', 'curso_quiz_mapping')
ORDER BY tablename, policyname;

SELECT '=== CORREÇÃO RLS CONCLUÍDA ===' as info;
