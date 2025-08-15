-- Verificar e corrigir a estrutura da tabela certificados
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

-- 4. Verificar se há certificados com usuario_id NULL ou undefined
SELECT 
    COUNT(*) as certificados_sem_usuario
FROM certificados 
WHERE usuario_id IS NULL OR usuario_id = 'undefined';

-- 5. Se houver certificados com usuario_id inválido, vamos corrigir
-- (Execute apenas se necessário)
UPDATE certificados 
SET usuario_id = (
    SELECT id FROM auth.users LIMIT 1
)
WHERE usuario_id IS NULL OR usuario_id = 'undefined';

-- 6. Verificar se a tabela usuarios existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'usuarios'
) as tabela_usuarios_existe;

-- 7. Se a tabela usuarios não existir, vamos usar auth.users
-- Verificar se auth.users tem dados
SELECT COUNT(*) as total_usuarios FROM auth.users;

-- 8. Testar a query que está falhando
SELECT 
    c.*,
    u.email as usuario_email,
    u.raw_user_meta_data->>'nome' as usuario_nome
FROM certificados c
LEFT JOIN auth.users u ON c.usuario_id = u.id
LIMIT 5; 