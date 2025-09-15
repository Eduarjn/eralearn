-- SOLUÇÃO RÁPIDA: Importar vídeos para resolver o problema de carregamento
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 2. Limpar vídeos existentes (se houver)
DELETE FROM public.videos;

-- 3. Inserir vídeos do PABX
INSERT INTO public.videos (titulo, descricao, url_video, categoria, curso_id, duracao, source, video_url) VALUES
('Subir um Áudio na Plataforma PABX', 'Como Subir um Áudio na Plataforma PABX da ERA', '1757184723849_2Como_Subir_um___udio_na_Plataforma_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757184723849_2Como_Subir_um___udio_na_Plataforma_PABX_da_ERA.mp4'),
('Bloquear Chamadas Indesejadas no PABX', 'Como Bloquear Chamadas Indesejadas no PABX', '1757184696733_4Como_Bloquear_Chamadas_Indesejadas_no_PABX_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 120, 'upload', 'http://localhost:3001/videos/1757184696733_4Como_Bloquear_Chamadas_Indesejadas_no_PABX_____.mp4'),
('Menu de Caixa Postal', 'Demonstração do Menu de Caixa Postal da ERA', '1757184671316_5Demonstra____o_do_Menu_de_Caixa_Postal_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 150, 'upload', 'http://localhost:3001/videos/1757184671316_5Demonstra____o_do_Menu_de_Caixa_Postal_da_ERA.mp4'),
('Grupo de Ringue no PABX', 'Como Configurar um Grupo de Ringue no PABX da ERA', '1757184383315_6Como_Configurar_um_Grupo_de_Ringue_no_PABX_da_ERA_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 200, 'upload', 'http://localhost:3001/videos/1757184383315_6Como_Configurar_um_Grupo_de_Ringue_no_PABX_da_ERA_____.mp4'),
('Painel do Operador no PABX', 'Demonstração do Painel do Operador no PABX da ERA', '1757184337187_7Demonstra____o_do_Painel_do_Operador_no_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757184337187_7Demonstra____o_do_Painel_do_Operador_no_PABX_da_ERA.mp4');

-- 4. Inserir vídeos do CALLCENTER
INSERT INTO public.videos (titulo, descricao, url_video, categoria, curso_id, duracao, source, video_url) VALUES
('Demonstração do Registro de Chamadas no Call Center', 'Como funciona o registro de chamadas', '1757185143446_Demonstra____o_do_Registro_de_Chamadas_no_Call_Center_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757185143446_Demonstra____o_do_Registro_de_Chamadas_no_Call_Center_____.mp4'),
('Funcionalidade do Call Center - Histórico de Agentes', 'Histórico e funcionalidades dos agentes', '1757185430204_Funcionalidade_do_Call_Center__Hist__rico_de_Agentes_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 200, 'upload', 'http://localhost:3001/videos/1757185430204_Funcionalidade_do_Call_Center__Hist__rico_de_Agentes_____.mp4'),
('Relatório de Pausas no PABX', 'Como gerar relatórios de pausas', '1757185475124_Relat__rio_de_Pausas_no_PABX_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 160, 'upload', 'http://localhost:3001/videos/1757185475124_Relat__rio_de_Pausas_no_PABX_____.mp4');

-- 5. Inserir vídeos do OMNICHANNEL
INSERT INTO public.videos (titulo, descricao, url_video, categoria, curso_id, duracao, source, video_url) VALUES
('Cadastro de Usuários no Módulo Omnichannel', 'Como cadastrar usuários no módulo omnichannel', '1757180057057_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 300, 'upload', 'http://localhost:3001/videos/1757180057057_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4'),
('Configurações do Módulo Omnichannel - parte 1', 'Configurações básicas do módulo omnichannel', '1757180296562_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 400, 'upload', 'http://localhost:3001/videos/1757180296562_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4'),
('Como Utilizar o Menu Direct Chat', 'Tutorial sobre o menu direct chat', '1757180581626_Como_Utilizar_o_Menu_Direct_Chat.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 250, 'upload', 'http://localhost:3001/videos/1757180581626_Como_Utilizar_o_Menu_Direct_Chat.mp4');

-- 6. Reabilitar RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 7. Verificar resultado
SELECT 
    'RESULTADO DA IMPORTAÇÃO' as status,
    COUNT(*) as total_videos,
    COUNT(CASE WHEN categoria = 'PABX' THEN 1 END) as videos_pabx,
    COUNT(CASE WHEN categoria = 'CALLCENTER' THEN 1 END) as videos_callcenter,
    COUNT(CASE WHEN categoria = 'OMNICHANNEL' THEN 1 END) as videos_omnichannel
FROM public.videos;






