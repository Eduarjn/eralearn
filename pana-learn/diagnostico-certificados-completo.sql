-- ========================================
-- DIAGNÓSTICO COMPLETO - SISTEMA DE CERTIFICADOS
-- ========================================
-- Execute este script para identificar por que os certificados não aparecem

-- ========================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA DAS TABELAS ===' as info;

-- Verificar se a tabela certificados existe e sua estrutura
SELECT 'Tabela certificados:' as info;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'certificados'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabela curso_quiz_mapping
SELECT 'Tabela curso_quiz_mapping:' as info;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'curso_quiz_mapping'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabela progresso_quiz
SELECT 'Tabela progresso_quiz:' as info;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'progresso_quiz'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== VERIFICANDO DADOS EXISTENTES ===' as info;

-- Verificar se existem certificados
SELECT 'Certificados existentes:' as info;
SELECT COUNT(*) as total_certificados FROM public.certificados;

-- Verificar certificados por status
SELECT 'Certificados por status:' as info;
SELECT 
  status,
  COUNT(*) as quantidade
FROM public.certificados
GROUP BY status;

-- Verificar mapeamentos curso-quiz
SELECT 'Mapeamentos curso-quiz:' as info;
SELECT
  cqm.id,
  c.nome as curso_nome,
  q.titulo as quiz_titulo,
  cqm.data_criacao
FROM public.curso_quiz_mapping cqm
JOIN public.cursos c ON cqm.curso_id = c.id
JOIN public.quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;

-- Verificar progresso de quiz
SELECT 'Progresso de quiz:' as info;
SELECT
  pq.id,
  u.email as usuario_email,
  q.titulo as quiz_titulo,
  pq.nota,
  pq.aprovado,
  pq.data_conclusao
FROM public.progresso_quiz pq
JOIN public.usuarios u ON pq.usuario_id = u.id
JOIN public.quizzes q ON pq.quiz_id = q.id
ORDER BY pq.data_conclusao DESC
LIMIT 10;

-- ========================================
-- 3. VERIFICAR FUNÇÕES DO BANCO
-- ========================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as info;

-- Verificar se as funções existem
SELECT 'Funções existentes:' as info;
SELECT 
  proname as nome_funcao,
  prosrc as codigo_fonte
FROM pg_proc 
WHERE proname IN (
  'gerar_certificado_dinamico',
  'buscar_certificados_usuario_dinamico',
  'validar_certificado_dinamico',
  'calcular_carga_horaria_curso',
  'gerar_numero_certificado'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ========================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as info;

-- Verificar políticas da tabela certificados
SELECT 'Políticas certificados:' as info;
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
WHERE tablename = 'certificados'
AND schemaname = 'public';

-- Verificar se RLS está habilitado
SELECT 'RLS habilitado:' as info;
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('certificados', 'progresso_quiz', 'curso_quiz_mapping')
AND schemaname = 'public';

-- ========================================
-- 5. TESTAR FUNÇÕES COM DADOS REAIS
-- ========================================

SELECT '=== TESTANDO FUNÇÕES ===' as info;

-- Testar busca de certificados para um usuário específico
-- (Substitua 'SEU_USER_ID' pelo ID real de um usuário)
SELECT 'Teste buscar_certificados_usuario_dinamico:' as info;
-- SELECT * FROM buscar_certificados_usuario_dinamico('SEU_USER_ID');

-- Testar cálculo de carga horária
SELECT 'Teste calcular_carga_horaria_curso:' as info;
SELECT
  c.nome as curso,
  calcular_carga_horaria_curso(c.id) as carga_horaria_horas
FROM public.cursos c
LIMIT 5;

-- Testar geração de número de certificado
SELECT 'Teste gerar_numero_certificado:' as info;
SELECT
  c.nome as curso,
  gerar_numero_certificado(c.id, '00000000-0000-0000-0000-000000000000') as numero_exemplo
FROM public.cursos c
LIMIT 3;

-- ========================================
-- 6. VERIFICAR RELACIONAMENTOS
-- ========================================

SELECT '=== VERIFICANDO RELACIONAMENTOS ===' as info;

-- Verificar se usuários têm progresso de quiz aprovado
SELECT 'Usuários com quiz aprovado:' as info;
SELECT
  u.email,
  COUNT(pq.id) as total_quizzes_aprovados,
  STRING_AGG(q.titulo, ', ') as quizzes_aprovados
FROM public.usuarios u
JOIN public.progresso_quiz pq ON u.id = pq.usuario_id
JOIN public.quizzes q ON pq.quiz_id = q.id
WHERE pq.aprovado = true
GROUP BY u.id, u.email
ORDER BY total_quizzes_aprovados DESC;

-- Verificar se cursos têm mapeamento com quiz
SELECT 'Cursos sem mapeamento de quiz:' as info;
SELECT
  c.id,
  c.nome,
  c.categoria
FROM public.cursos c
LEFT JOIN public.curso_quiz_mapping cqm ON c.id = cqm.curso_id
WHERE cqm.curso_id IS NULL;

-- Verificar se quizzes estão ativos
SELECT 'Quizzes por status:' as info;
SELECT
  ativo,
  COUNT(*) as quantidade
FROM public.quizzes
GROUP BY ativo;

-- ========================================
-- 7. VERIFICAR DADOS DE EXEMPLO
-- ========================================

SELECT '=== DADOS DE EXEMPLO ===' as info;

-- Mostrar alguns usuários
SELECT 'Usuários de exemplo:' as info;
SELECT
  id,
  email,
  nome,
  tipo_usuario
FROM public.usuarios
LIMIT 5;

-- Mostrar alguns cursos
SELECT 'Cursos de exemplo:' as info;
SELECT
  id,
  nome,
  categoria
FROM public.cursos
LIMIT 5;

-- Mostrar alguns quizzes
SELECT 'Quizzes de exemplo:' as info;
SELECT
  id,
  titulo,
  ativo
FROM public.quizzes
LIMIT 5;

-- ========================================
-- 8. SUGESTÕES DE CORREÇÃO
-- ========================================

SELECT '=== SUGESTÕES DE CORREÇÃO ===' as info;

-- Verificar se há certificados duplicados
SELECT 'Possíveis certificados duplicados:' as info;
SELECT
  usuario_id,
  curso_id,
  COUNT(*) as quantidade
FROM public.certificados
GROUP BY usuario_id, curso_id
HAVING COUNT(*) > 1;

-- Verificar certificados sem número único
SELECT 'Certificados sem número único:' as info;
SELECT
  id,
  usuario_id,
  curso_id,
  numero_certificado
FROM public.certificados
WHERE numero_certificado IS NULL OR numero_certificado = '';

-- ========================================
-- 9. COMANDOS PARA CORREÇÃO
-- ========================================

SELECT '=== COMANDOS PARA CORREÇÃO ===' as info;

-- Se não houver certificados, execute:
-- SELECT 'Para gerar certificados de teste:' as comando;
-- SELECT '1. Execute o script sistema-certificados-dinamico.sql' as passo;
-- SELECT '2. Verifique se as funções foram criadas' as passo;
-- SELECT '3. Teste a geração manual de certificados' as passo;

-- Se houver problemas de RLS, execute:
-- SELECT 'Para corrigir RLS:' as comando;
-- SELECT '1. Execute o script corrigir-rls-quiz-certificados.sql' as passo;

-- Se houver problemas de mapeamento, execute:
-- SELECT 'Para corrigir mapeamento:' as comando;
-- SELECT '1. Execute o script criar-mapeamento-quiz.sql' as passo;

SELECT '=== DIAGNÓSTICO CONCLUÍDO ===' as info;
