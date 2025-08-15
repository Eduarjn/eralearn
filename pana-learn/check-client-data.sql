-- Script para verificar dados do cliente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela cursos existe e tem dados
SELECT 'CURSOS' as tabela, COUNT(*) as total FROM cursos;

-- 2. Verificar estrutura da tabela cursos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cursos' 
ORDER BY ordinal_position;

-- 3. Verificar se a tabela video_progress existe
SELECT 'VIDEO_PROGRESS' as tabela, COUNT(*) as total FROM video_progress;

-- 4. Verificar se a tabela progresso_quiz existe
SELECT 'PROGRESSO_QUIZ' as tabela, COUNT(*) as total FROM progresso_quiz;

-- 5. Verificar se a tabela certificados existe
SELECT 'CERTIFICADOS' as tabela, COUNT(*) as total FROM certificados;

-- 6. Verificar usuários disponíveis
SELECT id, email, tipo_usuario FROM auth.users LIMIT 5;

-- 7. Verificar dados de exemplo nas tabelas
SELECT 'CURSOS - Dados de exemplo:' as info;
SELECT id, nome, categoria FROM cursos LIMIT 3;

SELECT 'VIDEO_PROGRESS - Dados de exemplo:' as info;
SELECT usuario_id, video_id FROM video_progress LIMIT 3;

SELECT 'PROGRESSO_QUIZ - Dados de exemplo:' as info;
SELECT usuario_id, categoria, nota, aprovado FROM progresso_quiz LIMIT 3;

SELECT 'CERTIFICADOS - Dados de exemplo:' as info;
SELECT usuario_id, categoria, numero_certificado, nota_final FROM certificados LIMIT 3; 