
-- Limpar dados de exemplo existentes
DELETE FROM public.progresso_usuario;
DELETE FROM public.certificados;
DELETE FROM public.avaliacoes;
DELETE FROM public.modulos;
DELETE FROM public.cursos;

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#3B82F6', -- cor hexadecimal para UI
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela de vídeos/conteúdo (opcional)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_video TEXT,
  duracao INTEGER, -- em segundos
  thumbnail_url TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Atualizar tabela de cursos para incluir categoria
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias(id),
ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES public.videos(id);

-- Atualizar tabela de módulos para incluir vídeo
ALTER TABLE public.modulos 
ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES public.videos(id);

-- Atualizar trigger para categorias
CREATE TRIGGER update_categorias_updated_at 
  BEFORE UPDATE ON public.categorias 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar trigger para vídeos
CREATE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON public.videos 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Categorias
CREATE POLICY "Todos podem ver categorias" 
  ON public.categorias 
  FOR SELECT 
  USING (true);

CREATE POLICY "Administradores podem gerenciar categorias" 
  ON public.categorias 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para Vídeos
CREATE POLICY "Usuários autenticados podem ver vídeos" 
  ON public.videos 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores podem gerenciar vídeos" 
  ON public.videos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Inserir categorias padrão
INSERT INTO public.categorias (nome, descricao, cor) VALUES
('PABX', 'Treinamentos sobre sistemas PABX', '#3B82F6'),
('VoIP', 'Treinamentos sobre tecnologias VoIP', '#10B981'),
('Omnichannel', 'Treinamentos sobre plataformas Omnichannel', '#8B5CF6'),
('Básico', 'Treinamentos introdutórios', '#F59E0B'),
('Avançado', 'Treinamentos avançados', '#EF4444'),
('Intermediário', 'Treinamentos de nível intermediário', '#6B7280');

-- Inserir cursos de exemplo com categorias
INSERT INTO public.cursos (nome, categoria, descricao, status, categoria_id) 
SELECT 
  'Fundamentos de PABX', 
  'PABX', 
  'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas', 
  'ativo',
  c.id
FROM public.categorias c WHERE c.nome = 'PABX';

INSERT INTO public.cursos (nome, categoria, descricao, status, categoria_id) 
SELECT 
  'Configuração VoIP Avançada', 
  'VoIP', 
  'Configurações avançadas para sistemas VoIP corporativos', 
  'ativo',
  c.id
FROM public.categorias c WHERE c.nome = 'VoIP';

INSERT INTO public.cursos (nome, categoria, descricao, status, categoria_id) 
SELECT 
  'Omnichannel para Empresas', 
  'Omnichannel', 
  'Implementação de soluções omnichannel em ambientes empresariais', 
  'ativo',
  c.id
FROM public.categorias c WHERE c.nome = 'Omnichannel';

-- Inserir módulos para os cursos
INSERT INTO public.modulos (curso_id, nome_modulo, duracao, ordem, descricao) 
SELECT 
  c.id,
  'Introdução ao PABX',
  45,
  1,
  'Conceitos básicos e história dos sistemas PABX'
FROM public.cursos c WHERE c.nome = 'Fundamentos de PABX';

INSERT INTO public.modulos (curso_id, nome_modulo, duracao, ordem, descricao) 
SELECT 
  c.id,
  'Instalação e Configuração Inicial',
  60,
  2,
  'Como instalar e configurar um sistema PABX básico'
FROM public.cursos c WHERE c.nome = 'Fundamentos de PABX';

INSERT INTO public.modulos (curso_id, nome_modulo, duracao, ordem, descricao) 
SELECT 
  c.id,
  'Protocolos VoIP',
  50,
  1,
  'SIP, RTP e outros protocolos essenciais'
FROM public.cursos c WHERE c.nome = 'Configuração VoIP Avançada';

-- Criar usuário administrador padrão (será criado automaticamente quando alguém se registrar com este email)
-- Você pode se registrar com admin@eralearn.com e será automaticamente definido como admin

-- Atualizar função handle_new_user para definir admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@eralearn.com' THEN 'admin'::user_type
      ELSE 'cliente'::user_type
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
