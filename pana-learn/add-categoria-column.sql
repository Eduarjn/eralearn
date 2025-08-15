-- Script para adicionar coluna categoria na tabela cursos
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA CURSOS
-- ========================================

SELECT 'Estrutura atual da tabela cursos:' as info;
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
-- 2. VERIFICAR SE A COLUNA CATEGORIA JÁ EXISTE
-- ========================================

SELECT 'Verificando se coluna categoria existe:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
AND column_name = 'categoria';

-- ========================================
-- 3. ADICIONAR COLUNA CATEGORIA (se não existir)
-- ========================================

-- Adicionar coluna categoria se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cursos' 
    AND table_schema = 'public'
    AND column_name = 'categoria'
  ) THEN
    ALTER TABLE public.cursos ADD COLUMN categoria VARCHAR(100);
    RAISE NOTICE 'Coluna categoria adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna categoria já existe!';
  END IF;
END $$;

-- ========================================
-- 4. ATUALIZAR DADOS EXISTENTES COM CATEGORIAS
-- ========================================

-- Atualizar cursos existentes com categorias baseadas no nome
UPDATE public.cursos 
SET categoria = CASE 
  WHEN nome ILIKE '%PABX%' THEN 'PABX'
  WHEN nome ILIKE '%CALL%' OR nome ILIKE '%CALL CENTER%' THEN 'CALLCENTER'
  WHEN nome ILIKE '%OMNI%' OR nome ILIKE '%OMNICHANNEL%' THEN 'Omnichannel'
  WHEN nome ILIKE '%VOIP%' THEN 'VoIP'
  ELSE 'Geral'
END
WHERE categoria IS NULL;

-- ========================================
-- 5. VERIFICAR RESULTADO
-- ========================================

SELECT 'Verificando resultado:' as info;
SELECT 
  id, 
  nome, 
  categoria, 
  status 
FROM public.cursos 
ORDER BY nome;

SELECT 'Contagem por categoria:' as info;
SELECT 
  categoria, 
  COUNT(*) as total_cursos
FROM public.cursos 
GROUP BY categoria 
ORDER BY categoria;

-- ========================================
-- 6. VERIFICAR ESTRUTURA FINAL
-- ========================================

SELECT 'Estrutura final da tabela cursos:' as info;
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