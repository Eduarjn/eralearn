-- Script para verificar configuração do LinkedIn
-- Data: 2025-01-29

-- 1. Verificar configurações de autenticação
SELECT 
  name,
  value
FROM auth.config 
WHERE name LIKE '%linkedin%' OR name LIKE '%oauth%';

-- 2. Verificar se o LinkedIn está habilitado
SELECT 
  name,
  value,
  CASE 
    WHEN value::boolean THEN 'HABILITADO'
    ELSE 'DESABILITADO'
  END as status
FROM auth.config 
WHERE name = 'linkedin_enabled';

-- 3. Verificar configurações de OAuth
SELECT 
  name,
  value
FROM auth.config 
WHERE name IN (
  'linkedin_client_id',
  'linkedin_client_secret',
  'linkedin_redirect_url'
);

-- 4. Verificar URLs de redirecionamento permitidas
SELECT 
  name,
  value
FROM auth.config 
WHERE name = 'additional_redirect_urls';

-- 5. Verificar se há algum problema com providers
SELECT 
  name,
  value
FROM auth.config 
WHERE name LIKE '%provider%' OR name LIKE '%auth%';

-- 6. Verificar configurações gerais de autenticação
SELECT 
  name,
  value
FROM auth.config 
WHERE name IN (
  'enable_signup',
  'enable_confirmations',
  'enable_phone_confirmations'
); 