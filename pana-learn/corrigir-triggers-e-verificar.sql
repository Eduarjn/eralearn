-- Script para corrigir triggers problemáticos e verificar estrutura
-- Data: 2025-01-29

-- ========================================
-- 1. VERIFICAR TRIGGERS PROBLEMÁTICOS
-- ========================================

-- Verificar todos os triggers existentes
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ========================================
-- 2. VERIFICAR FUNÇÕES DE TRIGGER
-- ========================================

-- Verificar função update_updated_at_column
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'update_updated_at_column';

-- ========================================
-- 3. CORRIGIR FUNÇÃO UPDATE_UPDATED_AT_COLUMN
-- ========================================

-- Recriar a função para verificar se a coluna existe antes de atualizar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a coluna data_atualizacao existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = TG_TABLE_NAME 
    AND table_schema = TG_TABLE_SCHEMA
    AND column_name = 'data_atualizacao'
  ) THEN
    NEW.data_atualizacao = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- ========================================

-- Verificar colunas da tabela usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 5. VERIFICAR SE CAMPO ULTIMO_LOGIN EXISTE
-- ========================================

-- Verificar especificamente o campo ultimo_login
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
AND column_name = 'ultimo_login';

-- ========================================
-- 6. ADICIONAR CAMPO ULTIMO_LOGIN SE NÃO EXISTIR
-- ========================================

-- Adicionar campo ultimo_login se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND table_schema = 'public'
        AND column_name = 'ultimo_login'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN ultimo_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo ultimo_login adicionado à tabela usuarios';
    ELSE
        RAISE NOTICE 'Campo ultimo_login já existe na tabela usuarios';
    END IF;
END $$;

-- ========================================
-- 7. VERIFICAR TABELA LOGIN_LOGS
-- ========================================

-- Verificar se a tabela login_logs existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'login_logs';

-- ========================================
-- 8. CRIAR TABELA LOGIN_LOGS SE NÃO EXISTIR
-- ========================================

-- Criar tabela login_logs se não existir
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
-- 9. HABILITAR RLS NA TABELA LOGIN_LOGS
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
-- 10. CRIAR FUNÇÕES NECESSÁRIAS
-- ========================================

-- Função para atualizar último login
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

-- Função para registrar login
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
-- 11. CRIAR TRIGGER PARA ATUALIZAR ULTIMO_LOGIN
-- ========================================

DROP TRIGGER IF EXISTS trigger_update_last_login ON public.login_logs;

CREATE TRIGGER trigger_update_last_login
  AFTER INSERT ON public.login_logs
  FOR EACH ROW
  WHEN (NEW.success = true)
  EXECUTE FUNCTION update_last_login();

-- ========================================
-- 12. VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Verificar estrutura final da tabela usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela login_logs
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'login_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('update_last_login', 'register_login', 'update_updated_at_column')
ORDER BY routine_name;

-- Verificar triggers criados
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN ('trigger_update_last_login', 'update_usuarios_updated_at')
ORDER BY trigger_name;

-- ========================================
-- 13. TESTE SIMPLES
-- ========================================

-- Verificar alguns usuários
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  ultimo_login
FROM public.usuarios 
ORDER BY data_criacao DESC 
LIMIT 3;

-- ========================================
-- 14. MENSAGEM DE SUCESSO
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Script de correção e verificação executado com sucesso!';
  RAISE NOTICE 'Triggers corrigidos e estrutura verificada.';
END $$;
































