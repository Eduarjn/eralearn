-- Migration para adicionar suporte a domínios na criação de usuários
-- Execute este arquivo no Supabase SQL Editor

-- ========================================
-- 1. ADICIONAR CAMPO DOMAIN_ID NA TABELA USUARIOS
-- ========================================

-- Adicionar campo domain_id na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_domain_id ON public.usuarios(domain_id);

-- ========================================
-- 2. ATUALIZAR ENUM USER_TYPE PARA INCLUIR ADMIN_MASTER
-- ========================================

-- Verificar se admin_master já existe no enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type' AND typarray::regtype::text LIKE '%admin_master%') THEN
        -- Adicionar admin_master ao enum se não existir
        ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin_master';
    END IF;
END $$;

-- ========================================
-- 3. CRIAR TABELA DE CONFIGURAÇÕES DE DOMÍNIO
-- ========================================

CREATE TABLE IF NOT EXISTS domain_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE NOT NULL,
  config_key TEXT NOT NULL,
  config_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, config_key)
);

-- ========================================
-- 4. CRIAR TABELA DE USUÁRIOS PADRÃO POR DOMÍNIO
-- ========================================

CREATE TABLE IF NOT EXISTS domain_default_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  tipo_usuario user_type NOT NULL DEFAULT 'cliente',
  senha_padrao VARCHAR(255) NOT NULL,
  status status_type NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, email)
);

-- ========================================
-- 5. FUNÇÃO PARA CRIAR USUÁRIOS PADRÃO EM UM DOMÍNIO
-- ========================================

CREATE OR REPLACE FUNCTION setup_domain_default_users(domain_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  domain_name TEXT;
  user_record RECORD;
  created_count INTEGER := 0;
BEGIN
  -- Buscar nome do domínio
  SELECT name INTO domain_name FROM domains WHERE id = domain_uuid;
  
  IF domain_name IS NULL THEN
    RETURN 'Erro: Domínio não encontrado';
  END IF;
  
  -- Criar usuários padrão para o domínio
  INSERT INTO domain_default_users (domain_id, nome, email, tipo_usuario, senha_padrao) VALUES
    (domain_uuid, 'Administrador', 'admin@' || domain_name, 'admin', 'admin123'),
    (domain_uuid, 'Usuário Teste', 'usuario@' || domain_name, 'cliente', 'user123'),
    (domain_uuid, 'Gerente', 'gerente@' || domain_name, 'admin', 'gerente123');
  
  -- Criar os usuários reais no sistema
  FOR user_record IN 
    SELECT * FROM domain_default_users WHERE domain_id = domain_uuid
  LOOP
    BEGIN
      -- Inserir na tabela usuarios
      INSERT INTO usuarios (nome, email, tipo_usuario, status, domain_id, senha_hashed)
      VALUES (
        user_record.nome,
        user_record.email,
        user_record.tipo_usuario,
        user_record.status,
        domain_uuid,
        crypt(user_record.senha_padrao, gen_salt('bf'))
      );
      
      created_count := created_count + 1;
    EXCEPTION
      WHEN unique_violation THEN
        -- Usuário já existe, pular
        CONTINUE;
      WHEN OTHERS THEN
        -- Outro erro, registrar e continuar
        RAISE NOTICE 'Erro ao criar usuário %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN 'Domínio ' || domain_name || ' configurado com ' || created_count || ' usuários padrão criados';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. FUNÇÃO PARA CRIAR USUÁRIO EM DOMÍNIO ESPECÍFICO
-- ========================================

CREATE OR REPLACE FUNCTION create_user_in_domain(
  p_nome VARCHAR(255),
  p_email VARCHAR(255),
  p_tipo_usuario user_type,
  p_domain_id UUID,
  p_senha VARCHAR(255) DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  domain_name TEXT;
  generated_password VARCHAR(255);
  hashed_password VARCHAR(255);
BEGIN
  -- Verificar se o domínio existe
  SELECT name INTO domain_name FROM domains WHERE id = p_domain_id;
  
  IF domain_name IS NULL THEN
    RETURN 'Erro: Domínio não encontrado';
  END IF;
  
  -- Gerar senha se não fornecida
  IF p_senha IS NULL THEN
    generated_password := substr(md5(random()::text), 1, 8);
  ELSE
    generated_password := p_senha;
  END IF;
  
  -- Hash da senha
  hashed_password := crypt(generated_password, gen_salt('bf'));
  
  -- Inserir usuário
  INSERT INTO usuarios (nome, email, tipo_usuario, status, domain_id, senha_hashed)
  VALUES (p_nome, p_email, p_tipo_usuario, 'ativo', p_domain_id, hashed_password);
  
  RETURN 'Usuário ' || p_nome || ' criado com sucesso no domínio ' || domain_name || '. Senha: ' || generated_password;
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'Erro: Email já existe no sistema';
  WHEN OTHERS THEN
    RETURN 'Erro ao criar usuário: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. ATUALIZAR RLS PARA CONSIDERAR DOMÍNIOS
-- ========================================

-- Política para usuários verem apenas usuários do mesmo domínio
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  ) OR
  (domain_id IS NOT NULL AND domain_id = (
    SELECT domain_id FROM usuarios WHERE id = auth.uid()
  ))
);

-- Política para admin_master criar usuários em qualquer domínio
DROP POLICY IF EXISTS "Admin can create users" ON public.usuarios;
CREATE POLICY "Admin can create users"
ON public.usuarios
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Política para admin_master atualizar usuários
DROP POLICY IF EXISTS "Admin can update users" ON public.usuarios;
CREATE POLICY "Admin can update users"
ON public.usuarios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);

-- ========================================
-- 8. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
  'Migration concluída!' as status,
  'Suporte a domínios adicionado à tabela usuarios' as description;

-- Mostrar estrutura atualizada
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position; 