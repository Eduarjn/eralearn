-- ========================================
-- VERIFICAR ESTRUTURA ATUAL DA TABELA CERTIFICADOS
-- ========================================
-- Execute este script primeiro para ver a estrutura atual

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- 1. Verificar se a tabela certificados existe
SELECT 'Tabela certificados existe:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'certificados' 
AND table_schema = 'public';

-- 2. Verificar estrutura completa da tabela certificados
SELECT 'Estrutura completa da tabela certificados:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar dados existentes (se houver)
SELECT 'Dados existentes na tabela certificados:' as info;
SELECT 
  *
FROM certificados 
LIMIT 5;

-- 4. Verificar se outras tabelas relacionadas existem
SELECT 'Tabelas relacionadas:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('cursos', 'quizzes', 'usuarios', 'progresso_quiz')
AND table_schema = 'public'
ORDER BY table_name;

-- 5. Verificar estrutura da tabela cursos
SELECT 'Estrutura da tabela cursos:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar estrutura da tabela quizzes
SELECT 'Estrutura da tabela quizzes:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar se a tabela curso_quiz_mapping existe
SELECT 'Tabela curso_quiz_mapping existe:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'curso_quiz_mapping' 
AND table_schema = 'public';

-- 8. Verificar funções existentes
SELECT 'Funções existentes:' as info;
SELECT 
  proname as funcao,
  prosrc as descricao
FROM pg_proc 
WHERE proname IN (
  'verificar_conclusao_curso',
  'liberar_quiz_curso', 
  'gerar_certificado_curso',
  'buscar_certificados_usuario',
  'validar_certificado'
)
ORDER BY proname;

SELECT '=== ANÁLISE CONCLUÍDA ===' as info;
SELECT 'Verifique os resultados acima para entender a estrutura atual!' as mensagem;
