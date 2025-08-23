-- ========================================
-- SISTEMA QUIZ ADMIN SIMPLES
-- ========================================
-- Versão simplificada que funciona sem problemas de triggers

-- 1. Verificar estrutura atual
SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se a tabela curso_quiz_mapping existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'curso_quiz_mapping')
        THEN '✅ Tabela curso_quiz_mapping existe'
        ELSE '❌ Tabela curso_quiz_mapping não existe'
    END as status;

-- 2. Criar tabela de mapeamento se não existir
SELECT '=== CRIANDO MAPEAMENTO ===' as info;

CREATE TABLE IF NOT EXISTS curso_quiz_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    quiz_categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id)
);

-- 3. Limpar e inserir mapeamentos corretos
SELECT '=== INSERINDO MAPEAMENTOS ===' as info;

-- Limpar mapeamentos existentes
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

-- 4. Desabilitar quizzes antigos
SELECT '=== DESABILITANDO QUIZZES ANTIGOS ===' as info;

-- Desabilitar todos os quizzes que não são específicos
UPDATE quizzes 
SET ativo = false 
WHERE categoria NOT IN (
    'PABX_FUNDAMENTOS',
    'PABX_AVANCADO', 
    'OMNICHANNEL_EMPRESAS',
    'OMNICHANNEL_AVANCADO',
    'CALLCENTER_FUNDAMENTOS'
);

-- 5. Ativar apenas os quizzes específicos
SELECT '=== ATIVANDO QUIZZES ESPECÍFICOS ===' as info;

UPDATE quizzes 
SET ativo = true 
WHERE categoria IN (
    'PABX_FUNDAMENTOS',
    'PABX_AVANCADO',
    'OMNICHANNEL_EMPRESAS', 
    'OMNICHANNEL_AVANCADO',
    'CALLCENTER_FUNDAMENTOS'
);

-- 6. Criar função para buscar quiz por curso
SELECT '=== CRIANDO FUNÇÃO ===' as info;

CREATE OR REPLACE FUNCTION get_quiz_by_course(course_id UUID)
RETURNS TABLE (quiz_id UUID, quiz_categoria VARCHAR(50), total_perguntas BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id as quiz_id,
        q.categoria as quiz_categoria,
        COUNT(qp.id) as total_perguntas
    FROM curso_quiz_mapping cqm
    JOIN quizzes q ON cqm.quiz_categoria = q.categoria
    LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
    WHERE cqm.curso_id = course_id
      AND q.ativo = true
    GROUP BY q.id, q.categoria;
END;
$$;

-- 7. Configurar permissões simples
SELECT '=== CONFIGURANDO PERMISSÕES ===' as info;

-- Habilitar RLS nas tabelas
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas ENABLE ROW LEVEL SECURITY;

-- Política simples para quizzes (permitir tudo)
DROP POLICY IF EXISTS "Permitir acesso a quizzes" ON quizzes;
CREATE POLICY "Permitir acesso a quizzes" ON quizzes
    FOR ALL USING (true);

-- Política simples para quiz_perguntas (permitir tudo)
DROP POLICY IF EXISTS "Permitir edição de perguntas" ON quiz_perguntas;
CREATE POLICY "Permitir edição de perguntas" ON quiz_perguntas
    FOR ALL USING (true);

-- 8. Verificar resultado
SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar mapeamentos criados
SELECT 
    c.nome as curso,
    cqm.quiz_categoria as categoria_quiz,
    q.ativo as quiz_ativo
FROM cursos c
JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_categoria = q.categoria
ORDER BY c.nome;

-- Verificar quizzes ativos
SELECT 
    id,
    categoria,
    ativo
FROM quizzes 
WHERE ativo = true
ORDER BY categoria;

-- 9. Testar função
SELECT '=== TESTANDO FUNÇÃO ===' as info;

-- Testar função para um curso específico
SELECT 
    c.nome as curso,
    gq.quiz_id,
    gq.quiz_categoria,
    gq.total_perguntas
FROM cursos c
CROSS JOIN LATERAL get_quiz_by_course(c.id) gq
WHERE c.nome LIKE '%PABX%'
ORDER BY c.nome;

-- 10. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Sistema quiz admin configurado' as status;
SELECT '✅ Mapeamento curso-quiz criado' as status;
SELECT '✅ Quizzes específicos ativados' as status;
SELECT '✅ Permissões configuradas' as status;
SELECT '✅ Função get_quiz_by_course criada' as status;
SELECT '1. Recarregue a plataforma' as instrucao;
SELECT '2. Teste editar uma pergunta de quiz' as instrucao;
SELECT '3. Cada curso terá seu quiz específico' as instrucao;













