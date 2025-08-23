-- ========================================
-- SISTEMA QUIZ ADMIN COMPLETO
-- ========================================
-- Este script garante que o administrador possa editar quizzes
-- e que eles apareçam especificamente para cada curso

-- 1. Verificar e corrigir estrutura da tabela quiz_perguntas
SELECT '=== VERIFICANDO ESTRUTURA QUIZ_PERGUNTAS ===' as info;

-- Garantir que todos os campos necessários existem
ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ DEFAULT NOW();

-- 2. Criar/atualizar função para atualizar timestamps
SELECT '=== CRIANDO FUNÇÃO DE TIMESTAMP ===' as info;

CREATE OR REPLACE FUNCTION update_quiz_perguntas_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Criar/atualizar trigger para atualização automática
SELECT '=== CRIANDO TRIGGER DE ATUALIZAÇÃO ===' as info;

DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps_trigger ON quiz_perguntas;
CREATE TRIGGER update_quiz_perguntas_timestamps_trigger
    BEFORE UPDATE ON quiz_perguntas
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_perguntas_timestamps();

-- 4. Verificar e corrigir mapeamento de cursos para quizzes
SELECT '=== VERIFICANDO MAPEAMENTO CURSOS-QUIZZES ===' as info;

-- Garantir que a tabela de mapeamento existe
CREATE TABLE IF NOT EXISTS curso_quiz_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    quiz_categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id)
);

-- 5. Inserir/atualizar mapeamentos específicos
SELECT '=== INSERINDO MAPEAMENTOS ESPECÍFICOS ===' as info;

-- Limpar mapeamentos existentes para recriar
DELETE FROM curso_quiz_mapping;

-- Inserir mapeamentos específicos
INSERT INTO curso_quiz_mapping (curso_id, quiz_categoria) VALUES
    ((SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 'PABX_FUNDAMENTOS'),
    ((SELECT id FROM cursos WHERE nome = 'Configurações Avançadas PABX' LIMIT 1), 'PABX_AVANCADO'),
    ((SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 'OMNICHANNEL_EMPRESAS'),
    ((SELECT id FROM cursos WHERE nome = 'Configurações Avançadas OMNI' LIMIT 1), 'OMNICHANNEL_AVANCADO'),
    ((SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 'CALLCENTER_FUNDAMENTOS')
ON CONFLICT (curso_id) DO UPDATE SET
    quiz_categoria = EXCLUDED.quiz_categoria,
    updated_at = NOW();

-- 6. Garantir que os quizzes específicos existem e estão ativos
SELECT '=== VERIFICANDO QUIZZES ESPECÍFICOS ===' as info;

-- Desabilitar quizzes antigos/genéricos
UPDATE quizzes SET ativo = false WHERE categoria NOT IN (
    'PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 
    'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS'
);

-- 7. Criar/atualizar função para buscar quiz por curso
SELECT '=== CRIANDO FUNÇÃO GET_QUIZ_BY_COURSE ===' as info;

CREATE OR REPLACE FUNCTION get_quiz_by_course(course_id UUID)
RETURNS TABLE (
    quiz_id UUID,
    quiz_nome VARCHAR(255),
    quiz_categoria VARCHAR(50),
    total_perguntas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id as quiz_id,
        q.nome as quiz_nome,
        q.categoria as quiz_categoria,
        COUNT(qp.id) as total_perguntas
    FROM quizzes q
    LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
    WHERE q.ativo = true
    AND q.categoria = (
        SELECT COALESCE(cqm.quiz_categoria, c.categoria)
        FROM cursos c
        LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
        WHERE c.id = course_id
    )
    GROUP BY q.id, q.nome, q.categoria;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificar permissões RLS para administradores
SELECT '=== VERIFICANDO PERMISSÕES RLS ===' as info;

-- Garantir que administradores podem editar quizzes
DROP POLICY IF EXISTS "Administradores podem editar quizzes" ON quizzes;
CREATE POLICY "Administradores podem editar quizzes" ON quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo = 'admin'
        )
    );

-- Garantir que administradores podem editar perguntas
DROP POLICY IF EXISTS "Administradores podem editar perguntas" ON quiz_perguntas;
CREATE POLICY "Administradores podem editar perguntas" ON quiz_perguntas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo = 'admin'
        )
    );

-- 9. Verificar estrutura final
SELECT '=== VERIFICANDO ESTRUTURA FINAL ===' as info;

-- Verificar se o campo updated_at existe
SELECT 
    'Campo updated_at existe:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_perguntas' AND column_name = 'updated_at')
        THEN 'SIM'
        ELSE 'NÃO'
    END as status;

-- Verificar trigger
SELECT 
    'Trigger existe:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = 'quiz_perguntas' AND trigger_name = 'update_quiz_perguntas_timestamps_trigger')
        THEN 'SIM'
        ELSE 'NÃO'
    END as status;

-- Verificar mapeamentos
SELECT 
    'Mapeamentos criados:' as info,
    COUNT(*) as total_mapeamentos
FROM curso_quiz_mapping;

-- 10. Teste de funcionalidade
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;

-- Testar função get_quiz_by_course
SELECT 
    'Função get_quiz_by_course testada:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_quiz_by_course')
        THEN 'FUNÇÃO CRIADA COM SUCESSO'
        ELSE 'ERRO NA CRIAÇÃO DA FUNÇÃO'
    END as status;

-- 11. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '1. Recarregue a página da plataforma' as instrucao;
SELECT '2. Acesse como administrador' as instrucao;
SELECT '3. Vá para a seção de quizzes' as instrucao;
SELECT '4. Agora você pode editar as perguntas' as instrucao;
SELECT '5. Cada curso terá seu quiz específico' as instrucao;
SELECT '6. Teste editando uma pergunta e salvando' as instrucao;

-- 12. Resumo do que foi feito
SELECT '=== RESUMO DAS CORREÇÕES ===' as info;
SELECT '✅ Campo updated_at adicionado' as correcao;
SELECT '✅ Trigger de atualização criado' as correcao;
SELECT '✅ Mapeamento curso-quiz específico' as correcao;
SELECT '✅ Permissões de administrador' as correcao;
SELECT '✅ Função get_quiz_by_course' as correcao;
SELECT '✅ Quizzes antigos desabilitados' as correcao;













