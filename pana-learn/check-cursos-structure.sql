-- Script para verificar a estrutura real da tabela cursos
-- Execute este script primeiro no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR ESTRUTURA DA TABELA CURSOS
-- ========================================

SELECT 'Estrutura da tabela cursos:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR DADOS DE EXEMPLO NA TABELA CURSOS
-- ========================================

SELECT 'Dados de exemplo na tabela cursos:' as info;
SELECT * FROM public.cursos LIMIT 3;

-- ========================================
-- 3. VERIFICAR SE EXISTE ALGUMA COLUNA RELACIONADA A CATEGORIA
-- ========================================

SELECT 'Verificando colunas relacionadas a categoria:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
AND (
  column_name LIKE '%categoria%' OR 
  column_name LIKE '%category%' OR 
  column_name LIKE '%tipo%' OR 
  column_name LIKE '%type%'
)
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR TABELA CATEGORIAS (se existir)
-- ========================================

SELECT 'Verificando tabela categorias:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%categoria%'
ORDER BY table_name;

-- Se existir tabela categorias, verificar sua estrutura
SELECT 'Estrutura da tabela categorias (se existir):' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'categorias' 
AND table_schema = 'public'
ORDER BY ordinal_position; 