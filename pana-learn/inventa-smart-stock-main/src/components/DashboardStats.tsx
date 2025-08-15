
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Award, TrendingUp } from 'lucide-react';
import { useCourses, useUserProgress } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';

export function DashboardStats() {
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

  const stats = isAdmin 
    ? [
        {
          title: "Total de Usuários",
          value: "284",
          change: "+12% desde o mês passado",
          icon: Users,
          color: "text-era-lime"
        },
        {
          title: "Cursos Disponíveis",
          value: totalCourses.toString(),
          change: "Cursos ativos na plataforma",
          icon: Video,
          color: "text-era-lime"
        },
        {
          title: "Certificados Emitidos",
          value: "127",
          change: "+8 esta semana",
          icon: Award,
          color: "text-era-lime"
        },
        {
          title: "Taxa de Conclusão",
          value: "78%",
          change: "+5% desde o mês passado",
          icon: TrendingUp,
          color: "text-era-lime"
        }
      ]
    : [
        {
          title: "Cursos Disponíveis",
          value: totalCourses.toString(),
          change: "Cursos para você fazer",
          icon: Video,
          color: "text-era-lime"
        },
        {
          title: "Cursos Concluídos",
          value: userCompletedCourses.toString(),
          change: `${userInProgressCourses} em andamento`,
          icon: Award,
          color: "text-era-lime"
        },
        {
          title: "Seu Progresso",
          value: `${overallProgress}%`,
          change: "Progresso geral",
          icon: TrendingUp,
          color: "text-era-lime"
        },
        {
          title: "Certificados",
          value: userCompletedCourses.toString(),
          change: "Certificados conquistados",
          icon: Award,
          color: "text-era-lime"
        }
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-era-gray">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-era-dark-blue">{stat.value}</div>
            <p className="text-xs text-era-gray">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
