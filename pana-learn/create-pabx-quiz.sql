-- Script para criar quiz do curso PABX
-- Este script configura perguntas e respostas para o quiz de conclusão

-- 1. Verificar se já existe quiz para PABX
SELECT '=== VERIFICAR QUIZ EXISTENTE ===' as info;
SELECT
    id,
    titulo,
    categoria,
    nota_minima,
    ativo
FROM quizzes
WHERE categoria = 'PABX'
ORDER BY data_criacao;

-- 2. Criar quiz para PABX se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM quizzes
        WHERE categoria = 'PABX'
    ) THEN
        INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo) VALUES
        (gen_random_uuid(), 'Quiz: Fundamentos de PABX', 'Teste seus conhecimentos sobre sistemas PABX', 'PABX', 70, true);
        
        RAISE NOTICE 'Quiz PABX criado com sucesso';
    ELSE
        RAISE NOTICE 'Quiz PABX já existe';
    END IF;
END $$;

-- 3. Obter ID do quiz criado
SELECT '=== ID DO QUIZ PABX ===' as info;
SELECT id as quiz_id FROM quizzes WHERE categoria = 'PABX' LIMIT 1;

-- 4. Criar perguntas do quiz
DO $$
DECLARE
    quiz_id UUID;
BEGIN
    -- Obter ID do quiz
    SELECT id INTO quiz_id FROM quizzes WHERE categoria = 'PABX' LIMIT 1;
    
    IF quiz_id IS NOT NULL THEN
        -- Inserir perguntas
        INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
        (gen_random_uuid(), quiz_id, 'O que significa PABX?', 
         ARRAY['Private Automatic Branch Exchange', 'Public Automatic Branch Exchange', 'Personal Automatic Branch Exchange', 'Private Analog Branch Exchange'], 
         0, 'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado para empresas.', 1),
        
        (gen_random_uuid(), quiz_id, 'Qual é a principal função de um sistema PABX?', 
         ARRAY['Conectar apenas telefones externos', 'Gerenciar chamadas internas e externas', 'Apenas fazer chamadas internacionais', 'Apenas receber chamadas'], 
         1, 'O PABX gerencia tanto chamadas internas quanto externas, permitindo comunicação eficiente.', 2),
        
        (gen_random_uuid(), quiz_id, 'O que é URA em um sistema PABX?', 
         ARRAY['Unidade de Redirecionamento Automático', 'Unidade de Resposta Automática', 'Unidade de Recepção Automática', 'Unidade de Registro Automático'], 
         1, 'URA significa Unidade de Resposta Automática, que direciona chamadas automaticamente.', 3),
        
        (gen_random_uuid(), quiz_id, 'Qual tecnologia permite fazer chamadas pela internet?', 
         ARRAY['VoIP', 'POTS', 'ISDN', 'PSTN'], 
         0, 'VoIP (Voice over IP) permite transmitir voz pela internet.', 4),
        
        (gen_random_uuid(), quiz_id, 'O que é um ramal em um sistema PABX?', 
         ARRAY['Apenas um telefone externo', 'Uma extensão interna do sistema', 'Apenas um fax', 'Apenas um computador'], 
         1, 'Ramal é uma extensão interna do sistema PABX, permitindo comunicação interna.', 5);
        
        RAISE NOTICE 'Perguntas do quiz PABX criadas com sucesso';
    ELSE
        RAISE NOTICE 'Erro: Quiz PABX não encontrado';
    END IF;
END $$;

-- 5. Verificar perguntas criadas
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

-- 6. Verificar configuração final
SELECT '=== CONFIGURAÇÃO FINAL ===' as info;
SELECT
    q.titulo,
    q.categoria,
    q.nota_minima,
    q.ativo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
GROUP BY q.id, q.titulo, q.categoria, q.nota_minima, q.ativo; 