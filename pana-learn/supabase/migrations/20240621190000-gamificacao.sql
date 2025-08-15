-- MIGRATION: Gamificação & Engajamento (badges, conquistas, pontos, leaderboard)

-- 1. Tabela de badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  icone_url TEXT,
  pontos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela de conquistas do usuário
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  data_conquista TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- 3. Tabela de pontos do usuário
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pontos INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RLS para badges (todos podem ver)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver badges" ON public.badges FOR SELECT USING (true);

-- 5. RLS para user_badges (usuário só vê suas conquistas)
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê suas conquistas" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário insere suas conquistas" ON public.user_badges FOR INSERT USING (auth.uid() = user_id);

-- 6. RLS para user_points (usuário só vê seus pontos)
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seus pontos" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário insere/atualiza seus pontos" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza seus pontos" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

-- 7. Índice para leaderboard
CREATE INDEX IF NOT EXISTS idx_user_points_pontos ON public.user_points (pontos DESC); 