import { BlurText } from '@/ui/BlurText';
import { ERALayout } from '@/components/ERALayout';
import { CourseCard } from '@/components/CourseCard';
import VideoUpload from '@/components/VideoUpload';
import { useCourses } from '@/hooks/useCourses';
import type { Course } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Video, Eye, Clock, Users, TrendingUp, Star, BookOpen, Settings, ListOrdered, ArrowLeft, Trash, Lock, Shield, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Video = Database['public']['Tables']['videos']['Row'] & {
  cursos?: {
    id: string;
    nome: string;
    categoria: string;
  };
  modulos?: {
    id: string;
    nome_modulo: string;
  };
};

interface CategoryGroup {
  categoria: string;
  cursos: Array<any>;
  totalHoras: number;
  niveis: string[];
  cursosAtivos: number;
}

const Treinamentos = () => {
  const { data: courses = [], isLoading, error, refetch } = useCourses();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🛠️ ESTADOS NOVOS: CRIAÇÃO E VISIBILIDADE
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  // Visibilidade padrão: todos marcados
  const [newCourseVisibility, setNewCourseVisibility] = useState<string[]>(['admin', 'comercial', 'cliente']);

  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

  // Carregar vídeos para qualquer usuário autenticado
  useEffect(() => {
    if (userProfile) {
      loadVideos();
    }
  }, [userProfile]);

  const loadVideos = async () => {
    setLoadingVideos(true);
    console.log('🔍 Carregando vídeos...');
    
    try {
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (videosError) throw videosError;

      if (videosData && videosData.length > 0) {
        const cursoIds = [...new Set(videosData.map(v => v.curso_id).filter(Boolean))];
        if (cursoIds.length > 0) {
          const { data: cursosData } = await supabase
            .from('cursos')
            .select('id, nome, categoria')
            .in('id', cursoIds);

          if (cursosData) {
            const videosWithCursos = videosData.map(video => {
              const curso = cursosData.find(c => c.id === video.curso_id);
              return { ...video, cursos: curso || null };
            });
            setVideos(videosWithCursos);
            return;
          }
        }
      }
      setVideos(videosData || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar vídeos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // 🗑️ FUNÇÃO DE DELETAR CURSO (NOVA)
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!isAdmin) return;
    
    if (!window.confirm(`Tem certeza que deseja EXCLUIR o curso "${courseName}"?\nIsso é irreversível.`)) return;

    try {
        const { error } = await supabase
            .from('cursos')
            .delete()
            .eq('id', courseId);

        if (error) throw error;

        toast({
            title: "Curso excluído",
            description: `O curso "${courseName}" foi removido.`
        });
        
        refetch(); // Atualiza a tela

    } catch (err) {
        console.error("Erro ao deletar:", err);
        toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o curso. Verifique se existem vídeos vinculados.",
            variant: "destructive"
        });
    }
  };

  // 🔒 FUNÇÃO TOGGLE VISIBILIDADE (NOVA)
  const toggleVisibility = (role: string) => {
    setNewCourseVisibility(prev => 
        prev.includes(role) 
            ? prev.filter(r => r !== role) 
            : [...prev, role]
    );
  };

  // 🛠️ FUNÇÃO CRIAR CURSO (ATUALIZADA)
  const handleCreateCourse = async () => {
    try {
      if (!newCourseName || !newCourseCategory) {
        toast({
          title: "Campos obrigatórios",
          description: "Informe nome e categoria.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('cursos')
        .insert({
          nome: newCourseName,
          categoria: newCourseCategory,
          descricao: newCourseDescription,
          status: 'ativo',
          visibilidade: newCourseVisibility // Salva permissões
        });

      if (error) throw error;

      toast({
        title: "Curso criado!",
        description: "O curso foi criado com sucesso 🎉"
      });

      setShowCreateCourseModal(false);
      setNewCourseName('');
      setNewCourseCategory('');
      setNewCourseDescription('');
      setNewCourseVisibility(['admin', 'comercial', 'cliente']);
      refetch();

    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao criar curso",
        description: "Verifique o console.",
        variant: "destructive"
      });
    }
  };

  // --- SEU MOCK ORIGINAL (Mantido para garantir as cores exatas) ---
  const cursosPrincipaisMock = [
    {
      nome: 'Fundamentos de PABX',
      descricao: 'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas',
      categoria: 'PABX',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'PABX', cor: '#3B82F6' },
      gradient: 'from-blue-500 to-blue-600',
      icon: '📞',
      duration: '2-3 horas',
      modules: '5 módulos',
      level: 'Iniciante'
    },
    {
      nome: 'Fundamentos CALLCENTER',
      descricao: 'Introdução aos sistemas de call center e suas funcionalidades',
      categoria: 'CALLCENTER',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'CALLCENTER', cor: '#6366F1' },
      gradient: 'from-indigo-500 to-purple-600',
      icon: '🎧',
      duration: '2-3 horas',
      modules: '4 módulos',
      level: 'Iniciante'
    },
    {
      nome: 'Configurações Avançadas PABX',
      descricao: 'Configurações avançadas para otimização do sistema PABX',
      categoria: 'PABX',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'PABX', cor: '#3B82F6' },
      gradient: 'from-blue-600 to-cyan-500',
      icon: '⚙️',
      duration: '3-4 horas',
      modules: '6 módulos',
      level: 'Avançado'
    },
    {
      nome: 'OMNICHANNEL para Empresas',
      descricao: 'Implementação de soluções omnichannel em ambientes empresariais',
      categoria: 'OMNICHANNEL',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'OMNICHANNEL', cor: '#10B981' },
      gradient: 'from-emerald-500 to-teal-600',
      icon: '🌐',
      duration: '4-5 horas',
      modules: '8 módulos',
      level: 'Intermediário'
    },
    {
      nome: 'Configurações Avançadas OMNI',
      descricao: 'Configurações avançadas para sistemas omnichannel',
      categoria: 'OMNICHANNEL',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'OMNICHANNEL', cor: '#10B981' },
      gradient: 'from-teal-500 to-green-600',
      icon: '🚀',
      duration: '5-6 horas',
      modules: '10 módulos',
      level: 'Avançado'
    },
    {
      nome: 'Técnicas de Vendas Essenciais',
      descricao: 'Curso completo sobre abordagens comerciais e fechamento de vendas',
      categoria: 'Comercial',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'Comercial', cor: '#F59E0B' },
      gradient: 'from-amber-500 to-orange-600',
      icon: '💼',
      duration: '4 horas',
      modules: '3 módulos',
      level: 'Intermediário'
    },
    {
      nome: 'Discador', 
      descricao: 'Treinamento completo sobre o uso e configuração do Discador',
      categoria: 'CALLCENTER',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'CALLCENTER', cor: '#6366F1' },
      gradient: 'from-indigo-500 to-purple-600',
      icon: '📞', 
      duration: '6 horas',
      modules: '8 módulos',
      level: 'Avançado'
    },
  ];

  // 🚀 AQUI ESTÁ O SEGREDO PARA NÃO QUEBRAR O LAYOUT
  // Em vez de usar apenas o mock ou apenas o banco, unimos os dois.
  // Se o curso do banco tiver o nome de um mock, ele ganha as cores bonitas.
  // Se for novo, ganha um estilo padrão escuro (para a letra ficar branca).
  const getCourseWithVisuals = (dbCourse: any) => {
    const visualMock = cursosPrincipaisMock.find(m => m.nome === dbCourse.nome);
    
    // Estilo padrão para cursos novos (Mantém letra branca)
    const fallbackVisual = {
        gradient: 'from-slate-700 to-slate-900', // Fundo escuro = letra branca
        icon: '🎓',
        level: 'Geral',
        duration: 'A definir',
        modules: 'Em breve',
        categorias: { nome: dbCourse.categoria, cor: '#10B981' }
    };

    return {
        ...fallbackVisual,
        ...visualMock, // Sobrescreve com o visual oficial se existir
        ...dbCourse,   // Garante dados reais do banco
        id: dbCourse.id // ID real para deletar/abrir
    };
  };

  // Gerar lista base
  const baseList = courses.length > 0 
    ? courses.map(getCourseWithVisuals)
    : cursosPrincipaisMock.map(mock => ({ ...mock, id: `mock-${mock.nome}` }));

  // --- FILTRO COM VISIBILIDADE E BUSCA ---
  const filteredCourses = baseList.filter(course => {
    // 🔒 Filtro de Visibilidade
    if (!isAdmin) {
      const userType = userProfile?.tipo_usuario || 'cliente';
      const allowedRoles = course.visibilidade; 
      
      // Se a coluna existe e tem dados
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!allowedRoles.includes(userType) && !allowedRoles.includes('todos')) {
           return false; // Esconde o curso
        }
      }
    }
    
    // Filtro antigo (mantido por segurança)
    if (course.categoria === 'Comercial' && !isAdmin) return false;

    const matchesSearch = course.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || course.categoria === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });

  // Função utilitária para pegar propriedade visual de mock ou valor padrão
  function getVisualProp(course: any, prop: string, fallback: any) {
    return course[prop] || fallback;
  }

  // Obter categorias únicas
  const categories = Array.from(new Set(courses.map(course => course.categoria))).filter(Boolean);

  const getCoursesByCategory = (): CategoryGroup[] => {
    const categoryGroups: { [key: string]: CategoryGroup } = {};

    filteredCourses.forEach(course => {
      if (!categoryGroups[course.categoria]) {
        categoryGroups[course.categoria] = {
          categoria: course.categoria,
          cursos: [],
          totalHoras: 0,
          niveis: [],
          cursosAtivos: 0
        };
      }

      categoryGroups[course.categoria].cursos.push(course);
      
      const level = getVisualProp(course, 'level', 'Iniciante');
      const durStr = getVisualProp(course, 'duration', '0');
      const hoursMatch = typeof durStr === 'string' ? durStr.match(/\d+/) : null;
      const horas = hoursMatch ? parseInt(hoursMatch[0]) : 0;
      categoryGroups[course.categoria].totalHoras += horas;

      if (!categoryGroups[course.categoria].niveis.includes(level)) {
        categoryGroups[course.categoria].niveis.push(level);
      }
      if (course.status === 'ativo') {
        categoryGroups[course.categoria].cursosAtivos++;
      }
    });

    return Object.values(categoryGroups).sort((a, b) => 
      b.cursos.length - a.cursos.length
    );
  };

  const handleViewCategoryCourses = (categoryGroup: CategoryGroup) => {
    setSelectedCategory(categoryGroup.categoria);
    setSearchTerm('');
  };

  const handleStartCourse = (courseId: string) => {
    if (courseId.startsWith('mock-')) {
      toast({
        title: "Curso indisponível",
        description: "Este curso ainda não foi configurado no banco de dados.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/curso/${courseId}`);
  };

  const handleUploadSuccess = () => {
    loadVideos();
    refetch();
  };

  const handleViewVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!window.confirm('Tem certeza que deseja deletar este vídeo?')) return;
    setDeletingVideoId(video.id);
    try {
      if (video.storage_path) {
        await supabase.storage.from('training-videos').remove([video.storage_path]);
      }
      const { error: dbError } = await supabase.from('videos').delete().eq('id', video.id);
      
      if (dbError) throw dbError;

      setVideos(prev => prev.filter(v => v.id !== video.id));
      toast({ title: 'Sucesso', description: 'Vídeo deletado com sucesso!' });

    } catch (error) {
      console.error('❌ Erro inesperado ao deletar vídeo:', error);
      toast({ title: 'Erro', description: 'Erro inesperado ao deletar vídeo.', variant: 'destructive' });
    } finally {
      setDeletingVideoId(null);
    }
  };

  if (isLoading) {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando treinamentos...</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  if (error) {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
          <div className="text-center py-6 lg:py-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 lg:h-10 lg:w-10 text-red-500" />
            </div>
            <p className="text-red-500 text-sm lg:text-base mb-2">Erro ao carregar treinamentos.</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  return (
    <ERALayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        
        {/* MODAL DE CRIAÇÃO DE CURSO */}
        {showCreateCourseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-era-black flex items-center gap-2">
                <Shield className="h-5 w-5 text-era-green" />
                Criar Novo Curso
              </h2>

              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso</label>
              <Input
                placeholder="Ex: Treinamento de Vendas"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="mb-3"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <Input
                placeholder="Ex: PABX, Comercial..."
                value={newCourseCategory}
                onChange={(e) => setNewCourseCategory(e.target.value)}
                className="mb-3"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <Input
                placeholder="Breve descrição"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                className="mb-4"
              />

              {/* 🔒 SELETOR DE VISIBILIDADE */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Quem pode acessar?
                </label>
                <div className="space-y-2">
                    {['admin', 'comercial', 'cliente'].map(role => (
                        <div key={role} onClick={() => toggleVisibility(role)} className="flex items-center gap-3 p-2 rounded hover:bg-blue-100/50 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${newCourseVisibility.includes(role) ? 'bg-era-green border-era-green text-white' : 'border-gray-400 bg-white'}`}>
                                {newCourseVisibility.includes(role) && <CheckSquare className="h-3 w-3" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                        </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateCourseModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCourse} className="bg-era-green text-era-black hover:bg-era-green/90">
                  Criar Curso
                </Button>
              </div>
            </div>
          </div>
        )}

        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <VideoUpload 
              onClose={() => setShowUpload(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {/* Hero Section */}
        <div className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md" style={{background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)"}}>
          <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                    <BlurText 
                      text="Plataforma de Ensino" 
                      className="text-xs lg:text-sm font-medium text-white/90 m-0 p-0"
                      delay={20}
                      animateBy="words"
                      direction="top"
                    />
                  </div>
                  <div className="mb-2 lg:mb-3">
                    <BlurText 
                      text="Treinamentos" 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white m-0 p-0"
                      delay={50}
                      animateBy="letters"
                      direction="top"
                    />
                  </div>
                  <div className="mb-3 lg:mb-4 max-w-2xl">
                    <BlurText 
                      text="Explore nossos cursos de PABX e Omnichannel com conteúdo exclusivo e atualizado"
                      className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 m-0 p-0"
                      delay={30}
                      animateBy="words"
                      direction="top"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <BlurText 
                        text={`${filteredCourses.length} cursos disponíveis`}
                        className="text-white m-0 p-0"
                        delay={20}
                        animateBy="words"
                      />
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <BlurText 
                        text="100+ alunos"
                        className="text-white m-0 p-0"
                        delay={20}
                        animateBy="words"
                      />
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowUpload(true)}
                      className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Settings className="h-4 w-4" />
                      Novo Treinamento
                    </Button>
                    <Button 
                      onClick={() => navigate('/admin/gerenciar-ordem-videos')}
                      variant="outline"
                      className="border-era-green text-era-black hover:bg-era-green hover:text-white font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <ListOrdered className="h-4 w-4" />
                      Gerenciar Ordem
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="w-full lg:w-auto bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg lg:rounded-xl p-1 shadow-lg">
                <TabsTrigger 
                  value="courses" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-era-black data-[state=active]:via-era-gray-medium data-[state=active]:to-era-green data-[state=active]:text-white rounded-md lg:rounded-lg transition-all duration-300 text-sm lg:text-base"
                >
                  <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Cursos Disponíveis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4 lg:space-y-6 mt-4 lg:mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
                        <Input
                          placeholder="Pesquisar cursos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 lg:pl-12 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48 lg:w-56 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300">
                          <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-400" />
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {isAdmin && (
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                    <CardHeader className="text-white rounded-xl" style={{background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-3 text-white font-bold text-xl">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center gap-3">
                              <span>Vídeos Importados</span>
                              <Badge className="bg-era-green text-white font-bold px-3 py-1 rounded-full text-sm">
                                {videos.length}
                              </Badge>
                            </span>
                          </CardTitle>
                          <CardDescription className="text-white/100 mt-2 font-medium">
                            Gerencie os vídeos de treinamento da plataforma
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {showVideoModal && selectedVideo && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full relative">
                            <button className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-700" onClick={handleCloseVideoModal}>&times;</button>
                            <h2 className="text-xl font-semibold mb-4">{selectedVideo.titulo}</h2>
                            <video
                              id={`video-player-${selectedVideo.id}`}
                              src={selectedVideo.url_video}
                              controls
                              className="w-full rounded-lg shadow-lg"
                            />
                          </div>
                        </div>
                      )}
                      {loadingVideos ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                      ) : videos.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">Nenhum vídeo importado ainda.</p>
                          <p className="text-gray-400 text-sm mt-2">Comece importando seu primeiro vídeo de treinamento</p>
                        </div>
                      ) : (
                        <div className="overflow-y-auto max-h-[300px] flex flex-col gap-3">
                          {videos.map((video) => (
                            <div key={video.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-200/50 gap-4 hover:shadow-md transition-all duration-300">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 truncate">{video.titulo}</h5>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>{video.duracao} min</span>
                                  <span>•</span>
                                  <span>{new Date(video.data_criacao).toLocaleDateString('pt-BR')}</span>
                                  {video.cursos && (
                                    <>
                                      <span>•</span>
                                      <span className="text-era-black font-medium">{video.cursos.nome}</span>
                                    </>
                                  )}
                                </div>
                                {video.descricao && (
                                  <p className="text-xs text-gray-500 truncate mt-1">{video.descricao}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewVideo(video)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg"
                                  title="Visualizar"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteVideo(video)}
                                    disabled={deletingVideoId === video.id}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Excluir vídeo"
                                  >
                                    {deletingVideoId === video.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                                    ) : (
                                      <Trash className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-6 flex justify-end">
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          Vídeos Importados: {videos.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base mb-2">
                      {courses.length === 0 
                        ? 'Nenhum curso disponível no momento.' 
                        : 'Nenhum curso encontrado com os filtros aplicados.'}
                    </p>
                    <p className="text-gray-400 text-sm">Tente ajustar os filtros de pesquisa</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* EXIBIÇÃO: CARD INDIVIDUAL (QUANDO CATEGORIA SELECIONADA OU BUSCA) */}
                    {selectedCategory !== 'all' ? (
                       filteredCourses.map((course) => (
                        <div key={course.id} className="relative group h-full">
                             <CourseCard
                                key={course.id}
                                course={course as unknown as Course}
                                onStartCourse={handleStartCourse}
                             />
                             {/* 🗑️ BOTÃO DELETAR CURSO NO CARD (ADMIN ONLY) */}
                             {isAdmin && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCourse(course.id, course.nome);
                                    }}
                                    className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    title="Deletar Curso"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>
                             )}
                        </div>
                       ))
                    ) : (
                        // EXIBIÇÃO: AGRUPADA POR CATEGORIA (PADRÃO)
                        getCoursesByCategory().map((categoryGroup) => (
                          <Card key={categoryGroup.categoria} className="hover:shadow-xl transition-all duration-300 h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="text-white rounded-xl" style={{background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)"}}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base lg:text-lg font-bold text-white mb-2 truncate">
                                    {categoryGroup.categoria}
                                  </CardTitle>
                                  <div className="flex flex-wrap items-center gap-1 mb-2">
                                    <Badge className="text-xs bg-white/20 text-white border-white/30">{categoryGroup.cursos.length} curso(s)</Badge>
                                  </div>
                                </div>
                                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-4">
                              <div className="bg-era-gray-light p-2 lg:p-3 rounded-lg">
                                <div className="text-xs lg:text-sm font-medium text-era-black mb-2">Cursos disponíveis:</div>
                                <div className="space-y-1 lg:space-y-2">
                                  {categoryGroup.cursos.slice(0, 3).map((course) => (
                                    <div key={course.id} className="flex items-center justify-between text-xs lg:text-sm group/item">
                                      <span className="text-era-gray-medium truncate flex-1 mr-2">{course.nome}</span>
                                      
                                      <div className="flex items-center gap-1">
                                          <Badge className="text-xs flex-shrink-0 bg-era-green text-black" variant="outline">
                                            {getVisualProp(course, 'level', 'Iniciante')}
                                          </Badge>
                                          {/* 🗑️ BOTÃO DELETAR NA LISTA PEQUENA */}
                                          {isAdmin && (
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteCourse(course.id, course.nome);
                                                  }}
                                                  className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                  title="Excluir curso"
                                              >
                                                  <Trash className="h-3 w-3" />
                                              </button>
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                  {categoryGroup.cursos.length > 3 && (
                                    <div className="text-xs text-era-gray-medium text-center pt-1">
                                      +{categoryGroup.cursos.length - 3} mais cursos
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleViewCategoryCourses(categoryGroup)} className="w-full text-xs lg:text-sm bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Ver Cursos
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                    )}

                    {/* Card Criar Novo Curso (ADMIN) */}
                    {isAdmin && selectedCategory === 'all' && (
                      <Card className="hover:shadow-xl transition-all duration-300 border-2 border-dashed border-era-green bg-era-gray-light h-full min-h-[300px]">
                        <CardContent className="p-6 lg:p-8 text-center h-full flex flex-col justify-center">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-era-green/20 rounded-full flex items-center justify-center mb-3 lg:mb-4 mx-auto">
                            <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-era-green" />
                          </div>
                          <h3 className="text-sm lg:text-lg font-bold text-era-black mb-2">Adicionar Novo Curso</h3>
                          <Button onClick={() => setShowCreateCourseModal(true)} className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white text-xs lg:text-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Criar Curso
                          </Button>
                          <p className="text-xs text-era-gray-medium mt-2">Disponível para administradores</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* ESTATÍSTICAS FINAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center mx-auto mb-4"><BookOpen className="h-6 w-6 text-white"/></div>
                  <div className="text-3xl font-bold mb-2">{courses.length}</div>
                  <p className="text-white/90">Cursos Disponíveis</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center mx-auto mb-4"><TrendingUp className="h-6 w-6 text-white"/></div>
                  <div className="text-3xl font-bold mb-2">{categories.length}</div>
                  <p className="text-white/90">Categorias</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center mx-auto mb-4"><Clock className="h-6 w-6 text-white"/></div>
                  <div className="text-3xl font-bold mb-2">{isAdmin ? videos.length : '50+'}</div>
                  <p className="text-white/90">{isAdmin ? 'Vídeos Importados' : 'Horas de Conteúdo'}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Treinamentos;