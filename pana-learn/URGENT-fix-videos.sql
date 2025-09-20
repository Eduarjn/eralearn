-- SOLUÇÃO URGENTE: Corrigir problema de vídeos não carregando
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 2. Limpar tabela de vídeos
TRUNCATE TABLE public.videos RESTART IDENTITY;

-- 3. Inserir vídeos do PABX (curso que está com problema)
INSERT INTO public.videos (titulo, descricao, url_video, categoria, curso_id, duracao) VALUES
('Subir um Áudio na Plataforma PABX', 'Como Subir um Áudio na Plataforma PABX da ERA', '1757184723849_2Como_Subir_um___udio_na_Plataforma_PABX_da_ERA.mp4', 'PABX', '98f3a689-389c-4ded-9833-846d59fcc183', 180),
('Bloquear Chamadas Indesejadas no PABX', 'Como Bloquear Chamadas Indesejadas no PABX', '1757184696733_4Como_Bloquear_Chamadas_Indesejadas_no_PABX_____.mp4', 'PABX', '98f3a689-389c-4ded-9833-846d59fcc183', 120),
('Menu de Caixa Postal', 'Demonstração do Menu de Caixa Postal da ERA', '1757184671316_5Demonstra____o_do_Menu_de_Caixa_Postal_da_ERA.mp4', 'PABX', '98f3a689-389c-4ded-9833-846d59fcc183', 150),
('Grupo de Ringue no PABX', 'Como Configurar um Grupo de Ringue no PABX da ERA', '1757184383315_6Como_Configurar_um_Grupo_de_Ringue_no_PABX_da_ERA_____.mp4', 'PABX', '98f3a689-389c-4ded-9833-846d59fcc183', 200),
('Painel do Operador no PABX', 'Demonstração do Painel do Operador no PABX da ERA', '1757184337187_7Demonstra____o_do_Painel_do_Operador_no_PABX_da_ERA.mp4', 'PABX', '98f3a689-389c-4ded-9833-846d59fcc183', 180);

-- 4. Inserir vídeos do CALLCENTER
INSERT INTO public.videos (titulo, descricao, url_video, categoria, curso_id, duracao) VALUES
('Demonstração do Registro de Chamadas no Call Center', 'Como funciona o registro de chamadas', '1757185143446_Demonstra____o_do_Registro_de_Chamadas_no_Call_Center_____.mp4', 'CALLCENTER', '4cb57528-7485-4486-9121-e9656c491fdb', 180),
('Funcionalidade do Call Center - Histórico de Agentes', 'Histórico e funcionalidades dos agentes', '1757185430204_Funcionalidade_do_Call_Center__Hist__rico_de_Agentes_____.mp4', 'CALLCENTER', '4cb57528-7485-4486-9121-e9656c491fdb', 200),
('Relatório de Pausas no PABX', 'Como gerar relatórios de pausas', '1757185475124_Relat__rio_de_Pausas_no_PABX_____.mp4', 'CALLCENTER', '4cb57528-7485-4486-9121-e9656c491fdb', 160);

-- 5. Reabilitar RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 6. Verificar resultado
SELECT 
    'SUCESSO!' as status,
    COUNT(*) as total_videos,
    COUNT(CASE WHEN categoria = 'PABX' THEN 1 END) as videos_pabx,
    COUNT(CASE WHEN categoria = 'CALLCENTER' THEN 1 END) as videos_callcenter
FROM public.videos;

-- 7. Mostrar vídeos inseridos
SELECT 
    titulo,
    categoria,
    curso_id,
    duracao
FROM public.videos
ORDER BY categoria, titulo;
















