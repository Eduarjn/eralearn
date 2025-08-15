
import { useAuth } from '@/hooks/useAuth';
import { useCourses, useUserProgress, useTestConnection } from '@/hooks/useCourses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database, Users, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';

export function TestDashboard() {
  const { userProfile, createTestUsers } = useAuth();
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const { data: connectionTest, isLoading: testLoading } = useTestConnection();

  const handleCreateTestUsers = async () => {
    await createTestUsers();
    window.location.reload();
  };

  const testResults = [
    {
      name: 'Autenticação',
      status: userProfile ? 'success' : 'error',
      message: userProfile ? `Usuário logado: ${userProfile.nome} (${userProfile.tipo_usuario})` : 'Usuário não autenticado',
      icon: Users
    },
    {
      name: 'Cursos',
      status: courses && courses.length > 0 ? 'success' : coursesError ? 'error' : 'warning',
      message: courses ? `${courses.length} cursos encontrados` : coursesError ? 'Erro ao carregar cursos' : 'Carregando...',
      icon: BookOpen
    },
    {
      name: 'Progresso',
      status: progress ? 'success' : 'warning',
      message: progress ? `${progress.length} registros de progresso` : 'Nenhum progresso encontrado',
      icon: BarChart3
    },
    {
      name: 'Conectividade',
      status: connectionTest ? 'success' : 'warning',
      message: connectionTest ? 'Todas as tabelas acessíveis' : 'Testando conexões...',
      icon: Database
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-era-dark-blue">🔧 Painel de Testes</h2>
          <p className="text-era-gray">Validação de funcionalidades da plataforma</p>
        </div>
        <Button onClick={handleCreateTestUsers} className="era-lime-button">
          Recriar Usuários de Teste
        </Button>
      </div>

      {/* Status dos Testes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testResults.map((test, index) => (
          <Card key={index} className={`border ${getStatusColor(test.status)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{test.name}</CardTitle>
                {getStatusIcon(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">{test.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes dos Cursos */}
      {courses && courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📚 Cursos Disponíveis</CardTitle>
            <CardDescription>Lista de cursos carregados da base de dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-era-dark-blue">{course.nome}</p>
                    <p className="text-sm text-era-gray">{course.categoria} - {course.status}</p>
                  </div>
                  <div className="text-xs text-era-gray">
                    ID: {course.id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conectividade das Tabelas */}
      {connectionTest && (
        <Card>
          <CardHeader>
            <CardTitle>🗄️ Status das Tabelas</CardTitle>
            <CardDescription>Conectividade com as tabelas do banco de dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(connectionTest).map(([table, count]) => (
                <div key={table} className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-era-dark-blue">{count}</div>
                  <div className="text-xs text-era-gray capitalize">{table}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Usuário */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>👤 Perfil do Usuário</CardTitle>
            <CardDescription>Informações do usuário autenticado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {userProfile.nome}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Tipo:</strong> {userProfile.tipo_usuario}</p>
              <p><strong>Status:</strong> {userProfile.status}</p>
              <p><strong>Data de Criação:</strong> {new Date(userProfile.data_criacao).toLocaleDateString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erros */}
      {coursesError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            <strong>Erro ao carregar cursos:</strong> {coursesError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading States */}
      {(coursesLoading || progressLoading || testLoading) && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <AlertDescription className="text-blue-800">
              Carregando dados da plataforma...
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
