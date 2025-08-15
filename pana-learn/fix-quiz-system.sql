-- Script para corrigir o sistema de quiz
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se a tabela quizzes existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') 
        THEN 'Tabela quizzes existe'
        ELSE 'Tabela quizzes NÃO existe'
    END as status_quizzes;

-- Verificar se a tabela quiz_perguntas existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_perguntas') 
        THEN 'Tabela quiz_perguntas existe'
        ELSE 'Tabela quiz_perguntas NÃO existe'
    END as status_quiz_perguntas;

-- 2. Criar tabelas se não existirem
DO $$ 
BEGIN
    -- Criar tabela quizzes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        CREATE TABLE quizzes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT,
            categoria VARCHAR(100) NOT NULL,
            nota_minima INTEGER DEFAULT 70,
            ativo BOOLEAN DEFAULT TRUE,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela quizzes criada';
    END IF;
    
    -- Criar tabela quiz_perguntas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_perguntas') THEN
        CREATE TABLE quiz_perguntas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
            pergunta TEXT NOT NULL,
            opcoes TEXT[] NOT NULL,
            resposta_correta INTEGER NOT NULL,
            explicacao TEXT,
            ordem INTEGER DEFAULT 0,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela quiz_perguntas criada';
    END IF;
END $$;

-- 3. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;

SELECT COUNT(*) as total_quizzes FROM quizzes;
SELECT COUNT(*) as total_perguntas FROM quiz_perguntas;

-- 4. Inserir dados de teste para PABX
DO $$
DECLARE
    quiz_id UUID;
    categoria_pabx VARCHAR(100) := 'PABX';
BEGIN
    -- Verificar se já existe quiz para PABX
    IF NOT EXISTS (SELECT 1 FROM quizzes WHERE categoria = categoria_pabx) THEN
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

-- 5. Inserir dados de teste para outras categorias
DO $$
DECLARE
    quiz_id UUID;
BEGIN
    -- Quiz para categoria 'teste'
    IF NOT EXISTS (SELECT 1 FROM quizzes WHERE categoria = 'teste') THEN
        INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo)
        VALUES (
            gen_random_uuid(),
            'Quiz: Curso de Teste',
            'Teste seus conhecimentos sobre o curso de teste',
            'teste',
            70,
            TRUE
        ) RETURNING id INTO quiz_id;
        
        INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
        (quiz_id, 'Qual é a resposta correta?', 
         ARRAY['Opção A', 'Opção B', 'Opção C', 'Opção D'], 
         0, 'Esta é a resposta correta para teste.', 1),
        
        (quiz_id, 'Segunda pergunta de teste?', 
         ARRAY['Sim', 'Não', 'Talvez', 'Não sei'], 
         0, 'Resposta correta para segunda pergunta.', 2);
        
        RAISE NOTICE 'Quiz de teste criado';
    END IF;
END $$;

-- 6. Verificar dados inseridos
SELECT '=== DADOS INSERIDOS ===' as info;

SELECT 
    q.titulo,
    q.categoria,
    q.nota_minima,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo, q.categoria, q.nota_minima
ORDER BY q.categoria;

-- 7. Testar consulta do hook useQuiz
SELECT '=== TESTE CONSULTA ===' as info;

-- Simular a consulta que o hook faz
SELECT 
    q.id,
    q.titulo,
    q.descricao,
    q.nota_minima,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX'
    AND q.ativo = TRUE
GROUP BY q.id, q.titulo, q.descricao, q.nota_minima;

-- 8. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- 9. Adicionar políticas RLS se não existirem
DO $$
BEGIN
    -- Políticas para quizzes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Todos podem ver quizzes ativos') THEN
        CREATE POLICY "Todos podem ver quizzes ativos" ON quizzes
            FOR SELECT USING (ativo = TRUE);
        RAISE NOTICE 'Política SELECT para quizzes criada';
    END IF;
    
    -- Políticas para quiz_perguntas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_perguntas' AND policyname = 'Todos podem ver perguntas de quizzes ativos') THEN
        CREATE POLICY "Todos podem ver perguntas de quizzes ativos" ON quiz_perguntas
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM quizzes q 
                    WHERE q.id = quiz_perguntas.quiz_id 
                    AND q.ativo = TRUE
                )
            );
        RAISE NOTICE 'Política SELECT para quiz_perguntas criada';
    END IF;
END $$;

-- 10. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Sistema de quiz corrigido!' as status,
    'Agora os quizzes devem funcionar corretamente.' as mensagem,
    'Teste acessando um curso concluído e clicando em "Apresentar Prova".' as proximo_passo; 