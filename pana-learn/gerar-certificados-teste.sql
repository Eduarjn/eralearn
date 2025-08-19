-- ========================================
-- GERAR CERTIFICADOS DE TESTE
-- ========================================
-- Execute este script para criar certificados de teste e validar o sistema

-- ========================================
-- 1. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== VERIFICANDO DADOS PARA TESTE ===' as info;

-- Verificar usuários disponíveis
SELECT 'Usuários disponíveis:' as info;
SELECT
  id,
  email,
  nome,
  tipo_usuario
FROM public.usuarios
WHERE tipo_usuario = 'cliente'
LIMIT 5;

-- Verificar cursos disponíveis
SELECT 'Cursos disponíveis:' as info;
SELECT
  id,
  nome,
  categoria
FROM public.cursos
LIMIT 5;

-- Verificar quizzes disponíveis
SELECT 'Quizzes disponíveis:' as info;
SELECT
  id,
  titulo,
  ativo
FROM public.quizzes
WHERE ativo = true
LIMIT 5;

-- Verificar mapeamentos existentes
SELECT 'Mapeamentos curso-quiz:' as info;
SELECT
  cqm.id,
  c.nome as curso_nome,
  q.titulo as quiz_titulo
FROM public.curso_quiz_mapping cqm
JOIN public.cursos c ON cqm.curso_id = c.id
JOIN public.quizzes q ON cqm.quiz_id = q.id;

-- ========================================
-- 2. CRIAR PROGRESSO DE QUIZ DE TESTE
-- ========================================

SELECT '=== CRIANDO PROGRESSO DE QUIZ DE TESTE ===' as info;

-- Inserir progresso de quiz aprovado para o primeiro usuário cliente
-- (Substitua os IDs pelos valores reais do seu banco)

-- Exemplo para o primeiro usuário cliente:
INSERT INTO public.progresso_quiz (
  usuario_id,
  quiz_id,
  respostas,
  nota,
  aprovado,
  data_conclusao
)
SELECT 
  u.id as usuario_id,
  q.id as quiz_id,
  '{"pergunta1": 0, "pergunta2": 1, "pergunta3": 2}'::jsonb as respostas,
  85 as nota,
  true as aprovado,
  NOW() as data_conclusao
FROM public.usuarios u
CROSS JOIN public.quizzes q
WHERE u.tipo_usuario = 'cliente'
  AND q.ativo = true
  AND NOT EXISTS (
    SELECT 1 FROM public.progresso_quiz pq 
    WHERE pq.usuario_id = u.id AND pq.quiz_id = q.id
  )
LIMIT 1;

-- ========================================
-- 3. GERAR CERTIFICADOS DE TESTE
-- ========================================

SELECT '=== GERANDO CERTIFICADOS DE TESTE ===' as info;

-- Gerar certificado para o primeiro usuário que tem quiz aprovado
-- (Substitua os IDs pelos valores reais do seu banco)

-- Exemplo para gerar certificado:
SELECT 'Para gerar certificado manualmente, execute:' as instrucao;

-- Substitua os valores pelos IDs reais do seu banco:
-- SELECT gerar_certificado_dinamico(
--   'ID_DO_USUARIO_AQUI',  -- ID do usuário
--   'ID_DO_CURSO_AQUI',    -- ID do curso
--   'ID_DO_QUIZ_AQUI',     -- ID do quiz
--   85                     -- Nota
-- );

-- ========================================
-- 4. VERIFICAR SE AS FUNÇÕES EXISTEM
-- ========================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as info;

-- Verificar se a função gerar_certificado_dinamico existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'gerar_certificado_dinamico'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN 'Função gerar_certificado_dinamico EXISTE'
    ELSE 'Função gerar_certificado_dinamico NÃO EXISTE - Execute sistema-certificados-dinamico.sql'
  END as status_funcao;

-- Verificar se a função buscar_certificados_usuario_dinamico existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'buscar_certificados_usuario_dinamico'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN 'Função buscar_certificados_usuario_dinamico EXISTE'
    ELSE 'Função buscar_certificados_usuario_dinamico NÃO EXISTE - Execute sistema-certificados-dinamico.sql'
  END as status_funcao;

-- ========================================
-- 5. TESTAR GERAÇÃO MANUAL
-- ========================================

SELECT '=== TESTE MANUAL ===' as info;

-- Para testar manualmente, execute os seguintes comandos:

-- 1. Pegue um ID de usuário:
SELECT 'ID de usuário para teste:' as info;
SELECT id, email FROM public.usuarios WHERE tipo_usuario = 'cliente' LIMIT 1;

-- 2. Pegue um ID de curso:
SELECT 'ID de curso para teste:' as info;
SELECT id, nome FROM public.cursos LIMIT 1;

-- 3. Pegue um ID de quiz:
SELECT 'ID de quiz para teste:' as info;
SELECT id, titulo FROM public.quizzes WHERE ativo = true LIMIT 1;

-- 4. Execute a geração (substitua os IDs pelos valores reais):
-- SELECT gerar_certificado_dinamico(
--   'ID_USUARIO_AQUI',
--   'ID_CURSO_AQUI', 
--   'ID_QUIZ_AQUI',
--   85
-- );

-- 5. Verifique se foi criado:
-- SELECT * FROM public.certificados ORDER BY data_emissao DESC LIMIT 5;

-- ========================================
-- 6. VERIFICAR RESULTADO
-- ========================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar certificados criados
SELECT 'Certificados existentes:' as info;
SELECT
  c.id,
  c.numero_certificado,
  c.curso_nome,
  c.nota,
  c.status,
  c.data_emissao,
  u.email as usuario_email
FROM public.certificados c
JOIN public.usuarios u ON c.usuario_id = u.id
ORDER BY c.data_emissao DESC
LIMIT 10;

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
WHERE pq.aprovado = true
ORDER BY pq.data_conclusao DESC
LIMIT 10;

-- ========================================
-- 7. COMANDOS PARA EXECUTAR MANUALMENTE
-- ========================================

SELECT '=== COMANDOS PARA EXECUTAR ===' as info;

SELECT '1. Execute o diagnóstico completo:' as comando;
SELECT '   diagnostico-certificados-completo.sql' as arquivo;

SELECT '2. Se as funções não existem, execute:' as comando;
SELECT '   sistema-certificados-dinamico.sql' as arquivo;

SELECT '3. Se há problemas de RLS, execute:' as comando;
SELECT '   corrigir-rls-quiz-certificados.sql' as arquivo;

SELECT '4. Se há problemas de mapeamento, execute:' as comando;
SELECT '   criar-mapeamento-quiz.sql' as arquivo;

SELECT '5. Para gerar certificado manualmente:' as comando;
SELECT '   - Pegue um ID de usuário da lista acima' as passo;
SELECT '   - Pegue um ID de curso da lista acima' as passo;
SELECT '   - Pegue um ID de quiz da lista acima' as passo;
SELECT '   - Execute: SELECT gerar_certificado_dinamico(ID_USUARIO, ID_CURSO, ID_QUIZ, 85);' as passo;

SELECT '=== TESTE CONCLUÍDO ===' as info;
