-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA QUIZ_PERGUNTAS
-- ========================================
-- Este script verifica a estrutura completa da tabela

-- 1. Verificar estrutura atual da tabela
SELECT '=== ESTRUTURA ATUAL DA TABELA QUIZ_PERGUNTAS ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas'
ORDER BY ordinal_position;

-- 2. Verificar se todos os campos necessários existem
SELECT '=== VERIFICANDO CAMPOS NECESSÁRIOS ===' as info;
SELECT 
  'id' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'id')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'quiz_id' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'quiz_id')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'pergunta' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'pergunta')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'opcoes' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'opcoes')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'resposta_correta' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'resposta_correta')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'explicacao' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'explicacao')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'ordem' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'ordem')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'data_criacao' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'data_criacao')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'data_atualizacao' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'data_atualizacao')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status
UNION ALL
SELECT 
  'updated_at' as campo_necessario,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'updated_at')
    THEN 'EXISTE'
    ELSE 'FALTA'
  END as status;

-- 3. Verificar constraints da tabela
SELECT '=== CONSTRAINTS DA TABELA ===' as info;
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'quiz_perguntas';

-- 4. Verificar foreign keys
SELECT '=== FOREIGN KEYS ===' as info;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'quiz_perguntas';

-- 5. Verificar triggers
SELECT '=== TRIGGERS ===' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_perguntas';

-- 6. Teste de inserção e atualização
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;
SELECT 
  'Estrutura verificada' as status,
  'Execute corrigir-campo-updated-at.sql se necessário' as proximo_passo;


































