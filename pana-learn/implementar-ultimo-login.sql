-- Script para implementar funcionalidade completa de último login
-- Data: 2025-01-29

-- ========================================
-- 1. VERIFICAR E ADICIONAR CAMPO ULTIMO_LOGIN
-- ========================================

-- Verificar se o campo já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'ultimo_login'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN ultimo_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo ultimo_login adicionado à tabela usuarios';
    ELSE
        RAISE NOTICE 'Campo ultimo_login já existe na tabela usuarios';
    END IF;
END $$;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_login ON public.usuarios(ultimo_login);

-- ========================================
-- 2. CRIAR TABELA DE LOGS DE LOGIN
-- ========================================

CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_login_logs_usuario_id ON public.login_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_success ON public.login_logs(success);

-- ========================================
-- 3. HABILITAR RLS NA TABELA LOGIN_LOGS
-- ========================================

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ver seus próprios logs de login" ON public.login_logs;
DROP POLICY IF EXISTS "Sistema pode inserir logs de login" ON public.login_logs;
DROP POLICY IF EXISTS "Administradores podem ver todos os logs de login" ON public.login_logs;

-- Políticas RLS para login_logs
CREATE POLICY "Usuários podem ver seus próprios logs de login" 
  ON public.login_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode inserir logs de login" 
  ON public.login_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Administradores podem ver todos os logs de login" 
  ON public.login_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
    )
  );

-- ========================================
-- 4. CRIAR FUNÇÃO PARA ATUALIZAR ULTIMO_LOGIN
-- ========================================

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar último login do usuário
  UPDATE public.usuarios 
  SET ultimo_login = NOW()
  WHERE id = NEW.usuario_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. CRIAR TRIGGER PARA ATUALIZAR ULTIMO_LOGIN
-- ========================================

DROP TRIGGER IF EXISTS trigger_update_last_login ON public.login_logs;

CREATE TRIGGER trigger_update_last_login
  AFTER INSERT ON public.login_logs
  FOR EACH ROW
  WHEN (NEW.success = true)
  EXECUTE FUNCTION update_last_login();

-- ========================================
-- 6. CRIAR FUNÇÃO PARA REGISTRAR LOGIN
-- ========================================

CREATE OR REPLACE FUNCTION register_login(
  p_usuario_id UUID,
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_logs (
    usuario_id,
    email,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    p_usuario_id,
    p_email,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. CRIAR FUNÇÃO PARA OBTER ÚLTIMO LOGIN
-- ========================================

CREATE OR REPLACE FUNCTION get_user_last_login(p_user_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  last_login TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT ultimo_login INTO last_login
  FROM public.usuarios
  WHERE id = p_user_id;
  
  RETURN last_login;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. ATUALIZAR DADOS EXISTENTES (OPCIONAL)
-- ========================================

-- Se houver dados de auth.users, podemos tentar sincronizar
-- (Isso é opcional e depende da estrutura do seu auth.users)
UPDATE public.usuarios 
SET ultimo_login = (
  SELECT last_sign_in_at 
  FROM auth.users 
  WHERE auth.users.id = usuarios.user_id
)
WHERE ultimo_login IS NULL 
AND user_id IS NOT NULL
AND EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = usuarios.user_id 
  AND auth.users.last_sign_in_at IS NOT NULL
);

-- ========================================
-- 9. VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Verificar se o campo foi adicionado
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'ultimo_login';

-- Verificar se a tabela login_logs foi criada
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'login_logs'
ORDER BY ordinal_position;

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_last_login', 'register_login', 'get_user_last_login');

-- Verificar se os triggers foram criados
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_last_login';

-- ========================================
-- 10. TESTE DA FUNCIONALIDADE
-- ========================================

-- Teste: Registrar um login de teste (substitua pelo ID de um usuário real)
-- SELECT register_login(
--   '00000000-0000-0000-0000-000000000000'::UUID,
--   'teste@exemplo.com',
--   NULL,
--   'Mozilla/5.0 (Test Browser)',
--   true,
--   NULL
-- );

-- Verificar se o último login foi atualizado
-- SELECT 
--   id,
--   nome,
--   email,
--   ultimo_login
-- FROM public.usuarios 
-- WHERE id = '00000000-0000-0000-0000-000000000000'::UUID;

RAISE NOTICE 'Script de implementação de último login executado com sucesso!';




























