-- Script para adicionar o domínio principal eralearn.com
-- Execute este arquivo no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR SE O DOMÍNIO JÁ EXISTE
-- ========================================

SELECT 
  'Verificando domínio eralearn.com...' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM domains WHERE name = 'eralearn.com') 
    THEN 'Domínio já existe'
    ELSE 'Domínio não encontrado'
  END as resultado;

-- ========================================
-- 2. ADICIONAR DOMÍNIO ERALEARN.COM
-- ========================================

-- Inserir domínio eralearn.com se não existir
INSERT INTO domains (name, description, created_by) 
SELECT 
  'eralearn.com',
  'ERA Learn - Plataforma Principal de Treinamento Corporativo',
  (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'eralearn.com');

-- ========================================
-- 3. VERIFICAR INSERÇÃO
-- ========================================

SELECT 
  'Domínio eralearn.com adicionado com sucesso!' as status,
  COUNT(*) as total_domains
FROM domains 
WHERE name = 'eralearn.com';

-- ========================================
-- 4. MOSTRAR TODOS OS DOMÍNIOS
-- ========================================

SELECT 
  id,
  name,
  description,
  created_at,
  'Domínio ativo' as status
FROM domains 
ORDER BY 
  CASE WHEN name = 'eralearn.com' THEN 0 ELSE 1 END, -- eralearn.com primeiro
  created_at DESC;

-- ========================================
-- 5. VERIFICAR CONFIGURAÇÕES
-- ========================================

-- Verificar se existe usuário admin_master
SELECT 
  'Verificando usuário admin_master...' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM usuarios WHERE tipo_usuario = 'admin_master') 
    THEN 'Usuário admin_master encontrado'
    ELSE 'Usuário admin_master não encontrado'
  END as resultado;

-- Mostrar usuários admin_master
SELECT 
  id,
  email,
  nome,
  tipo_usuario,
  status
FROM usuarios 
WHERE tipo_usuario = 'admin_master'
ORDER BY created_at DESC; 