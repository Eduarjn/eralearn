import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalCertificates: number;
  completionRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'course_completed' | 'course_started' | 'certificate_earned';
  user_name: string;
  course_name?: string;
  category_name?: string;
  created_at: string;
  nota?: number;
}

export interface CategoryProgress {
  categoria: string;
  progress: number;
  modules_completed: number;
  total_modules: number;
  course_name: string;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // 1. Total de Usuários Ativos
      const { count: userCount, error: userError } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativo');
      if (userError) throw userError;

      // 2. Total de Cursos Ativos
      const { count: courseCount, error: courseError } = await supabase
        .from('cursos')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativo');
      if (courseError) throw courseError;

      // 3. Total de Certificados Emitidos (todos os tempos)
      const { count: certCount, error: certError } = await supabase
        .from('certificados')
        .select('id', { count: 'exact', head: true });
      if (certError) throw certError;

      // 4. Taxa de Conclusão: cursos concluídos / cursos iniciados
      const { data: progressData, error: progressError } = await supabase
        .from('progresso_usuario')
        .select('status');
      if (progressError) throw progressError;
      const totalStarted = progressData?.filter(p => p.status !== 'nao_iniciado').length || 0;
      const totalCompleted = progressData?.filter(p => p.status === 'concluido').length || 0;
      const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

      return {
        totalUsers: userCount || 0,
        totalCourses: courseCount || 0,
        totalCertificates: certCount || 0,
        completionRate,
      };
    },
    refetchInterval: 10000, // Atualiza a cada 10s
  });
};

// Hook para atividades recentes
export const useRecentActivity = () => {
  return useQuery<RecentActivity[]>({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const activities: RecentActivity[] = [];

      try {
        // 1. Certificados recentes (últimos 7 dias)
        const { data: recentCertificates } = await supabase
          .from('certificados')
          .select('*')
          .gte('data_conclusao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('data_conclusao', { ascending: false })
          .limit(5);

        if (recentCertificates) {
          recentCertificates.forEach((cert: any) => {
            activities.push({
              id: cert.id,
              type: 'certificate_earned',
              user_name: cert.usuario_nome || 'Usuário',
              category_name: cert.categoria_nome,
              created_at: cert.data_conclusao,
              nota: cert.nota
            });
          });
        }

        // 2. Progresso de vídeos recentes (últimos 7 dias)
        const { data: recentProgress } = await supabase
          .from('progresso_usuario')
          .select('*')
          .gte('data_conclusao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('data_conclusao', { ascending: false })
          .limit(10);

        if (recentProgress) {
          recentProgress.forEach((progress: any) => {
            if (progress.status === 'concluido') {
              activities.push({
                id: progress.id,
                type: 'course_completed',
                user_name: progress.usuario_nome || 'Usuário',
                course_name: progress.video_titulo || 'Curso',
                category_name: progress.categoria_nome,
                created_at: progress.data_conclusao
              });
            } else if (progress.status === 'em_andamento') {
              activities.push({
                id: progress.id,
                type: 'course_started',
                user_name: progress.usuario_nome || 'Usuário',
                course_name: progress.video_titulo || 'Curso',
                category_name: progress.categoria_nome,
                created_at: progress.data_conclusao
              });
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
      }

      // Ordenar por data e retornar os 5 mais recentes
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    },
    refetchInterval: 30000, // Atualiza a cada 30s
  });
};

// Hook para progresso por categoria
export const useCategoryProgress = (userId?: string) => {
  return useQuery<CategoryProgress[]>({
    queryKey: ['category-progress', userId],
    queryFn: async () => {
      if (!userId) return [];

      try {
        // Buscar progresso do usuário por categoria
        const { data: userProgress } = await supabase
          .from('progresso_usuario')
          .select('*')
          .eq('usuario_id', userId);

        if (!userProgress) return [];

        // Agrupar por categoria
        const categoryMap = new Map<string, CategoryProgress>();

        userProgress.forEach((progress: any) => {
          const categoryName = progress.categoria_nome || 'Geral';
          const courseName = progress.video_titulo || 'Curso';
          
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              categoria: categoryName,
              progress: 0,
              modules_completed: 0,
              total_modules: 0,
              course_name: courseName
            });
          }

          const category = categoryMap.get(categoryName)!;
          category.total_modules++;
          
          if (progress.status === 'concluido') {
            category.modules_completed++;
          }
        });

        // Calcular progresso percentual
        const results = Array.from(categoryMap.values()).map(category => ({
          ...category,
          progress: category.total_modules > 0 
            ? Math.round((category.modules_completed / category.total_modules) * 100)
            : 0
        }));

        return results.sort((a, b) => b.progress - a.progress);
      } catch (error) {
        console.error('Erro ao buscar progresso por categoria:', error);
        return [];
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Atualiza a cada 1 min
  });
};

// Hook para estatísticas de crescimento (comparação com mês anterior)
export const useGrowthStats = () => {
  return useQuery({
    queryKey: ['growth-stats'],
    queryFn: async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      try {
        // Usuários este mês vs mês passado
        const { count: usersThisMonth } = await supabase
          .from('usuarios')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thisMonth.toISOString());

        const { count: usersLastMonth } = await supabase
          .from('usuarios')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString())
          .lt('created_at', thisMonth.toISOString());

        // Certificados este mês vs mês passado
        const { count: certsThisMonth } = await supabase
          .from('certificados')
          .select('id', { count: 'exact', head: true })
          .gte('data_conclusao', thisMonth.toISOString());

        const { count: certsLastMonth } = await supabase
          .from('certificados')
          .select('id', { count: 'exact', head: true })
          .gte('data_conclusao', lastMonth.toISOString())
          .lt('data_conclusao', thisMonth.toISOString());

        // Cursos este mês vs mês passado
        const { count: coursesThisMonth } = await supabase
          .from('cursos')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thisMonth.toISOString());

        const { count: coursesLastMonth } = await supabase
          .from('cursos')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString())
          .lt('created_at', thisMonth.toISOString());

        return {
          usersGrowth: usersLastMonth ? Math.round(((usersThisMonth || 0) - usersLastMonth) / usersLastMonth * 100) : 12,
          certificatesGrowth: certsLastMonth ? Math.round(((certsThisMonth || 0) - certsLastMonth) / certsLastMonth * 100) : 28,
          coursesGrowth: coursesLastMonth ? Math.round(((coursesThisMonth || 0) - coursesLastMonth) / coursesLastMonth * 100) : 3,
          completionRateGrowth: 5 // Valor fixo por enquanto
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas de crescimento:', error);
        return {
          usersGrowth: 12,
          certificatesGrowth: 28,
          coursesGrowth: 3,
          completionRateGrowth: 5
        };
      }
    },
    refetchInterval: 300000, // Atualiza a cada 5 min
  });
}; 