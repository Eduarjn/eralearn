-- ========================================
-- TESTE DO SISTEMA COMPLETO DE QUIZ E CERTIFICADOS
-- ========================================
-- Execute este script para testar se tudo está funcionando

-- ========================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA DAS TABELAS ===' as info;

-- Verificar tabela cursos
SELECT 'Tabela cursos:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabela quizzes
SELECT 'Tabela quizzes:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabela certificados
SELECT 'Tabela certificados:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabela curso_quiz_mapping
SELECT 'Tabela curso_quiz_mapping:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'curso_quiz_mapping' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== VERIFICANDO DADOS EXISTENTES ===' as info;

-- Verificar cursos
SELECT 'Cursos existentes:' as info;
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE status = 'ativo'
ORDER BY nome;

-- Verificar quizzes
SELECT 'Quizzes existentes:' as info;
SELECT 
  id,
  categoria,
  titulo,
  ativo
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- Verificar mapeamentos
SELECT 'Mapeamentos curso-quiz:' as info;
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.categoria as categoria_quiz
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- Verificar certificados
SELECT 'Certificados existentes:' as info;
SELECT 
  id,
  curso_nome,
  categoria,
  nota,
  numero_certificado,
  status
FROM certificados 
ORDER BY data_criacao DESC
LIMIT 5;

-- ========================================
-- 3. TESTAR FUNÇÕES
-- ========================================

SELECT '=== TESTANDO FUNÇÕES ===' as info;

-- Verificar se funções existem
SELECT 'Funções disponíveis:' as info;
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

-- ========================================
-- 4. TESTAR MAPEAMENTO CURSO-QUIZ
-- ========================================

SELECT '=== TESTANDO MAPEAMENTO CURSO-QUIZ ===' as info;

-- Testar se cada curso tem seu quiz mapeado
SELECT 'Verificação de mapeamento:' as info;
SELECT 
  c.nome as curso,
  CASE 
    WHEN cqm.quiz_id IS NOT NULL THEN '✅ Mapeado'
    ELSE '❌ Não mapeado'
  END as status_mapeamento,
  q.titulo as quiz_associado
FROM cursos c
LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_id = q.id
WHERE c.status = 'ativo'
ORDER BY c.nome;

-- ========================================
-- 5. TESTAR ESTRUTURA DE CERTIFICADOS
-- ========================================

SELECT '=== TESTANDO ESTRUTURA DE CERTIFICADOS ===' as info;

-- Verificar se colunas necessárias existem
SELECT 'Verificação de colunas:' as info;
SELECT 
  column_name,
  CASE 
    WHEN column_name IN ('curso_id', 'curso_nome', 'quiz_id', 'numero_certificado', 'status', 'data_emissao') 
    THEN '✅ Presente'
    ELSE 'ℹ️ Original'
  END as status_coluna
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. TESTAR RELACIONAMENTOS
-- ========================================

SELECT '=== TESTANDO RELACIONAMENTOS ===' as info;

-- Verificar relacionamento curso-quiz
SELECT 'Relacionamento curso-quiz:' as info;
SELECT 
  COUNT(*) as total_mapeamentos,
  COUNT(DISTINCT curso_id) as cursos_mapeados,
  COUNT(DISTINCT quiz_id) as quizzes_mapeados
FROM curso_quiz_mapping;

-- Verificar relacionamento certificado-curso
SELECT 'Relacionamento certificado-curso:' as info;
SELECT 
  COUNT(*) as total_certificados,
  COUNT(curso_id) as certificados_com_curso,
  COUNT(quiz_id) as certificados_com_quiz
FROM certificados;

-- ========================================
-- 7. TESTAR FUNÇÕES ESPECÍFICAS
-- ========================================

SELECT '=== TESTANDO FUNÇÕES ESPECÍFICAS ===' as info;

-- Testar função de verificação de conclusão (com dados de exemplo)
SELECT 'Teste verificar_conclusao_curso:' as info;
-- Esta função precisa de um usuario_id e curso_id válidos
-- SELECT verificar_conclusao_curso('usuario_id_exemplo', 'curso_id_exemplo');

-- Testar função de liberação de quiz (com dados de exemplo)
SELECT 'Teste liberar_quiz_curso:' as info;
-- Esta função precisa de um usuario_id e curso_id válidos
-- SELECT liberar_quiz_curso('usuario_id_exemplo', 'curso_id_exemplo');

-- ========================================
-- 8. VERIFICAR ÍNDICES
-- ========================================

SELECT '=== VERIFICANDO ÍNDICES ===' as info;

-- Verificar índices da tabela certificados
SELECT 'Índices da tabela certificados:' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'certificados'
AND schemaname = 'public'
ORDER BY indexname;

-- Verificar índices da tabela curso_quiz_mapping
SELECT 'Índices da tabela curso_quiz_mapping:' as info;
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'curso_quiz_mapping'
AND schemaname = 'public'
ORDER BY indexname;

-- ========================================
-- 9. VERIFICAR RLS
-- ========================================

SELECT '=== VERIFICANDO RLS ===' as info;

-- Verificar se RLS está habilitado
SELECT 'RLS habilitado:' as info;
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('certificados', 'curso_quiz_mapping', 'quizzes', 'quiz_perguntas')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 'Políticas RLS:' as info;
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('certificados', 'curso_quiz_mapping', 'quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- ========================================
-- 10. RESUMO FINAL
-- ========================================

SELECT '=== RESUMO FINAL ===' as info;

-- Contagem geral
SELECT 'Contagem geral:' as info;
SELECT 
  (SELECT COUNT(*) FROM cursos WHERE status = 'ativo') as total_cursos,
  (SELECT COUNT(*) FROM quizzes WHERE ativo = true) as total_quizzes,
  (SELECT COUNT(*) FROM curso_quiz_mapping) as total_mapeamentos,
  (SELECT COUNT(*) FROM certificados) as total_certificados;

-- Status do sistema
SELECT 'Status do sistema:' as info;
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM curso_quiz_mapping) = (SELECT COUNT(*) FROM cursos WHERE status = 'ativo')
    THEN '✅ Todos os cursos têm quiz mapeado'
    ELSE '⚠️ Alguns cursos não têm quiz mapeado'
  END as status_mapeamento,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname = 'gerar_certificado_curso') > 0
    THEN '✅ Função de gerar certificado existe'
    ELSE '❌ Função de gerar certificado não existe'
  END as status_funcao_certificado,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname = 'liberar_quiz_curso') > 0
    THEN '✅ Função de liberar quiz existe'
    ELSE '❌ Função de liberar quiz não existe'
  END as status_funcao_quiz;

SELECT '=== SISTEMA PRONTO PARA TESTE ===' as info;
SELECT 'Execute os testes manuais conforme o guia!' as mensagem;
