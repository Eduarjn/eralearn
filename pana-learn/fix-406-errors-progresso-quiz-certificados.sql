-- ========================================
-- CORREÇÃO DE ERROS 406 - PROGRESSO_QUIZ E CERTIFICADOS
-- ========================================

-- Verificar se as tabelas existem
DO $$
BEGIN
    -- Verificar se a tabela progresso_quiz existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'progresso_quiz') THEN
        RAISE NOTICE 'Tabela progresso_quiz não existe. Criando...';
        
        CREATE TABLE public.progresso_quiz (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
            quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
            respostas JSONB NOT NULL DEFAULT '{}',
            nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
            aprovado BOOLEAN DEFAULT FALSE,
            data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            UNIQUE(usuario_id, quiz_id)
        );
    END IF;

    -- Verificar se a tabela certificados existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'certificados') THEN
        RAISE NOTICE 'Tabela certificados não existe. Criando...';
        
        CREATE TABLE public.certificados (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
            curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
            categoria VARCHAR(100) NOT NULL,
            quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
            nota_final NUMERIC(5,2) NOT NULL CHECK (nota_final >= 0 AND nota_final <= 100),
            link_pdf_certificado TEXT,
            numero_certificado VARCHAR(100) UNIQUE,
            qr_code_url TEXT,
            status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado')),
            data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            UNIQUE(usuario_id, categoria)
        );
    END IF;
END $$;

-- ========================================
-- REMOVER POLÍTICAS RLS PROBLEMÁTICAS
-- ========================================

-- Remover políticas existentes da tabela progresso_quiz
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem ver todos os progressos de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem inserir progressos de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Admins podem atualizar progressos de quiz" ON public.progresso_quiz;

-- Remover políticas existentes da tabela certificados
DROP POLICY IF EXISTS "Usuários podem ver seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem ver todos os certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem inserir certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem atualizar certificados" ON public.certificados;

-- ========================================
-- CRIAR NOVAS POLÍTICAS RLS CORRETAS
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.progresso_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Políticas para progresso_quiz
CREATE POLICY "Usuários podem ver seu próprio progresso de quiz" ON public.progresso_quiz
    FOR SELECT USING (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem inserir seu próprio progresso de quiz" ON public.progresso_quiz
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem atualizar seu próprio progresso de quiz" ON public.progresso_quiz
    FOR UPDATE USING (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- Políticas para certificados
CREATE POLICY "Usuários podem ver seus próprios certificados" ON public.certificados
    FOR SELECT USING (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem inserir seus próprios certificados" ON public.certificados
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

CREATE POLICY "Usuários podem atualizar seus próprios certificados" ON public.certificados
    FOR UPDATE USING (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

-- ========================================
-- CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_id ON public.progresso_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_quiz_id ON public.progresso_quiz(quiz_id);
CREATE INDEX IF NOT EXISTS idx_progresso_quiz_usuario_quiz ON public.progresso_quiz(usuario_id, quiz_id);

CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_curso_id ON public.certificados(curso_id);
CREATE INDEX IF NOT EXISTS idx_certificados_categoria ON public.certificados(categoria);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_curso ON public.certificados(usuario_id, curso_id);

-- ========================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Verificar estrutura da tabela progresso_quiz
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'progresso_quiz' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela certificados
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
ORDER BY ordinal_position;

-- Verificar políticas RLS ativas
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
WHERE tablename IN ('progresso_quiz', 'certificados')
ORDER BY tablename, policyname;

-- ========================================
-- TESTE DE ACESSO
-- ========================================

-- Verificar se as tabelas estão acessíveis
SELECT 'progresso_quiz' as tabela, COUNT(*) as total_registros FROM public.progresso_quiz
UNION ALL
SELECT 'certificados' as tabela, COUNT(*) as total_registros FROM public.certificados;

-- Verificar se há dados de teste
SELECT 'progresso_quiz' as tabela, COUNT(*) as registros_com_dados 
FROM public.progresso_quiz 
WHERE usuario_id IS NOT NULL
UNION ALL
SELECT 'certificados' as tabela, COUNT(*) as registros_com_dados 
FROM public.certificados 
WHERE usuario_id IS NOT NULL;
