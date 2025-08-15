-- Script para debugar e corrigir o sistema de quiz
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT '=== VERIFICANDO TABELAS ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
FROM (VALUES ('quizzes'), ('quiz_perguntas')) as t(table_name);

-- 2. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;

-- Verificar quizzes
SELECT 
    'quizzes' as tabela,
    COUNT(*) as total_registros
FROM quizzes;

-- Verificar perguntas
SELECT 
    'quiz_perguntas' as tabela,
    COUNT(*) as total_registros
FROM quiz_perguntas;

-- 3. Verificar quizzes por categoria
SELECT '=== QUIZZES POR CATEGORIA ===' as info;

SELECT 
    categoria,
    titulo,
    nota_minima,
    ativo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.categoria, q.titulo, q.nota_minima, q.ativo
ORDER BY q.categoria;

-- 4. Verificar se há quiz para PABX
SELECT '=== VERIFICANDO QUIZ PABX ===' as info;

SELECT 
    q.id,
    q.titulo,
    q.categoria,
    q.nota_minima,
    q.ativo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
GROUP BY q.id, q.titulo, q.categoria, q.nota_minima, q.ativo;

-- 5. Verificar perguntas do quiz PABX
SELECT '=== PERGUNTAS DO QUIZ PABX ===' as info;

SELECT 
    qp.id,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria = 'PABX'
ORDER BY qp.ordem;

-- 6. Testar consulta que o hook useQuiz faz
SELECT '=== TESTE CONSULTA USEQUIZ ===' as info;

-- Simular exatamente a consulta do hook useQuiz
SELECT 
    q.id, 
    q.titulo, 
    q.descricao,
    q.nota_minima,
    qp.id as pergunta_id,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.explicacao,
    qp.ordem
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
    AND q.ativo = TRUE
ORDER BY qp.ordem;

-- 7. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

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
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- 8. Se não há dados, inserir dados de teste
DO $$
DECLARE
    quiz_id UUID;
    categoria_pabx VARCHAR(100) := 'PABX';
BEGIN
    -- Verificar se há quiz para PABX
    IF NOT EXISTS (SELECT 1 FROM quizzes WHERE categoria = categoria_pabx) THEN
        RAISE NOTICE 'Criando quiz para PABX...';
        
        -- Inserir quiz
        INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo)
        VALUES (
            gen_random_uuid(),
            'Quiz: Configurações Avançadas PABX',
            'Teste seus conhecimentos sobre configurações avançadas de PABX',
            categoria_pabx,
            70,
            TRUE
        ) RETURNING id INTO quiz_id;
        
        RAISE NOTICE 'Quiz PABX criado com ID: %', quiz_id;
        
        -- Inserir perguntas
        INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
        (quiz_id, 'O que é um PABX?', 
         ARRAY['Sistema de telefonia empresarial', 'Protocolo de internet', 'Tipo de cabo de rede', 'Software de edição'], 
         0, 'PABX é um sistema de telefonia empresarial que gerencia chamadas internas e externas.', 1),
        
        (quiz_id, 'Qual a principal função de um Dialplan?', 
         ARRAY['Gerenciar roteamento de chamadas', 'Configurar IP', 'Instalar software', 'Conectar à internet'], 
         0, 'O Dialplan define como as chamadas são roteadas no sistema PABX.', 2),
        
        (quiz_id, 'O que significa URA?', 
         ARRAY['Unidade de Resposta Audível', 'Unidade de Rede Avançada', 'Sistema de Usuário', 'Protocolo de Áudio'], 
         0, 'URA é a Unidade de Resposta Audível que fornece menus de voz.', 3),
        
        (quiz_id, 'Qual componente gerencia filas de atendimento?', 
         ARRAY['Queue Manager', 'Call Center', 'Voice Mail', 'Extension'], 
         0, 'O Queue Manager gerencia filas de atendimento no PABX.', 4),
        
        (quiz_id, 'O que é uma extensão no PABX?', 
         ARRAY['Número interno do sistema', 'Cabo de rede', 'Software de telefone', 'Protocolo de comunicação'], 
         0, 'Extensão é o número interno que identifica um ramal no sistema PABX.', 5);
        
        RAISE NOTICE '5 perguntas inseridas para o quiz PABX';
    ELSE
        RAISE NOTICE 'Quiz PABX já existe';
    END IF;
END $$;

-- 9. Verificar dados após inserção
SELECT '=== DADOS APÓS INSERÇÃO ===' as info;

SELECT 
    q.titulo,
    q.categoria,
    q.nota_minima,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
GROUP BY q.id, q.titulo, q.categoria, q.nota_minima;

-- 10. Testar consulta final
SELECT '=== CONSULTA FINAL ===' as info;

-- Esta é a consulta que o hook useQuiz deve fazer
SELECT 
    q.id, 
    q.titulo, 
    q.descricao,
    q.nota_minima,
    qp.id as pergunta_id,
    qp.pergunta,
    qp.opcoes,
    qp.resposta_correta,
    qp.explicacao,
    qp.ordem
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
    AND q.ativo = TRUE
ORDER BY qp.ordem;

-- 11. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Sistema de quiz verificado!' as status,
    'Agora teste o quiz novamente.' as mensagem,
    'Se ainda não funcionar, verifique os logs no console do navegador.' as proximo_passo; 