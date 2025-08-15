-- Script para limpar domínios e deixar ambiente pronto para novos clientes
-- Execute este arquivo no Supabase SQL Editor

-- ========================================
-- 1. LIMPAR DADOS DE EXEMPLO DOS DOMÍNIOS
-- ========================================

-- Remover domínios de exemplo existentes
DELETE FROM domains WHERE name IN (
  'cliente1.com',
  'cliente2.com', 
  'cliente3.com'
);

-- ========================================
-- 2. CRIAR DOMÍNIOS LIMPOS PARA NOVOS CLIENTES
-- ========================================

-- Inserir domínios limpos para novos clientes
INSERT INTO domains (name, description, created_by) VALUES
('novo-cliente-1.com', 'Novo Cliente 1 - Ambiente Limpo', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)),
('novo-cliente-2.com', 'Novo Cliente 2 - Ambiente Limpo', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)),
('novo-cliente-3.com', 'Novo Cliente 3 - Ambiente Limpo', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1));

-- ========================================
-- 3. VERIFICAR RESULTADO
-- ========================================

-- Mostrar domínios limpos criados
SELECT 
  id,
  name,
  description,
  created_at,
  'Ambiente Limpo - Pronto para Configuração' as status
FROM domains 
ORDER BY created_at DESC;

-- ========================================
-- 4. CRIAR FUNÇÃO PARA CONFIGURAR NOVO CLIENTE
-- ========================================

-- Função para configurar um novo cliente (opcional)
CREATE OR REPLACE FUNCTION setup_new_client(domain_id UUID)
RETURNS TEXT AS $$
DECLARE
  domain_name TEXT;
  result TEXT;
BEGIN
  -- Buscar nome do domínio
  SELECT name INTO domain_name FROM domains WHERE id = domain_id;
  
  IF domain_name IS NULL THEN
    RETURN 'Erro: Domínio não encontrado';
  END IF;
  
  -- Aqui você pode adicionar lógica para configurar o cliente
  -- Por exemplo:
  -- - Criar usuários padrão
  -- - Criar categorias padrão
  -- - Configurar cursos de exemplo
  -- - etc.
  
  result := 'Cliente ' || domain_name || ' configurado com sucesso!';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. COMENTÁRIOS SOBRE USO
-- ========================================

-- Para configurar um novo cliente, execute:
-- SELECT setup_new_client('ID_DO_DOMINIO_AQUI');

-- ========================================
-- 6. VERIFICAÇÃO FINAL
-- ========================================

SELECT 
  'Setup concluído!' as status,
  COUNT(*) as total_domains,
  'Ambientes limpos prontos para novos clientes' as description
FROM domains; 