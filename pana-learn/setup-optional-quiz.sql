-- Script opcional para configurar quiz do curso PABX
-- Este script é completamente opcional e não interfere na funcionalidade existente

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUAL ===' as info;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('quizzes', 'quiz_perguntas')
ORDER BY table_name, ordinal_position;

-- 2. Criar tabelas se não existirem (opcional)
DO $$
BEGIN
    -- Criar tabela quizzes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        CREATE TABLE quizzes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            titulo TEXT NOT NULL,
            descricao TEXT,
            categoria TEXT NOT NULL,
            nota_minima INTEGER DEFAULT 70,
            ativo BOOLEAN DEFAULT true,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela quizzes criada';
    END IF;

    -- Criar tabela quiz_perguntas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_perguntas') THEN
        CREATE TABLE quiz_perguntas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
            pergunta TEXT NOT NULL,
            opcoes TEXT[] NOT NULL,
            resposta_correta INTEGER NOT NULL,
            explicacao TEXT,
            ordem INTEGER DEFAULT 1,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela quiz_perguntas criada';
    END IF;
END $$;

-- 3. Verificar se já existe quiz para PABX
SELECT '=== QUIZ EXISTENTE PABX ===' as info;
SELECT
    id,
    titulo,
    categoria,
    nota_minima,
    ativo
FROM quizzes
WHERE categoria = 'PABX'
ORDER BY data_criacao;

-- 4. Criar quiz para PABX (apenas se não existir)
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

-- 5. Criar perguntas (apenas se não existirem)
DO $$
DECLARE
    quiz_id UUID;
    pergunta_count INTEGER;
BEGIN
    -- Obter ID do quiz
    SELECT id INTO quiz_id FROM quizzes WHERE categoria = 'PABX' LIMIT 1;
    
    -- Verificar se já existem perguntas
    SELECT COUNT(*) INTO pergunta_count FROM quiz_perguntas WHERE quiz_id = quiz_id;
    
    IF quiz_id IS NOT NULL AND pergunta_count = 0 THEN
        -- Inserir perguntas apenas se não existirem
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
        RAISE NOTICE 'Perguntas já existem ou quiz não encontrado';
    END IF;
END $$;

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

-- 7. Verificar se tudo está funcionando
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;
SELECT
    'Quiz disponível para PABX' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM quizzes WHERE categoria = 'PABX' AND ativo = true) 
        THEN '✅ Sim' 
        ELSE '❌ Não' 
    END as resultado
UNION ALL
SELECT
    'Perguntas configuradas' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM quiz_perguntas qp JOIN quizzes q ON qp.quiz_id = q.id WHERE q.categoria = 'PABX') 
        THEN '✅ Sim' 
        ELSE '❌ Não' 
    END as resultado; 