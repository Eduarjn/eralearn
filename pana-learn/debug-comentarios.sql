-- Script para debugar problemas com comentários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário está autenticado
SELECT 'Verificando autenticação:' as info;
SELECT 
  auth.uid() as usuario_atual,
  auth.role() as role_atual;

-- 2. Verificar se há usuários na tabela
SELECT 'Verificando usuários:' as info;
SELECT 
  id,
  email,
  nome,
  tipo_usuario
FROM public.usuarios 
LIMIT 5;

-- 3. Verificar se há vídeos
SELECT 'Verificando vídeos:' as info;
SELECT 
  id,
  titulo,
  curso_id
FROM public.videos 
LIMIT 5;

-- 4. Verificar comentários existentes
SELECT 'Verificando comentários existentes:' as info;
SELECT 
  c.id,
  c.texto,
  c.data_criacao,
  c.video_id,
  c.usuario_id,
  u.nome as autor_nome,
  u.email as autor_email
FROM public.comentarios c
INNER JOIN public.usuarios u ON c.usuario_id = u.id
ORDER BY c.data_criacao DESC
LIMIT 5;

-- 5. Testar função get_video_comments manualmente
SELECT 'Testando get_video_comments:' as info;
SELECT * FROM get_video_comments(
  (SELECT id FROM public.videos LIMIT 1)
);

-- 6. Verificar políticas RLS
SELECT 'Verificando políticas RLS:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'comentarios';

-- 7. Verificar se a função add_video_comment existe
SELECT 'Verificando função add_video_comment:' as info;
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'add_video_comment';

-- 8. Testar inserção manual (simular o que a função faz)
SELECT 'Testando inserção manual:' as info;
-- Primeiro, vamos ver se conseguimos inserir um comentário de teste
INSERT INTO public.comentarios (video_id, usuario_id, texto)
VALUES (
  (SELECT id FROM public.videos LIMIT 1),
  (SELECT id FROM public.usuarios WHERE tipo_usuario = 'cliente' LIMIT 1),
  'Comentário de teste manual'
)
RETURNING id, video_id, usuario_id, texto, data_criacao;

-- 9. Verificar se a inserção funcionou
SELECT 'Verificando inserção:' as info;
SELECT 
  COUNT(*) as total_comentarios,
  COUNT(CASE WHEN texto = 'Comentário de teste manual' THEN 1 END) as comentarios_teste
FROM public.comentarios;

-- 10. Limpar comentário de teste
DELETE FROM public.comentarios 
WHERE texto = 'Comentário de teste manual';

-- 11. Verificar permissões da tabela
SELECT 'Verificando permissões da tabela:' as info;
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'comentarios';

-- 12. Resumo final
SELECT 'Debug concluído!' as info;
SELECT 
  'Total de comentários:' as metric,
  COUNT(*) as value
FROM public.comentarios
UNION ALL
SELECT 
  'Comentários ativos:' as metric,
  COUNT(*) as value
FROM public.comentarios
WHERE ativo = true
UNION ALL
SELECT 
  'Usuários disponíveis:' as metric,
  COUNT(*) as value
FROM public.usuarios
UNION ALL
SELECT 
  'Vídeos disponíveis:' as metric,
  COUNT(*) as value
FROM public.videos;






































