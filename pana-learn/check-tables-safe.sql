-- Script para verificar tabelas existentes (VERSÃO SEGURA)
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

SELECT 'Tabelas existentes:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA QUIZZES (se existir)
-- ========================================

SELECT 'Estrutura da tabela quizzes (se existir):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR ESTRUTURA DA TABELA QUIZ_PERGUNTAS (se existir)
-- ========================================

SELECT 'Estrutura da tabela quiz_perguntas (se existir):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quiz_perguntas'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR ESTRUTURA DA TABELA PROGRESSO_QUIZ (se existir)
-- ========================================

SELECT 'Estrutura da tabela progresso_quiz (se existir):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'progresso_quiz'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DA TABELA CERTIFICADOS (se existir)
-- ========================================

SELECT 'Estrutura da tabela certificados (se existir):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'certificados'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. VERIFICAR DADOS EXISTENTES (VERSÃO SEGURA)
-- ========================================

-- Verificar dados na tabela quizzes (se existir)
SELECT 'Dados na tabela quizzes:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public')
    THEN (SELECT COUNT(*)::text FROM public.quizzes)
    ELSE 'Tabela não existe'
  END as total_quizzes;

-- Verificar dados na tabela quiz_perguntas (se existir)
SELECT 'Dados na tabela quiz_perguntas:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_perguntas' AND table_schema = 'public')
    THEN (SELECT COUNT(*)::text FROM public.quiz_perguntas)
    ELSE 'Tabela não existe'
  END as total_perguntas;

-- Verificar dados na tabela progresso_quiz (se existir)
SELECT 'Dados na tabela progresso_quiz:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progresso_quiz' AND table_schema = 'public')
    THEN (SELECT COUNT(*)::text FROM public.progresso_quiz)
    ELSE 'Tabela não existe'
  END as total_progresso;

-- Verificar dados na tabela certificados (se existir)
SELECT 'Dados na tabela certificados:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificados' AND table_schema = 'public')
    THEN (SELECT COUNT(*)::text FROM public.certificados)
    ELSE 'Tabela não existe'
  END as total_certificados; 