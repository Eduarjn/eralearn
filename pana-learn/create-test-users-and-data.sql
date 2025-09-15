-- ========================================
-- CRIAR USUÁRIOS DE TESTE E DADOS PARA QUIZZES
-- ========================================

-- 1. Verificar e criar usuários de teste
DO $$
BEGIN
    -- Verificar se tabela usuarios existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        CREATE TABLE usuarios (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID,
            email VARCHAR(255) UNIQUE NOT NULL,
            nome VARCHAR(255) NOT NULL,
            tipo_usuario VARCHAR(50) DEFAULT 'cliente',
            status VARCHAR(50) DEFAULT 'ativo',
            empresa_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Habilitar RLS
        ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
        
        -- Política para usuários verem apenas seus próprios dados
        CREATE POLICY "Usuários podem ver próprios dados" 
        ON usuarios FOR SELECT 
        TO authenticated 
        USING (auth.uid() = user_id);
        
        -- Política para admins verem todos os dados
        CREATE POLICY "Admins podem ver todos os usuários" 
        ON usuarios FOR ALL 
        TO authenticated 
        USING (tipo_usuario IN ('admin', 'admin_master'));
    END IF;
END $$;

-- 2. Limpar usuários de teste existentes
DELETE FROM usuarios WHERE email IN ('admin@eralearn.com', 'cliente@eralearn.com', 'teste@eralearn.com');

-- 3. Inserir usuários de teste
INSERT INTO usuarios (id, email, nome, tipo_usuario, status) VALUES
-- Admin de teste
('550e8400-e29b-41d4-a716-446655441001', 'admin@eralearn.com', 'Administrador Teste', 'admin_master', 'ativo'),
-- Cliente de teste
('550e8400-e29b-41d4-a716-446655441002', 'cliente@eralearn.com', 'Cliente Teste', 'cliente', 'ativo'),
-- Usuário adicional
('550e8400-e29b-41d4-a716-446655441003', 'teste@eralearn.com', 'Usuário Teste', 'cliente', 'ativo');

-- 4. Verificar e criar tabela de vídeos se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        CREATE TABLE videos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT,
            categoria VARCHAR(100),
            url_video TEXT,
            youtube_id VARCHAR(50),
            duracao INTEGER DEFAULT 0,
            ordem INTEGER DEFAULT 1,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Vídeos são visíveis para usuários autenticados" 
        ON videos FOR SELECT 
        TO authenticated 
        USING (ativo = true);
    END IF;
END $$;

-- 5. Verificar e criar tabela de progresso de vídeos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        CREATE TABLE video_progress (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL,
            video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
            progresso DECIMAL(5,2) DEFAULT 0,
            concluido BOOLEAN DEFAULT false,
            tempo_assistido INTEGER DEFAULT 0,
            ultima_posicao INTEGER DEFAULT 0,
            data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
            data_conclusao TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Usuários podem ver próprio progresso de vídeo" 
        ON video_progress FOR SELECT 
        TO authenticated 
        USING (auth.uid()::text = usuario_id::text);
        
        CREATE POLICY "Usuários podem criar próprio progresso de vídeo" 
        ON video_progress FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid()::text = usuario_id::text);
        
        CREATE POLICY "Usuários podem atualizar próprio progresso de vídeo" 
        ON video_progress FOR UPDATE 
        TO authenticated 
        USING (auth.uid()::text = usuario_id::text);
    END IF;
END $$;

-- 6. Inserir vídeos de exemplo para cada categoria
INSERT INTO videos (id, titulo, descricao, categoria, youtube_id, duracao, ordem, ativo) VALUES
-- PABX Fundamentos
('550e8400-e29b-41d4-a716-446655442001', 'Introdução ao PABX', 'Conceitos básicos sobre sistemas PABX', 'PABX_FUNDAMENTOS', 'dQw4w9WgXcQ', 600, 1, true),
('550e8400-e29b-41d4-a716-446655442002', 'Configuração Básica PABX', 'Como configurar um PABX básico', 'PABX_FUNDAMENTOS', '9bZkp7q19f0', 800, 2, true),

-- PABX Avançado
('550e8400-e29b-41d4-a716-446655442003', 'PABX IP Avançado', 'Configurações avançadas de PABX IP', 'PABX_AVANCADO', 'dQw4w9WgXcQ', 1200, 1, true),
('550e8400-e29b-41d4-a716-446655442004', 'Troubleshooting PABX', 'Resolução de problemas em PABX', 'PABX_AVANCADO', '9bZkp7q19f0', 900, 2, true),

-- Omnichannel Empresas
('550e8400-e29b-41d4-a716-446655442005', 'Introdução ao Omnichannel', 'Conceitos de atendimento omnichannel', 'OMNICHANNEL_EMPRESAS', 'dQw4w9WgXcQ', 700, 1, true),
('550e8400-e29b-41d4-a716-446655442006', 'Implementação Omnichannel', 'Como implementar soluções omnichannel', 'OMNICHANNEL_EMPRESAS', '9bZkp7q19f0', 1000, 2, true),

-- Omnichannel Avançado
('550e8400-e29b-41d4-a716-446655442007', 'Automação Omnichannel', 'Automação avançada em omnichannel', 'OMNICHANNEL_AVANCADO', 'dQw4w9WgXcQ', 1100, 1, true),
('550e8400-e29b-41d4-a716-446655442008', 'Analytics Omnichannel', 'Análise de dados em omnichannel', 'OMNICHANNEL_AVANCADO', '9bZkp7q19f0', 950, 2, true),

-- CallCenter Fundamentos
('550e8400-e29b-41d4-a716-446655442009', 'Fundamentos de CallCenter', 'Conceitos básicos de call center', 'CALLCENTER_FUNDAMENTOS', 'dQw4w9WgXcQ', 650, 1, true),
('550e8400-e29b-41d4-a716-446655442010', 'Métricas de CallCenter', 'Principais métricas de call center', 'CALLCENTER_FUNDAMENTOS', '9bZkp7q19f0', 750, 2, true);

-- 7. Criar progresso de vídeos para o usuário teste (simular que assistiu alguns vídeos)
INSERT INTO video_progress (usuario_id, video_id, progresso, concluido, tempo_assistido, data_conclusao) 
SELECT 
    '550e8400-e29b-41d4-a716-446655441002'::uuid as usuario_id,
    v.id as video_id,
    100.00 as progresso,
    true as concluido,
    v.duracao as tempo_assistido,
    now() - interval '1 day' as data_conclusao
FROM videos v 
WHERE v.categoria = 'PABX_FUNDAMENTOS';

-- 8. Verificar se tabela certificados existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificados') THEN
        CREATE TABLE certificados (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL,
            curso_id VARCHAR(100) NOT NULL,
            usuario_nome VARCHAR(255) NOT NULL,
            usuario_email VARCHAR(255) NOT NULL,
            curso_nome VARCHAR(255) NOT NULL,
            nota_obtida INTEGER NOT NULL,
            data_conclusao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            certificado_url TEXT,
            qr_code_url TEXT,
            numero_certificado VARCHAR(50) UNIQUE DEFAULT CONCAT('CERT-', EXTRACT(YEAR FROM now()), '-', LPAD(nextval('certificado_seq')::text, 6, '0')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Criar sequência para números de certificado
        CREATE SEQUENCE IF NOT EXISTS certificado_seq START 1;
        
        ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Usuários podem ver próprios certificados" 
        ON certificados FOR SELECT 
        TO authenticated 
        USING (auth.uid()::text = usuario_id::text);
        
        CREATE POLICY "Sistema pode criar certificados" 
        ON certificados FOR INSERT 
        TO authenticated 
        WITH CHECK (true);
    END IF;
END $$;

-- 9. Atualizar funções de permissão para permitir acesso aos dados
-- Garantir que as funções criadas no script anterior funcionem corretamente

-- 10. Testar se tudo está funcionando
SELECT 'Usuários criados:' as info, COUNT(*) as total FROM usuarios;
SELECT 'Quizzes disponíveis:' as info, COUNT(*) as total FROM quizzes WHERE ativo = true;
SELECT 'Perguntas criadas:' as info, COUNT(*) as total FROM quiz_perguntas;
SELECT 'Vídeos disponíveis:' as info, COUNT(*) as total FROM videos WHERE ativo = true;
SELECT 'Progresso simulado:' as info, COUNT(*) as total FROM video_progress;

-- Testar função de liberação de quiz
SELECT 
    'Quiz liberado para PABX_FUNDAMENTOS:' as teste,
    liberar_quiz_curso('550e8400-e29b-41d4-a716-446655441002', 'PABX_FUNDAMENTOS') as quiz_id;

COMMIT;






















