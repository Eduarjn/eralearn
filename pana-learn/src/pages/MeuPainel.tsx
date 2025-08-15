import React from 'react';
import { useUserProgress } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tables } from '@/integrations/supabase/types';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Bell, 
  Settings, 
  BarChart3, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tipo para o progresso do usuário com info do curso
interface UserProgressWithCourse extends Tables<'progresso_usuario'> {
  cursos?: {
    nome: string;
    categoria: string;
  };
}

const MeuPainel = () => {
  const { data: progress = [], isLoading, error } = useUserProgress();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = userProfile?.tipo_usuario === 'admin';

  // Dados mockados para demonstração (em produção viriam do banco)
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalCourses: 45,
    completedCourses: 1234,
    certificatesIssued: 567,
    averageCompletion: 78,
    recentActivity: [
      { type: 'user', message: 'Novo usuário cadastrado: João Silva', time: '2 min atrás' },
      { type: 'course', message: 'Curso "Marketing Digital" atualizado', time: '15 min atrás' },
      { type: 'certificate', message: 'Certificado emitido para Maria Santos', time: '1 hora atrás' },
      { type: 'completion', message: 'Pedro Costa completou o curso "Gestão de Projetos"', time: '2 horas atrás' }
    ],
    popularCourses: [
      { name: 'Marketing Digital', enrollments: 234, rating: 4.8 },
      { name: 'Gestão de Projetos', enrollments: 189, rating: 4.6 },
      { name: 'Excel Avançado', enrollments: 156, rating: 4.9 }
    ],
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      lastBackup: '2 horas atrás',
      activeSessions: 45
    }
  };

  if (isAdmin) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-era-dark-blue">Painel Administrativo</h1>
            <p className="text-era-gray">Bem-vindo de volta, {userProfile?.nome}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/configuracoes')}>
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button className="bg-era-lime text-era-dark-blue flex items-center gap-2" onClick={() => navigate('/relatorios')}>
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Button>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{adminStats.activeUsers} ativos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.completedCourses} concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.certificatesIssued}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.averageCompletion}%</div>
              <p className="text-xs text-muted-foreground">
                Média geral
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividade Recente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'course' ? 'bg-green-100 text-green-600' :
                      activity.type === 'certificate' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4" />}
                      {activity.type === 'course' && <BookOpen className="h-4 w-4" />}
                      {activity.type === 'certificate' && <Award className="h-4 w-4" />}
                      {activity.type === 'completion' && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cursos Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Cursos Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminStats.popularCourses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.enrollments} inscritos</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas e Status do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/usuarios')}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Gerenciar Usuários</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/treinamentos')}
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Criar Curso</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/certificados')}
                >
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Emitir Certificado</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate('/relatorios')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Ver Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={adminStats.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                    {adminStats.systemHealth.status === 'healthy' ? 'Operacional' : 'Problemas'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium">{adminStats.systemHealth.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Último Backup</span>
                  <span className="text-sm font-medium">{adminStats.systemHealth.lastBackup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sessões Ativas</span>
                  <span className="text-sm font-medium">{adminStats.systemHealth.activeSessions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Interface para clientes (mantém o original)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meu Painel</h1>
      <p className="mb-6">Aqui você verá seus cursos, módulos e progresso.</p>
      {isLoading && <p>Carregando progresso...</p>}
      {error && <p className="text-red-500">Erro ao carregar progresso.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(progress as UserProgressWithCourse[]).map((item) => (
          <div key={item.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
            <div>
              <div className="font-bold text-era-dark-blue mb-1">{item.cursos?.nome || 'Curso'}</div>
              <div className="text-sm text-era-gray mb-2">Progresso: {item.percentual_concluido ?? 0}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-era-lime h-2 rounded-full" style={{ width: `${item.percentual_concluido ?? 0}%` }}></div>
              </div>
            </div>
            <Button className="bg-era-lime text-era-dark-blue px-4 py-1 rounded font-bold mt-2" onClick={() => window.location.href = `/curso/${item.curso_id}` }>
              {item.percentual_concluido && item.percentual_concluido < 100 ? 'Continuar Curso' : 'Rever Curso'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeuPainel; 