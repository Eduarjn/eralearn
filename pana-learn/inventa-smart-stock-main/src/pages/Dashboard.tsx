
import { ERALayout } from '@/components/ERALayout';
import { DashboardStats } from '@/components/DashboardStats';
import { CourseCard } from '@/components/CourseCard';
import { TestDashboard } from '@/components/TestDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Video, Award, Clock, ArrowRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data: courses = [] } = useCourses();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const isAdmin = userProfile?.tipo_usuario === 'admin';
  const featuredCourses = courses.slice(0, 3);

  const handleStartCourse = (courseId: string) => {
    console.log('Starting course:', courseId);
    // Implementar navegação para o curso
  };

  const handleViewAllCourses = () => {
    navigate('/treinamentos');
  };

  return (
    <ERALayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-era-dark-blue">
              {isAdmin ? 'Dashboard Administrativo' : 'Meu Painel'}
            </h1>
            <p className="text-era-gray">
              {isAdmin 
                ? 'Visão geral da plataforma de treinamento' 
                : `Bem-vindo de volta, ${userProfile?.nome || 'Usuário'}!`}
            </p>
          </div>
          {isAdmin && (
            <Button className="era-lime-button font-medium px-6 py-2 rounded-full">
              Novo Treinamento
            </Button>
          )}
        </div>

        {/* Tabs para Admin */}
        {isAdmin ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="tests">
                <Settings className="h-4 w-4 mr-2" />
                Testes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardStats />
              
              {/* Admin Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-era-dark-blue">Atividade Recente</CardTitle>
                    <CardDescription className="text-era-gray">
                      Últimas ações na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="h-4 w-4 text-era-lime" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-era-dark-blue">
                            João Silva completou "PABX Básico"
                          </p>
                          <p className="text-xs text-era-gray">há 2 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Video className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-era-dark-blue">
                            Novo curso "Omnichannel Avançado" publicado
                          </p>
                          <p className="text-xs text-era-gray">há 4 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Award className="h-4 w-4 text-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-era-dark-blue">
                            Maria Santos conquistou certificado
                          </p>
                          <p className="text-xs text-era-gray">há 6 horas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-era-dark-blue">Progresso por Categoria</CardTitle>
                    <CardDescription className="text-era-gray">
                      Taxa de conclusão por área de treinamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-era-dark-blue font-medium">PABX</span>
                          <span className="text-era-lime font-bold">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-era-lime h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-era-dark-blue font-medium">VoIP</span>
                          <span className="text-era-lime font-bold">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-era-lime h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-era-dark-blue font-medium">Omnichannel</span>
                          <span className="text-era-lime font-bold">64%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-era-lime h-2 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tests">
              <TestDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          /* Cliente Content */
          <>
            <DashboardStats />

            {/* Cursos em Destaque */}
            {featuredCourses.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-era-dark-blue">Cursos Recomendados</h2>
                  <Button 
                    variant="ghost" 
                    onClick={handleViewAllCourses}
                    className="text-era-lime hover:text-era-dark-blue"
                  >
                    Ver todos
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onStartCourse={handleStartCourse}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Progresso do Cliente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-era-dark-blue">Seu Progresso</CardTitle>
                  <CardDescription className="text-era-gray">
                    Acompanhe seu desenvolvimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-4 w-4 text-era-lime" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-era-dark-blue">
                          Continue de onde parou
                        </p>
                        <p className="text-xs text-era-gray">
                          {featuredCourses.length > 0 
                            ? `${featuredCourses.length} cursos disponíveis`
                            : 'Nenhum curso iniciado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Award className="h-4 w-4 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-era-dark-blue">
                          Próximo certificado
                        </p>
                        <p className="text-xs text-era-gray">Complete um curso para ganhar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-era-dark-blue">Categorias Disponíveis</CardTitle>
                  <CardDescription className="text-era-gray">
                    Explore diferentes áreas de conhecimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-era-dark-blue font-medium">PABX</span>
                        <span className="text-era-lime font-bold">
                          {courses.filter(c => c.categoria === 'PABX').length} cursos
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-era-dark-blue font-medium">VoIP</span>
                        <span className="text-era-lime font-bold">
                          {courses.filter(c => c.categoria === 'VoIP').length} cursos
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-era-dark-blue font-medium">Omnichannel</span>
                        <span className="text-era-lime font-bold">
                          {courses.filter(c => c.categoria === 'Omnichannel').length} cursos
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ERALayout>
  );
};

export default Dashboard;
