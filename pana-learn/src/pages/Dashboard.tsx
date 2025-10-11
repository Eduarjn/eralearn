"use client"

import { ERALayout } from "@/components/ERALayout"
import { DashboardStats } from "@/components/DashboardStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCourses } from "@/hooks/useCourses"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardStats, useRecentActivity, useCategoryProgress, useGrowthStats } from "@/hooks/useDashboardStats"
import { CheckCircle, Video, Award, Clock, Settings, TrendingUp, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
    const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useCourses()
    const { userProfile } = useAuth()
    const navigate = useNavigate()

    // Hooks para dados reais
    const { data: stats, isLoading: statsLoading } = useDashboardStats()
    const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivity()
    const { data: categoryProgress, isLoading: progressLoading } = useCategoryProgress(userProfile?.id)
    const { data: growthStats, isLoading: growthLoading } = useGrowthStats()

    const isAdmin = userProfile?.tipo_usuario === "admin"
    const featuredCourses = courses

    if (import.meta.env.DEV && coursesError) {
        console.error("Dashboard - Error loading courses:", coursesError)
    }

    const handleStartCourse = (courseId: string) => {
        navigate(`/curso/${courseId}`)
    }

    const handleViewAllCourses = () => {
        navigate("/treinamentos")
    }

    const categories = Array.from(new Set(courses.map((course) => course.categoria)))

    const testCoursesLoading = () => {
        if (import.meta.env.DEV) {
            console.log("Testing course loading...")
            console.log("Courses loaded:", courses.length)
            console.log("Categories:", categories)
            console.log("User:", userProfile?.email, "Type:", userProfile?.tipo_usuario)

            const message = `Cursos carregados: ${courses.length}\nCategorias: ${categories.join(", ")}\nUsuário: ${userProfile?.email}\nTipo: ${userProfile?.tipo_usuario}`
            alert(message)
        }
    }

    // Função para formatar tempo relativo
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

    // Função para obter ícone baseado no tipo de atividade
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "course_completed":
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case "course_started":
                return <Video className="h-5 w-5 text-blue-500" />
            case "certificate_earned":
                return <Award className="h-5 w-5 text-purple-500" />
            default:
                return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    // Função para obter texto da atividade
    const getActivityText = (activity: {
        type: string
        user_name: string
        course_name?: string
        category_name?: string
    }) => {
        switch (activity.type) {
            case "course_completed":
                return `${activity.user_name} completou o curso ${activity.course_name}`
            case "course_started":
                return `${activity.user_name} iniciou o curso ${activity.course_name}`
            case "certificate_earned":
                return `${activity.user_name} conquistou certificado de ${activity.category_name}`
            default:
                return "Atividade realizada"
        }
    }

    return (
        <ERALayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-era-gray-light to-era-green/10">
                {/* Hero Section com gradiente */}
                <div
                    className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md"
                    style={{ background: "linear-gradient(90deg, #000000 0%, #4A4A4A 40%, #34C759 100%)" }}
                >
                    <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                                        <span className="text-xs lg:text-sm font-medium text-era-green">Plataforma de Ensino</span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 bg-gradient-to-r from-white to-era-green bg-clip-text text-transparent">
                                        Bem-vindo de volta!
                                    </h1>
                                    <p className="text-sm sm:text-base lg:text-lg md:text-xl text-white max-w-2xl">
                                        Você tem {featuredCourses.length} cursos em andamento. Continue aprendendo!
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span className="text-white">Cursos disponíveis</span>
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span className="text-white">Progresso contínuo</span>
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            <Award className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span className="text-white">Certificações</span>
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
                        {/* Navegação e Botão Novo Treinamento */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <Tabs defaultValue="relatorios" className="w-full sm:w-auto">
                                <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                                    <TabsTrigger
                                        value="relatorios"
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white"
                                    >
                                        Relatórios
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="estatisticas"
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white"
                                    >
                                        Estatísticas
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="treinamentos"
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white"
                                    >
                                        Próximos Treinamentos
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button
                                onClick={() => navigate("/treinamentos")}
                                className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <Settings className="h-4 w-4" />
                                Novo Treinamento
                            </Button>
                        </div>

                        {/* Cards de Informações */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Card de Atividade Recente */}
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Clock className="h-5 w-5 text-white" />
                                        </div>
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

                            {/* Card de Progresso por Categoria */}
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white font-bold">Progresso por Categoria</CardTitle>
                                            <p className="text-sm text-white/90 font-medium">Acompanhe o progresso dos seus cursos</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {categoryProgress && categoryProgress.length > 0 ? (
                                        <div className="space-y-4">
                                            {categoryProgress.map((category) => (
                                                <div key={category.categoria} className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-era-black font-medium">{category.categoria}</span>
                                                        <span className="text-era-green font-bold">{category.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-era-gray-light rounded-full h-3">
                                                        <div
                                                            className="bg-era-green h-3 rounded-full transition-all duration-300"
                                                            style={{ width: `${category.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-era-gray-medium text-center py-8">Nenhum progresso disponível</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Estatísticas */}
                        <Tabs defaultValue="admin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                                <TabsTrigger
                                    value="admin"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white"
                                >
                                    Admin
                                </TabsTrigger>
                                <TabsTrigger
                                    value="user"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white"
                                >
                                    Usuário
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="admin" className="mt-6">
                                <DashboardStats />
                            </TabsContent>

                            <TabsContent value="user" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Cards de estatísticas do usuário */}
                                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>
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
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <Award className="h-5 w-5 text-white" />
                                                </div>
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
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-white" />
                                                </div>
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
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
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

                        {/* Cursos Recomendados */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-era-black">Cursos Recomendados</h2>
                                <Button
                                    onClick={handleViewAllCourses}
                                    className="text-era-green hover:text-era-black hover:bg-era-green/10"
                                    variant="ghost"
                                >
                                    Ver todos
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredCourses.slice(0, 3).map((course) => (
                                    <Card
                                        key={course.id}
                                        className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                                    >
                                        <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-white font-bold">{course.nome}</CardTitle>
                                                    <p className="text-sm text-white/90 font-medium">{course.categoria}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <p className="text-era-gray-medium text-sm mb-4">{course.descricao}</p>
                                            <Button
                                                onClick={() => handleStartCourse(course.id)}
                                                className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                            >
                                                Começar Curso
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Botão de Teste */}
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={testCoursesLoading}
                                className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white border border-era-green/30 backdrop-blur-sm font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Testar Loading de Cursos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ERALayout>
    )
}

export default Dashboard
