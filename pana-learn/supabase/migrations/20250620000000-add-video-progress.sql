-- Migração para adicionar tabela de progresso de vídeos
-- Data: 2025-06-20

-- Criar tabela de progresso de vídeos
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
  tempo_assistido INTEGER DEFAULT 0, -- em segundos
  tempo_total INTEGER DEFAULT 0, -- duração total do vídeo em segundos
  percentual_assistido DECIMAL(5,2) DEFAULT 0.00,
  concluido BOOLEAN DEFAULT FALSE,
  data_primeiro_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, video_id)
);

-- Adicionar coluna modulo_id na tabela videos se não existir
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_video_progress_usuario_id ON public.video_progress(usuario_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON public.video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_curso_id ON public.video_progress(curso_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_modulo_id ON public.video_progress(modulo_id);
CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON public.videos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_videos_curso_id ON public.videos(curso_id);

-- Habilitar RLS na tabela video_progress
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para video_progress
CREATE POLICY "Usuários podem ver seu próprio progresso de vídeo" 
  ON public.video_progress 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir seu próprio progresso de vídeo" 
  ON public.video_progress 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio progresso de vídeo" 
  ON public.video_progress 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.id = usuario_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Administradores podem ver todo progresso de vídeo" 
  ON public.video_progress 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u 
      WHERE u.user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
  );

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER update_video_progress_updated_at 
  BEFORE UPDATE ON public.video_progress 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular percentual de conclusão automaticamente
CREATE OR REPLACE FUNCTION calculate_video_progress_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tempo_total > 0 THEN
    NEW.percentual_assistido = ROUND((NEW.tempo_assistido::DECIMAL / NEW.tempo_total::DECIMAL) * 100, 2);
    
    -- Marcar como concluído se assistiu 90% ou mais do vídeo
    IF NEW.percentual_assistido >= 90 THEN
      NEW.concluido = TRUE;
      NEW.data_conclusao = NOW();
    END IF;
  END IF;
  
  NEW.data_ultimo_acesso = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular percentual automaticamente
CREATE TRIGGER trigger_calculate_video_progress_percentage
  BEFORE INSERT OR UPDATE ON public.video_progress
  FOR EACH ROW EXECUTE FUNCTION calculate_video_progress_percentage();

-- Função para sincronizar progresso de vídeo com progresso de módulo
CREATE OR REPLACE FUNCTION sync_module_progress_from_video()
RETURNS TRIGGER AS $$
DECLARE
  module_progress_id UUID;
  total_videos_in_module INTEGER;
  completed_videos_in_module INTEGER;
  module_percentage DECIMAL(5,2);
BEGIN
  -- Se o vídeo foi concluído, atualizar progresso do módulo
  IF NEW.concluido = TRUE AND OLD.concluido = FALSE THEN
    -- Buscar ou criar progresso do módulo
    SELECT id INTO module_progress_id
    FROM public.progresso_usuario
    WHERE usuario_id = NEW.usuario_id 
      AND curso_id = NEW.curso_id 
      AND modulo_id = NEW.modulo_id;
    
    IF module_progress_id IS NULL THEN
      -- Criar novo progresso do módulo
      INSERT INTO public.progresso_usuario (
        usuario_id, curso_id, modulo_id, status, 
        percentual_concluido, data_inicio, data_conclusao
      ) VALUES (
        NEW.usuario_id, NEW.curso_id, NEW.modulo_id, 'em_andamento',
        0, NOW(), NULL
      ) RETURNING id INTO module_progress_id;
    END IF;
    
    -- Calcular percentual do módulo baseado nos vídeos concluídos
    SELECT COUNT(*) INTO total_videos_in_module
    FROM public.videos
    WHERE modulo_id = NEW.modulo_id;
    
    SELECT COUNT(*) INTO completed_videos_in_module
    FROM public.video_progress
    WHERE usuario_id = NEW.usuario_id 
      AND modulo_id = NEW.modulo_id 
      AND concluido = TRUE;
    
    IF total_videos_in_module > 0 THEN
      module_percentage = ROUND((completed_videos_in_module::DECIMAL / total_videos_in_module::DECIMAL) * 100, 2);
      
      -- Atualizar progresso do módulo
      UPDATE public.progresso_usuario
      SET 
        percentual_concluido = module_percentage,
        status = CASE 
          WHEN module_percentage >= 100 THEN 'concluido'
          WHEN module_percentage > 0 THEN 'em_andamento'
          ELSE 'nao_iniciado'
        END,
        data_conclusao = CASE 
          WHEN module_percentage >= 100 THEN NOW()
          ELSE data_conclusao
        END
      WHERE id = module_progress_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar progresso
CREATE TRIGGER trigger_sync_module_progress_from_video
  AFTER UPDATE ON public.video_progress
  FOR EACH ROW EXECUTE FUNCTION sync_module_progress_from_video(); 