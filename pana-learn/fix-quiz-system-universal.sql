-- Script para configurar sistema de quiz universal para todos os cursos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
FROM (VALUES ('quizzes'), ('quiz_perguntas')) as t(table_name);

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

-- 3. Verificar categorias existentes
SELECT '=== CATEGORIAS EXISTENTES ===' as info;

SELECT DISTINCT categoria FROM cursos WHERE categoria IS NOT NULL ORDER BY categoria;

-- 4. Criar quiz universal para todas as categorias
DO $$
DECLARE
    categoria_record RECORD;
    quiz_id UUID;
BEGIN
    -- Para cada categoria existente, criar um quiz
    FOR categoria_record IN 
        SELECT DISTINCT categoria 
        FROM cursos 
        WHERE categoria IS NOT NULL 
        AND categoria != ''
    LOOP
        -- Verificar se já existe quiz para esta categoria
        IF NOT EXISTS (SELECT 1 FROM quizzes WHERE categoria = categoria_record.categoria) THEN
            RAISE NOTICE 'Criando quiz para categoria: %', categoria_record.categoria;
            
            -- Inserir quiz
            INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo)
            VALUES (
                gen_random_uuid(),
                'Quiz: ' || categoria_record.categoria,
                'Teste seus conhecimentos sobre ' || categoria_record.categoria,
                categoria_record.categoria,
                70,
                TRUE
            ) RETURNING id INTO quiz_id;
            
            RAISE NOTICE 'Quiz criado com ID: % para categoria: %', quiz_id, categoria_record.categoria;
            
            -- Inserir perguntas genéricas para esta categoria
            INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
            (quiz_id, 'Qual é o objetivo principal deste curso?', 
             ARRAY['Aprender conceitos básicos', 'Desenvolver habilidades avançadas', 'Obter certificação', 'Todas as opções acima'], 
             3, 'O objetivo é fornecer conhecimento completo sobre o tema.', 1),
            
            (quiz_id, 'Qual a importância deste conteúdo para sua carreira?', 
             ARRAY['Baixa importância', 'Importância média', 'Alta importância', 'Essencial'], 
             2, 'Este conteúdo é fundamental para o desenvolvimento profissional.', 2),
            
            (quiz_id, 'Como você aplicaria este conhecimento na prática?', 
             ARRAY['Apenas na teoria', 'Em projetos simples', 'Em projetos complexos', 'Em qualquer situação'], 
             3, 'O conhecimento deve ser aplicado em situações reais.', 3),
            
            (quiz_id, 'Qual a melhor forma de continuar aprendendo sobre este tema?', 
             ARRAY['Parar de estudar', 'Estudar ocasionalmente', 'Estudar regularmente', 'Estudar constantemente'], 
             2, 'O aprendizado contínuo é essencial.', 4),
            
            (quiz_id, 'Qual sua opinião sobre a qualidade deste curso?', 
             ARRAY['Ruim', 'Regular', 'Bom', 'Excelente'], 
             2, 'Avalie o curso de forma objetiva.', 5);
            
            RAISE NOTICE '5 perguntas inseridas para categoria: %', categoria_record.categoria;
        ELSE
            RAISE NOTICE 'Quiz já existe para categoria: %', categoria_record.categoria;
        END IF;
    END LOOP;
END $$;

-- 5. Criar quiz específico para PABX (se não existir)
DO $$
DECLARE
    quiz_id UUID;
    categoria_pabx VARCHAR(100) := 'PABX';
BEGIN
    -- Verificar se há quiz para PABX
    IF NOT EXISTS (SELECT 1 FROM quizzes WHERE categoria = categoria_pabx) THEN
        RAISE NOTICE 'Criando quiz específico para PABX...';
        
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
        
        -- Inserir perguntas específicas para PABX
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
        
        RAISE NOTICE '5 perguntas específicas inseridas para PABX';
    ELSE
        RAISE NOTICE 'Quiz PABX já existe';
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

-- 7. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_perguntas')
ORDER BY tablename, policyname;

-- 8. Adicionar políticas RLS se não existirem
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

-- 9. Testar consultas para diferentes categorias
SELECT '=== TESTE CONSULTAS ===' as info;

-- Testar para PABX
SELECT 
    'PABX' as categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.categoria = 'PABX' AND q.ativo = TRUE
GROUP BY q.categoria;

-- Testar para outras categorias
SELECT 
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE q.ativo = TRUE
GROUP BY q.categoria
ORDER BY q.categoria;

-- 10. Verificar se todos os cursos têm quiz
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    c.categoria,
    CASE 
        WHEN q.id IS NOT NULL THEN 'TEM QUIZ'
        ELSE 'SEM QUIZ'
    END as status_quiz,
    COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN quizzes q ON c.categoria = q.categoria AND q.ativo = TRUE
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.categoria IS NOT NULL
GROUP BY c.categoria, q.id
ORDER BY c.categoria;

-- 11. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Sistema de quiz universal configurado!' as status,
    'Agora todos os cursos têm quiz disponível.' as mensagem,
    'Teste acessando qualquer curso concluído e clicando em "Apresentar Prova".' as proximo_passo; 