
-- Criar enum para tipos de usuário
CREATE TYPE user_type AS ENUM ('cliente', 'admin');

-- Criar enum para status
CREATE TYPE status_type AS ENUM ('ativo', 'inativo', 'pendente');

-- Criar enum para status do curso
CREATE TYPE course_status AS ENUM ('ativo', 'inativo', 'em_breve');

-- Criar enum para status de progresso
CREATE TYPE progress_status AS ENUM ('nao_iniciado', 'em_andamento', 'concluido');

-- Tabela de Usuários
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  matricula VARCHAR(100) UNIQUE,
  senha_hashed VARCHAR(255) NOT NULL,
  tipo_usuario user_type NOT NULL DEFAULT 'cliente',
  status status_type NOT NULL DEFAULT 'ativo',
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de Cursos
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  status course_status NOT NULL DEFAULT 'ativo',
  ordem INTEGER DEFAULT 0,
  imagem_url TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Módulos/Aulas
CREATE TABLE public.modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  nome_modulo VARCHAR(255) NOT NULL,
  link_video TEXT,
  duracao INTEGER, -- duração em minutos
  ordem INTEGER DEFAULT 0,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Progresso do Usuário
CREATE TABLE public.progresso_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'nao_iniciado',
  percentual_concluido DECIMAL(5,2) DEFAULT 0.00,
  tempo_total_assistido INTEGER DEFAULT 0, -- em minutos
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, curso_id, modulo_id)
);

-- Tabela de Certificados
CREATE TABLE public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  nota_final DECIMAL(5,2),
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  link_pdf_certificado TEXT,
  numero_certificado VARCHAR(100) UNIQUE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Feedbacks/Avaliações (opcional)
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  comentario TEXT,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_matricula ON public.usuarios(matricula);
CREATE INDEX idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX idx_cursos_status ON public.cursos(status);
CREATE INDEX idx_modulos_curso_id ON public.modulos(curso_id);
CREATE INDEX idx_progresso_usuario_id ON public.progresso_usuario(usuario_id);
CREATE INDEX idx_progresso_curso_id ON public.progresso_usuario(curso_id);
CREATE INDEX idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX idx_avaliacoes_curso_id ON public.avaliacoes(curso_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Usuários
CREATE POLICY "Usuários podem ver seus próprios dados" 
  ON public.usuarios 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Administradores podem ver todos os usuários" 
  ON public.usuarios 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
  ON public.usuarios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para Cursos
CREATE POLICY "Todos podem ver cursos ativos" 
  ON public.cursos 
  FOR SELECT 
  USING (status = 'ativo');

CREATE POLICY "Administradores podem gerenciar cursos" 
  ON public.cursos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para Módulos
CREATE POLICY "Usuários podem ver módulos de cursos ativos" 
  ON public.modulos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cursos c 
      WHERE c.id = curso_id AND c.status = 'ativo'
    )
  );

CREATE POLICY "Administradores podem gerenciar módulos" 
  ON public.modulos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para Progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" 
  ON public.progresso_usuario 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio progresso" 
  ON public.progresso_usuario 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem modificar seu próprio progresso" 
  ON public.progresso_usuario 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Administradores podem ver todo progresso" 
  ON public.progresso_usuario 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para Certificados
CREATE POLICY "Usuários podem ver seus próprios certificados" 
  ON public.certificados 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Administradores podem gerenciar certificados" 
  ON public.certificados 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para Avaliações
CREATE POLICY "Usuários podem ver suas próprias avaliações" 
  ON public.avaliacoes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar suas próprias avaliações" 
  ON public.avaliacoes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Administradores podem ver todas as avaliações" 
  ON public.avaliacoes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    'cliente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar data de modificação
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER update_usuarios_updated_at 
  BEFORE UPDATE ON public.usuarios 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at 
  BEFORE UPDATE ON public.cursos 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modulos_updated_at 
  BEFORE UPDATE ON public.modulos 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_updated_at 
  BEFORE UPDATE ON public.progresso_usuario 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.cursos (nome, categoria, descricao, status) VALUES
('Fundamentos de PABX', 'Básico', 'Curso introdutório sobre sistemas PABX', 'ativo'),
('Configuração Avançada', 'Avançado', 'Configurações avançadas de PABX', 'ativo'),
('Omnichannel Essencial', 'Intermediário', 'Introdução ao Omnichannel', 'ativo');

INSERT INTO public.modulos (curso_id, nome_modulo, duracao, ordem) 
SELECT 
  c.id,
  'Módulo ' || s.num || ' - ' || c.nome,
  30 + (s.num * 10),
  s.num
FROM public.cursos c
CROSS JOIN generate_series(1, 3) AS s(num);
