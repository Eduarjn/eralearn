-- Script para verificar a estrutura real das tabelas
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================

SELECT 'Tabelas existentes:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA CURSOS
-- ========================================

SELECT 'Estrutura da tabela cursos:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR DADOS DE EXEMPLO NA TABELA CURSOS
-- ========================================

SELECT 'Dados de exemplo na tabela cursos:' as info;
SELECT id, nome, categoria, status, data_criacao
FROM public.cursos 
LIMIT 5;

-- ========================================
-- 4. VERIFICAR SE EXISTE COLUNA CATEGORIA
-- ========================================

SELECT 'Verificando coluna categoria:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
AND column_name LIKE '%categoria%'
ORDER BY ordinal_position;

-- ========================================
-- 5. VERIFICAR TABELAS DE QUIZ E CERTIFICADOS
-- ========================================

SELECT 'Verificando tabelas de quiz e certificados:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quizzes', 'quiz_perguntas', 'progresso_quiz', 'certificados')
ORDER BY table_name; 