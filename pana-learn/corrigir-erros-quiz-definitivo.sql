-- ========================================
-- CORRIGIR ERROS QUIZ DEFINITIVO
-- ========================================
-- Este script corrige todos os erros identificados no console

-- 1. Verificar estrutura da tabela certificados
SELECT '=== VERIFICANDO ESTRUTURA CERTIFICADOS ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'certificados'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela progresso_quiz
SELECT '=== VERIFICANDO ESTRUTURA PROGRESSO_QUIZ ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela quizzes
SELECT '=== VERIFICANDO ESTRUTURA QUIZZES ===' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'quizzes'
ORDER BY ordinal_position;

-- 4. Verificar mapeamento atual
SELECT '=== VERIFICANDO MAPEAMENTO ATUAL ===' as info;
SELECT 
    c.nome as curso,
    c.categoria as categoria_curso,
    cqm.quiz_categoria as categoria_quiz
FROM cursos c
LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
WHERE c.nome LIKE '%PABX%'
ORDER BY c.nome;

-- 5. Verificar quizzes existentes
SELECT '=== VERIFICANDO QUIZZES EXISTENTES ===' as info;
SELECT 
    id,
    categoria,
    ativo
FROM quizzes 
WHERE categoria LIKE '%PABX%'
ORDER BY categoria;

-- 6. Corrigir mapeamento específico para PABX
SELECT '=== CORRIGINDO MAPEAMENTO PABX ===' as info;

-- Atualizar mapeamento para Configurações Avançadas PABX
UPDATE curso_quiz_mapping 
SET quiz_categoria = 'PABX_AVANCADO'
WHERE curso_id = (
    SELECT id FROM cursos 
    WHERE nome = 'Configurações Avançadas PABX' 
    LIMIT 1
);

-- Atualizar mapeamento para Fundamentos de PABX
UPDATE curso_quiz_mapping 
SET quiz_categoria = 'PABX_FUNDAMENTOS'
WHERE curso_id = (
    SELECT id FROM cursos 
    WHERE nome = 'Fundamentos de PABX' 
    LIMIT 1
);

-- 7. Garantir que apenas o quiz correto esteja ativo para cada categoria
SELECT '=== ATIVANDO QUIZZES CORRETOS ===' as info;

-- Desabilitar todos os quizzes PABX primeiro
UPDATE quizzes 
SET ativo = false 
WHERE categoria LIKE '%PABX%';

-- Ativar apenas o quiz de PABX_FUNDAMENTOS
UPDATE quizzes 
SET ativo = true 
WHERE categoria = 'PABX_FUNDAMENTOS';

-- Ativar apenas o quiz de PABX_AVANCADO
UPDATE quizzes 
SET ativo = true 
WHERE categoria = 'PABX_AVANCADO';

-- 8. Verificar resultado final
SELECT '=== RESULTADO FINAL ===' as info;

-- Verificar mapeamento corrigido
SELECT 
    c.nome as curso,
    cqm.quiz_categoria as categoria_quiz,
    q.ativo as quiz_ativo
FROM cursos c
JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_categoria = q.categoria
WHERE c.nome LIKE '%PABX%'
ORDER BY c.nome;

-- 9. Verificar quizzes ativos
SELECT '=== QUIZZES ATIVOS ===' as info;
SELECT 
    id,
    categoria,
    ativo
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- 10. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Mapeamento corrigido' as status;
SELECT '✅ Quizzes ativos configurados' as status;
SELECT '✅ Agora cada curso terá seu quiz específico' as status;
SELECT '1. Recarregue a plataforma' as instrucao;
SELECT '2. Teste o curso "Configurações Avançadas PABX"' as instrucao;
SELECT '3. Deve aparecer apenas o quiz PABX_AVANCADO' as instrucao;













