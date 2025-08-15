import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Award, TrendingUp } from 'lucide-react';
import { useCourses, useUserProgress } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export function DashboardStats() {
  const { data: statsData, isLoading, isError } = useDashboardStats();
  const { data: courses = [] } = useCourses();
  const { data: userProgress = [] } = useUserProgress();
  const { userProfile } = useAuth();

  const isAdmin = userProfile?.tipo_usuario === 'admin';
  
  // Calcular estatísticas
  const totalCourses = courses.length;
  const userCompletedCourses = userProgress.filter(p => p.status === 'concluido').length;
  const userInProgressCourses = userProgress.filter(p => p.status === 'em_andamento').length;
  const overallProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + (p.percentual_concluido || 0), 0) / userProgress.length)
    : 0;

  // Configuração de rotas para cada card
  const adminStats = [
    {
      title: "Total de Usuários",
      value: isLoading || isError ? '-' : statsData?.totalUsers.toString(),
      change: "Usuários ativos",
      icon: Users,
      color: "text-era-green",
      href: "/usuarios"
    },
    {
      title: "Cursos Disponíveis",
      value: isLoading || isError ? '-' : statsData?.totalCourses.toString(),
      change: "Cursos ativos na plataforma",
      icon: Video,
      color: "text-era-green",
      href: "/treinamentos"
    },
    {
      title: "Certificados Emitidos",
      value: isLoading || isError ? '-' : statsData?.totalCertificates.toString(),
      change: "Total emitidos",
      icon: Award,
      color: "text-era-green",
      href: "/certificados"
    },
    {
      title: "Taxa de Conclusão",
      value: isLoading || isError ? '-' : `${statsData?.completionRate ?? 0}%`,
      change: "Proporção de cursos concluídos",
      icon: TrendingUp,
      color: "text-era-green",
      href: "/relatorios"
    }
  ];

  const userStats = [
    {
      title: "Cursos Disponíveis",
      value: totalCourses.toString(),
      change: "Cursos para você fazer",
      icon: Video,
      color: "text-era-green",
      href: "/treinamentos"
    },
    {
      title: "Cursos Concluídos",
      value: userCompletedCourses.toString(),
      change: `${userInProgressCourses} em andamento`,
      icon: Award,
      color: "text-era-green",
      href: "/treinamentos"
    },
    {
      title: "Seu Progresso",
      value: `${overallProgress}%`,
      change: "Progresso geral",
      icon: TrendingUp,
      color: "text-era-green",
      href: "/relatorios"
    },
    {
      title: "Certificados",
      value: userCompletedCourses.toString(),
      change: "Certificados conquistados",
      icon: Award,
      color: "text-era-green",
      href: "/certificados"
    }
  ];

  const stats = isAdmin ? adminStats : userStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Link
          key={index}
          to={stat.href}
          aria-label={stat.title}
          className="block cursor-pointer focus:outline-none"
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-era-gray-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-era-black">{stat.value}</div>
              <p className="text-xs text-era-gray-medium">{stat.change}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
