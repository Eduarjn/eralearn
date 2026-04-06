"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlurText } from '@/ui/BlurText';
import { ERALayout } from "@/components/ERALayout"
import { DashboardStats } from "@/components/DashboardStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCourses } from "@/hooks/useCourses"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardStats, useRecentActivity, useCategoryProgress, useGrowthStats } from "@/hooks/useDashboardStats"
import { CheckCircle, Video, Award, Clock, Settings, TrendingUp, BookOpen, MessageCircle, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"

// ============================================================================
// 1. HOOK DE COMENTÁRIOS (Embutido no arquivo)
// ============================================================================
interface RecentComment {
  id: string;
  texto: string;
  data_criacao: string;
  autor_nome: string;
  is_admin: boolean;
  video_id: string;
  video_titulo: string;
  curso_id: string;
}

function useRecentComments(limit = 10) {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('comentarios')
          .select(`
            id, 
            texto, 
            data_criacao, 
            parent_id,
            video_id,
            usuarios:usuario_id(nome, tipo_usuario),
            videos:video_id(titulo, curso_id)
          `)
          .is('parent_id', null)
          .eq('ativo', true)
          .order('data_criacao', { ascending: false })
          .limit(limit);

        if (error) {
          console.error("Erro ao buscar comentários:", error);
          return;
        }

        if (data) {
          const formattedComments = data.map((c: any) => {
            const usuario = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios;
            const video = Array.isArray(c.videos) ? c.videos[0] : c.videos;
            return {
              id: c.id,
              texto: c.texto,
              data_criacao: c.data_criacao,
              autor_nome: usuario?.nome || 'Usuário',
              is_admin: usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'admin_master',
              video_id: c.video_id,
              video_titulo: video?.titulo || 'Vídeo não encontrado',
              curso_id: video?.curso_id || ''
            };
          });
          setComments(formattedComments.filter(c => !c.is_admin));
        }
      } catch (err) {
        console.error("Exceção:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [limit]);

  return { data: comments, isLoading: loading };
}

// ============================================================================
// 2. DASHBOARD PRINCIPAL
// ============================================================================
const Dashboard = () => {
    const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useCourses()
    const { userProfile } = useAuth()
    const navigate = useNavigate()

    const { data: stats, isLoading: statsLoading } = useDashboardStats()
    const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivity()
    const { data: categoryProgress, isLoading: progressLoading } = useCategoryProgress(userProfile?.id)
    const { data: growthStats, isLoading: growthLoading } = useGrowthStats()
    
    // Puxando os comentários aqui para usar dentro do Card de Progresso
    const { data: recentComments, isLoading: commentsLoading } = useRecentComments(5);

    const isAdmin = userProfile?.tipo_usuario === "admin" || userProfile?.tipo_usuario === "admin_master"
    const featuredCourses = courses

    const handleStartCourse = (courseId: string) => navigate(`/curso/${courseId}`)
    const handleViewAllCourses = () => navigate("/treinamentos")

    const categories = Array.from(new Set(courses.map((course) => course.categoria)))

    const testCoursesLoading = () => {
        if (import.meta.env.DEV) {
            alert(`Cursos carregados: ${courses.length}\nCategorias: ${categories.join(", ")}\nUsuário: ${userProfile?.email}\nTipo: ${userProfile?.tipo_usuario}`)
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        if (diffInMinutes < 1) return "agora mesmo"
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? "s" : ""} atrás`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} dia${diffInDays > 1 ? "s" : ""} atrás`
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "course_completed": return <CheckCircle className="h-5 w-5 text-green-500" />
            case "course_started": return <Video className="h-5 w-5 text-blue-500" />
            case "certificate_earned": return <Award className="h-5 w-5 text-purple-500" />
            default: return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getActivityText = (activity: { type: string, user_name: string, course_name?: string, category_name?: string }) => {
        switch (activity.type) {
            case "course_completed": return `${activity.user_name} completou o curso ${activity.course_name}`
            case "course_started": return `${activity.user_name} iniciou o curso ${activity.course_name}`
            case "certificate_earned": return `${activity.user_name} conquistou certificado de ${activity.category_name}`
            default: return "Atividade realizada"
        }
    }

    return (
        <ERALayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-era-gray-light to-era-green/10">
                {/* Hero Section */}
                <div
                    className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md"
                    style={{ background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)" }}
                >
                    <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                                        <BlurText text="Plataforma de Ensino" className="text-xs lg:text-sm font-medium text-era-green m-0 p-0" delay={20} animateBy="words" />
                                    </div>
                                    <div className="mb-2 lg:mb-3">
                                        <BlurText text="Bem-vindo! Estamos felizes em tê-lo conosco!" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white m-0 p-0" delay={30} animateBy="words" direction="top" />
                                    </div>
                                    <div className="mb-3 lg:mb-4 max-w-2xl">
                                        <BlurText text={`Você tem ${featuredCourses.length} cursos em andamento. Continue aprendendo!`} className="text-sm sm:text-base lg:text-lg md:text-xl text-white m-0 p-0" delay={20} animateBy="words" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <BlurText text="Cursos disponíveis" className="text-white m-0 p-0" delay={20} animateBy="words" />
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <BlurText text="Progresso contínuo" className="text-white m-0 p-0" delay={20} animateBy="words" />
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <Award className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <BlurText text="Certificações" className="text-white m-0 p-0" delay={20} animateBy="words" />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleViewAllCourses}
                                    className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white border border-era-green/30 backdrop-blur-sm font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                                    Ver meus cursos
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 lg:px-6 py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <Tabs defaultValue={isAdmin ? "admin" : "user"} className="w-full sm:w-auto">
                                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                                    {isAdmin && (
                                        <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white">
                                            Admin
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger value="user" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white">
                                        Usuário
                                    </TabsTrigger>
                                </TabsList>

                                {/* ================= ABA ADMIN ================= */}
                                {isAdmin && (
                                    <TabsContent value="admin" className="mt-6 space-y-6">
                                        
                                        {/* DashboardStats Volta a ocupar a linha de cima inteira */}
                                        <DashboardStats />

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Card 1: Atividade Recente */}
                                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                                                <CardHeader className="bg-era-gray-medium text-white rounded-t-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-white/20 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                                                        <div>
                                                            <CardTitle className="text-white font-bold">Atividade Recente</CardTitle>
                                                            <p className="text-sm text-white/90 font-medium">Últimas ações dos usuários na plataforma</p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    {recentActivities && recentActivities.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {recentActivities.map((activity) => (
                                                                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-era-gray-light rounded-lg">
                                                                    {getActivityIcon(activity.type)}
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-era-black">{getActivityText(activity)}</p>
                                                                        <p className="text-xs text-era-gray-medium">{formatTimeAgo(activity.created_at)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-era-gray-medium text-center py-8">Nenhuma atividade recente</p>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Card 2: Progresso por Categoria + Mural de Dúvidas (NO MESMO CARD) */}
                                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden">
                                                <CardHeader className="bg-era-gray-medium text-white rounded-t-lg shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
                                                        <div>
                                                            <CardTitle className="text-white font-bold">Progresso & Engajamento</CardTitle>
                                                            <p className="text-sm text-white/90 font-medium">Categorias e dúvidas recentes</p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                
                                                <CardContent className="p-0 flex-1 flex flex-col">
                                                    
                                                    {/* Secção 1 de Cima: Barras de Progresso */}
                                                    <div className="p-6 border-b border-gray-200 bg-white shrink-0">
                                                        <h4 className="text-sm font-semibold text-era-black mb-4 flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-era-green" /> 
                                                            Progresso por Categoria
                                                        </h4>
                                                        {categoryProgress && categoryProgress.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {categoryProgress.map((category) => (
                                                                    <div key={category.categoria} className="space-y-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-era-black font-medium text-sm">{category.categoria}</span>
                                                                            <span className="text-era-green font-bold text-sm">{category.progress}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-era-gray-light rounded-full h-2">
                                                                            <div className="bg-era-green h-2 rounded-full transition-all duration-300" style={{ width: `${category.progress}%` }}></div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-era-gray-medium text-center py-2 text-sm">Nenhum progresso disponível</p>
                                                        )}
                                                    </div>

                                                    {/* Secção 2 de Baixo: Mural de Dúvidas */}
                                                    <div className="p-6 bg-gray-50 flex-1">
                                                        <h4 className="text-sm font-semibold text-era-black mb-4 flex items-center gap-2">
                                                            <MessageCircle className="h-4 w-4 text-era-green" /> 
                                                            Mural de Dúvidas Recentes
                                                        </h4>
                                                        
                                                        {commentsLoading ? (
                                                            <div className="flex justify-center p-4">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-era-green"></div>
                                                            </div>
                                                        ) : recentComments.length === 0 ? (
                                                            <p className="text-center text-gray-500 py-4 text-sm">Nenhum comentário recente.</p>
                                                        ) : (
                                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                                {recentComments.map((comment) => (
                                                                    <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-era-green/30 transition-colors">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-semibold text-xs text-era-black">{comment.autor_nome}</span>
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(comment.data_criacao).toLocaleDateString('pt-BR')}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-gray-500 mb-2 truncate">
                                                                            Vídeo: <span className="font-medium text-gray-700">{comment.video_titulo}</span>
                                                                        </p>
                                                                        <p className="text-sm text-gray-700 italic line-clamp-2 bg-gray-50 p-2 rounded mb-2">"{comment.texto}"</p>
                                                                        <div className="flex justify-end">
                                                                            <button 
                                                                                onClick={() => { if(comment.curso_id) navigate(`/curso/${comment.curso_id}`) }}
                                                                                className="flex items-center gap-1 text-[11px] font-semibold text-era-green hover:text-era-black transition-colors"
                                                                            >
                                                                                Ver Vídeo <ExternalLink className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>
                                )}

                                {/* ================= ABA USUÁRIO ================= */}
                                <TabsContent value="user" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                            <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/20 rounded-lg"><BookOpen className="h-5 w-5 text-white" /></div>
                                                    <div>
                                                        <CardTitle className="text-white font-bold">Cursos Disponíveis</CardTitle>
                                                        <p className="text-sm text-white/90 font-medium">Cursos para você fazer</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="text-3xl font-bold text-era-black">{courses.length}</div>
                                                <p className="text-sm text-era-gray-medium">Cursos ativos</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                            <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/20 rounded-lg"><Award className="h-5 w-5 text-white" /></div>
                                                    <div>
                                                        <CardTitle className="text-white font-bold">Cursos Concluídos</CardTitle>
                                                        <p className="text-sm text-white/90 font-medium">Seus certificados</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="text-3xl font-bold text-era-black">0</div>
                                                <p className="text-sm text-era-gray-medium">Certificados conquistados</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                            <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
                                                    <div>
                                                        <CardTitle className="text-white font-bold">Seu Progresso</CardTitle>
                                                        <p className="text-sm text-white/90 font-medium">Progresso geral</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="text-3xl font-bold text-era-black">0%</div>
                                                <p className="text-sm text-era-gray-medium">Média geral</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                            <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/20 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                                                    <div>
                                                        <CardTitle className="text-white font-bold">Em Andamento</CardTitle>
                                                        <p className="text-sm text-white/90 font-medium">Cursos ativos</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="text-3xl font-bold text-era-black">0</div>
                                                <p className="text-sm text-era-gray-medium">Cursos em progresso</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            
                            {isAdmin && (
                                <Button
                                    onClick={() => navigate("/treinamentos")}
                                    className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ml-auto"
                                >
                                    <Settings className="h-4 w-4" />
                                    Novo Treinamento
                                </Button>
                            )}
                        </div>

                        {/* Cursos Recomendados */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-era-black">Cursos Recomendados</h2>
                                <Button onClick={handleViewAllCourses} className="text-era-green hover:text-era-black hover:bg-era-green/10" variant="ghost">Ver todos</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredCourses.slice(0, 3).map((course) => (
                                    <Card key={course.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg"><BookOpen className="h-5 w-5 text-white" /></div>
                                                <div>
                                                    <CardTitle className="text-white font-bold">{course.nome}</CardTitle>
                                                    <p className="text-sm text-white/90 font-medium">{course.categoria}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <p className="text-era-gray-medium text-sm mb-4">{course.descricao}</p>
                                            <Button onClick={() => handleStartCourse(course.id)} className="w-full bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-500/90 hover:via-gray-600/90 hover:to-gray-700/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold rounded-lg">
                                                Começar Curso
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ERALayout>
    )
}

export default Dashboard