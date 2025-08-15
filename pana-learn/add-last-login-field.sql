-- Script para adicionar campo de último login e tabela de logs de login
-- Data: 2025-01-29

-- ========================================
-- 1. ADICIONAR CAMPO ULTIMO_LOGIN NA TABELA USUARIOS
-- ========================================

-- Adicionar campo ultimo_login na tabela usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE;

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
-- 7. VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Verificar se o campo foi adicionado
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name = 'ultimo_login'
AND table_schema = 'public';

-- Verificar se a tabela de logs foi criada
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'login_logs' 
AND table_schema = 'public';

-- Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'login_logs'
ORDER BY policyname;

-- ========================================
-- 8. TESTE: INSERIR LOG DE TESTE
-- ========================================

-- Inserir um log de teste (substitua pelo ID de um usuário real)
-- SELECT register_login(
--   'ID_DO_USUARIO_AQUI'::UUID,
--   'teste@exemplo.com',
--   '127.0.0.1'::INET,
--   'Mozilla/5.0 (Test Browser)',
--   true,
--   NULL
-- );

-- ========================================
-- 9. VERIFICAR DADOS DE TESTE
-- ========================================

-- Verificar logs inseridos
SELECT 
  ll.id,
  ll.email,
  ll.ip_address,
  ll.success,
  ll.created_at,
  u.nome as usuario_nome
FROM public.login_logs ll
JOIN public.usuarios u ON u.id = ll.usuario_id
ORDER BY ll.created_at DESC
LIMIT 10;

-- Verificar usuários com último login
SELECT 
  id,
  nome,
  email,
  ultimo_login,
  data_criacao
FROM public.usuarios
WHERE ultimo_login IS NOT NULL
ORDER BY ultimo_login DESC
LIMIT 10;
