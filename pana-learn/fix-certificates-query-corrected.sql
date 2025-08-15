-- Verificar e corrigir a estrutura da tabela certificados (CORRIGIDO)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela certificados existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
ORDER BY ordinal_position;

-- 2. Verificar se há dados na tabela
SELECT COUNT(*) as total_certificados FROM certificados;

-- 3. Verificar alguns registros de exemplo
SELECT 
    id,
    usuario_id,
    categoria,
    nota_final,
    status,
    data_emissao,
    numero_certificado
FROM certificados 
LIMIT 5;

-- 4. Verificar se há certificados com usuario_id NULL (CORRIGIDO)
SELECT 
    COUNT(*) as certificados_sem_usuario
FROM certificados 
WHERE usuario_id IS NULL;

-- 5. Verificar se há certificados com usuario_id inválido (CORRIGIDO)
SELECT 
    COUNT(*) as certificados_com_usuario_invalido
FROM certificados 
WHERE usuario_id IS NOT NULL 
AND usuario_id NOT IN (SELECT id FROM auth.users);

-- 6. Se houver certificados com usuario_id inválido, vamos corrigir (CORRIGIDO)
-- (Execute apenas se necessário)
UPDATE certificados 
SET usuario_id = (
    SELECT id FROM auth.users LIMIT 1
)
WHERE usuario_id IS NOT NULL 
AND usuario_id NOT IN (SELECT id FROM auth.users);

-- 7. Verificar se a tabela usuarios existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'usuarios'
) as tabela_usuarios_existe;

-- 8. Se a tabela usuarios não existir, vamos usar auth.users
-- Verificar se auth.users tem dados
SELECT COUNT(*) as total_usuarios FROM auth.users;

-- 9. Testar a query que está falhando (CORRIGIDO)
SELECT 
    c.*,
    u.email as usuario_email,
    u.raw_user_meta_data->>'nome' as usuario_nome
FROM certificados c
LEFT JOIN auth.users u ON c.usuario_id = u.id
LIMIT 5;

-- 10. Verificar se há certificados válidos
SELECT 
    COUNT(*) as certificados_validos
FROM certificados c
WHERE c.usuario_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = c.usuario_id); 