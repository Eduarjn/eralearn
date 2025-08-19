-- ========================================
-- CORRIGIR ESTRUTURA DAS TABELAS
-- ========================================
-- Este script corrige a estrutura das tabelas que estão causando erros

-- 1. Verificar se a coluna categoria_id existe em certificados
SELECT '=== VERIFICANDO COLUNA CATEGORIA_ID ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificados' AND column_name = 'categoria_id')
        THEN '✅ Coluna categoria_id existe'
        ELSE '❌ Coluna categoria_id não existe'
    END as status;

-- 2. Verificar se a coluna categoria existe em certificados
SELECT '=== VERIFICANDO COLUNA CATEGORIA ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificados' AND column_name = 'categoria')
        THEN '✅ Coluna categoria existe'
        ELSE '❌ Coluna categoria não existe'
    END as status;

-- 3. Adicionar coluna categoria se não existir
SELECT '=== ADICIONANDO COLUNA CATEGORIA ===' as info;
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

-- 4. Verificar estrutura da tabela progresso_quiz
SELECT '=== VERIFICANDO ESTRUTURA PROGRESSO_QUIZ ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz'
ORDER BY ordinal_position;

-- 5. Verificar se as colunas necessárias existem em progresso_quiz
SELECT '=== VERIFICANDO COLUNAS PROGRESSO_QUIZ ===' as info;
SELECT 
    'usuario_id' as coluna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progresso_quiz' AND column_name = 'usuario_id')
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
UNION ALL
SELECT 
    'quiz_id' as coluna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progresso_quiz' AND column_name = 'quiz_id')
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
UNION ALL
SELECT 
    'aprovado' as coluna,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progresso_quiz' AND column_name = 'aprovado')
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status;

-- 6. Criar tabela progresso_quiz se não existir
SELECT '=== CRIANDO TABELA PROGRESSO_QUIZ ===' as info;
CREATE TABLE IF NOT EXISTS progresso_quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    aprovado BOOLEAN DEFAULT false,
    pontuacao INTEGER DEFAULT 0,
    tentativas INTEGER DEFAULT 0,
    data_tentativa TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, quiz_id)
);

-- 7. Verificar se a tabela foi criada corretamente
SELECT '=== VERIFICANDO TABELA CRIADA ===' as info;
SELECT 
    'Tabela progresso_quiz criada/verificada' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz';

-- 8. Verificar estrutura da tabela quizzes
SELECT '=== VERIFICANDO ESTRUTURA QUIZZES ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes'
ORDER BY ordinal_position;

-- 9. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Estrutura das tabelas corrigida' as status;
SELECT '✅ Coluna categoria adicionada em certificados' as status;
SELECT '✅ Tabela progresso_quiz criada/verificada' as status;
SELECT 'Agora execute o script corrigir-erros-quiz-definitivo.sql' as proximo_passo;









