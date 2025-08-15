-- Script para verificar tabelas existentes
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
-- 6. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT 'Dados na tabela quizzes (se existir):' as info;
SELECT COUNT(*) as total_quizzes FROM public.quizzes;

SELECT 'Dados na tabela quiz_perguntas (se existir):' as info;
SELECT COUNT(*) as total_perguntas FROM public.quiz_perguntas;

SELECT 'Dados na tabela progresso_quiz (se existir):' as info;
SELECT COUNT(*) as total_progresso FROM public.progresso_quiz;

SELECT 'Dados na tabela certificados (se existir):' as info;
SELECT COUNT(*) as total_certificados FROM public.certificados; 