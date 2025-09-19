-- Script para importar vídeos do servidor local para o banco
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 2. Inserir vídeos do PABX (que estão no servidor local)
INSERT INTO videos (titulo, descricao, url_video, categoria, curso_id, duracao, source, video_url)
VALUES 
-- Vídeos do PABX
('Subir um Áudio na Plataforma PABX', 'Como Subir um Áudio na Plataforma PABX da ERA', '1757184723849_2Como_Subir_um___udio_na_Plataforma_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757184723849_2Como_Subir_um___udio_na_Plataforma_PABX_da_ERA.mp4'),

('Bloquear Chamadas Indesejadas no PABX', 'Como Bloquear Chamadas Indesejadas no PABX', '1757184696733_4Como_Bloquear_Chamadas_Indesejadas_no_PABX_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 120, 'upload', 'http://localhost:3001/videos/1757184696733_4Como_Bloquear_Chamadas_Indesejadas_no_PABX_____.mp4'),

('Menu de Caixa Postal', 'Demonstração do Menu de Caixa Postal da ERA', '1757184671316_5Demonstra____o_do_Menu_de_Caixa_Postal_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 150, 'upload', 'http://localhost:3001/videos/1757184671316_5Demonstra____o_do_Menu_de_Caixa_Postal_da_ERA.mp4'),

('Grupo de Ringue no PABX', 'Como Configurar um Grupo de Ringue no PABX da ERA', '1757184383315_6Como_Configurar_um_Grupo_de_Ringue_no_PABX_da_ERA_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 200, 'upload', 'http://localhost:3001/videos/1757184383315_6Como_Configurar_um_Grupo_de_Ringue_no_PABX_da_ERA_____.mp4'),

('Painel do Operador no PABX', 'Demonstração do Painel do Operador no PABX da ERA', '1757184337187_7Demonstra____o_do_Painel_do_Operador_no_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757184337187_7Demonstra____o_do_Painel_do_Operador_no_PABX_da_ERA.mp4'),

('Regras de Tempo no PABX', 'Como Configurar Regras de Tempo no PABX da Era', '1757184222414_8Como_Configurar_Regras_de_Tempo_no_PABX_da_Era.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 160, 'upload', 'http://localhost:3001/videos/1757184222414_8Como_Configurar_Regras_de_Tempo_no_PABX_da_Era.mp4'),

('Função SIGME no PABX', 'Configuração da Função SIGME no PABX da ERA', '1757184177834_9Configura____o_da_Fun____o_SIGME_no_PABX_da_ERA_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 190, 'upload', 'http://localhost:3001/videos/1757184177834_9Configura____o_da_Fun____o_SIGME_no_PABX_da_ERA_____.mp4'),

('URA para Atendimento', 'Configuração de URA para Atendimento', '1757184129783_12Relat__rio_de_URA__Como_Analisar_Chamadas_no_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 170, 'upload', 'http://localhost:3001/videos/1757184129783_12Relat__rio_de_URA__Como_Analisar_Chamadas_no_PABX_da_ERA.mp4'),

('Relatórios do PABX', 'Menu de Relatórios do PABX - Como Utilizar', '1757182481794_11Menu_de_Relat__rios_do_PABX__Como_Utilizar_____.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 140, 'upload', 'http://localhost:3001/videos/1757182481794_11Menu_de_Relat__rios_do_PABX__Como_Utilizar_____.mp4'),

('Relatório de URA', 'Como Analisar Chamadas no PABX da ERA', '1757182430892_12Relat__rio_de_URA__Como_Analisar_Chamadas_no_PABX_da_ERA.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 130, 'upload', 'http://localhost:3001/videos/1757182430892_12Relat__rio_de_URA__Como_Analisar_Chamadas_no_PABX_da_ERA.mp4'),

('Chamadas Ativas e Registro de Ramais', 'Demonstração de Funcionalidades do PABX - Chamadas Ativas e Registro de Ramais', '1757182395611_13Demonstra____o_de_Funcionalidades_do_PABX__Chamadas_Ativas_e_Registro_de_Ramais.mp4', 'PABX', (SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 220, 'upload', 'http://localhost:3001/videos/1757182395611_13Demonstra____o_de_Funcionalidades_do_PABX__Chamadas_Ativas_e_Registro_de_Ramais.mp4'),

-- Vídeos do OMNICHANNEL
('Cadastro de Usuários no Módulo Omnichannel', 'Como cadastrar usuários no módulo omnichannel', '1757180057057_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 300, 'upload', 'http://localhost:3001/videos/1757180057057_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4'),

('Configurações do Módulo Omnichannel - parte 1', 'Configurações básicas do módulo omnichannel', '1757180296562_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 400, 'upload', 'http://localhost:3001/videos/1757180296562_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4'),

('Como Utilizar o Menu Direct Chat', 'Tutorial sobre o menu direct chat', '1757180581626_Como_Utilizar_o_Menu_Direct_Chat.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 250, 'upload', 'http://localhost:3001/videos/1757180581626_Como_Utilizar_o_Menu_Direct_Chat.mp4'),

('Grupos Privados no Módulo de Omnichannel', 'Configuração de grupos privados', '1757180660349_Grupos_Privados_no_M__dulo_de_Omnichannel.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 280, 'upload', 'http://localhost:3001/videos/1757180660349_Grupos_Privados_no_M__dulo_de_Omnichannel.mp4'),

('Configurando Departamentos', 'Como configurar departamentos no sistema', '1757180720201_Configurando_Departamentos.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 320, 'upload', 'http://localhost:3001/videos/1757180720201_Configurando_Departamentos.mp4'),

('Configurações do Módulo Omnichannel - parte 2', 'Configurações avançadas do módulo omnichannel', '1757180755983_Configura____es_do_M__dulo_Omnichannel_-_parte_2.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 350, 'upload', 'http://localhost:3001/videos/1757180755983_Configura____es_do_M__dulo_Omnichannel_-_parte_2.mp4'),

('Configurações do Módulo Omnichannel - parte 1 (duplicado)', 'Configurações básicas do módulo omnichannel', '1757180777052_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 400, 'upload', 'http://localhost:3001/videos/1757180777052_Configura____es_do_M__dulo_Omnichannel_-_parte_1.mp4'),

('Cadastro de Usuários no Módulo Omnichannel (duplicado)', 'Como cadastrar usuários no módulo omnichannel', '1757180800610_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4', 'OMNICHANNEL', (SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 300, 'upload', 'http://localhost:3001/videos/1757180800610_Cadastro_de_Usu__rios_no_M__dulo_Omnichannel.mp4'),

-- Vídeos do CALLCENTER
('Demonstração do Registro de Chamadas no Call Center', 'Como funciona o registro de chamadas', '1757185143446_Demonstra____o_do_Registro_de_Chamadas_no_Call_Center_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 180, 'upload', 'http://localhost:3001/videos/1757185143446_Demonstra____o_do_Registro_de_Chamadas_no_Call_Center_____.mp4'),

('Funcionalidade do Call Center - Histórico de Agentes', 'Histórico e funcionalidades dos agentes', '1757185430204_Funcionalidade_do_Call_Center__Hist__rico_de_Agentes_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 200, 'upload', 'http://localhost:3001/videos/1757185430204_Funcionalidade_do_Call_Center__Hist__rico_de_Agentes_____.mp4'),

('Relatório de Pausas no PABX', 'Como gerar relatórios de pausas', '1757185475124_Relat__rio_de_Pausas_no_PABX_____.mp4', 'CALLCENTER', (SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 160, 'upload', 'http://localhost:3001/videos/1757185475124_Relat__rio_de_Pausas_no_PABX_____.mp4')

ON CONFLICT (titulo, categoria) DO NOTHING;

-- 3. Reabilitar RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 4. Verificar vídeos inseridos
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.video_url
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.categoria, v.titulo;
















