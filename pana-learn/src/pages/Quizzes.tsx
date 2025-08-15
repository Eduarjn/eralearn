import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ERALayout } from '@/components/ERALayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Edit,
  Eye, 
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  HelpCircle,
  Users,
  Target,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  explicacao?: string;
  ordem: number;
}

interface Quiz {
  id: string;
  categoria: string;
  titulo: string;
  descricao?: string;
  nota_minima: number;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
  // Dados relacionados
  total_perguntas: number;
  total_tentativas: number;
  media_nota: number;
  total_aprovados: number;
}

interface QuizStats {
  total: number;
  ativos: number;
  inativos: number;
  total_perguntas: number;
  media_nota_geral: number;
  total_tentativas: number;
}

const Quizzes: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
    total_perguntas: 0,
    media_nota_geral: 0,
    total_tentativas: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');

  // Modal states
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('🔍 useEffect loadQuizzes - userProfile:', userProfile);
    if (userProfile) {
      loadQuizzes();
    } else {
      console.log('⚠️ userProfile ainda não carregado, aguardando...');
    }
  }, [userProfile]);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchTerm, statusFilter, categoriaFilter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carregamento de quizzes...');
      console.log('👤 userProfile completo:', userProfile);
      console.log('👤 userProfile?.tipo_usuario:', userProfile?.tipo_usuario);
      console.log('👤 userProfile?.id:', userProfile?.id);

      // Verificar se é admin
      const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';
      console.log('👤 Tipo de usuário:', userProfile?.tipo_usuario, 'É admin:', isAdmin);

      let quizzesData;
      let quizzesError;

      if (isAdmin) {
        // Para administradores: buscar TODOS os quizzes
        console.log('🔍 Buscando TODOS os quizzes (admin)...');
        
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            quiz_perguntas(count),
            progresso_quiz(count)
          `)
          .order('data_criacao', { ascending: false });

        quizzesData = data;
        quizzesError = error;
      } else {
        // Para clientes: buscar apenas os 5 cursos específicos
        console.log('🔍 Buscando quizzes dos cursos específicos (cliente)...');
        
        const cursosPermitidos = [
          'Fundamentos CALLCENTER',
          'Fundamentos de PABX', 
          'Omnichannel para Empresas',
          'Configurações Avançadas OMNI',
          'Configurações Avançadas PABX'
        ];

        console.log('📋 Cursos permitidos:', cursosPermitidos);

        // Buscar IDs dos cursos permitidos
        const { data: cursosPermitidosData, error: cursosError } = await supabase
          .from('cursos')
          .select('id, nome, categoria')
          .in('nome', cursosPermitidos);

        if (cursosError) {
          console.error('❌ Erro ao buscar cursos:', cursosError);
          throw cursosError;
        }

        console.log('✅ Cursos encontrados:', cursosPermitidosData);

        const cursoIds = cursosPermitidosData?.map(curso => curso.id) || [];
        console.log('🆔 IDs dos cursos:', cursoIds);

        if (cursoIds.length === 0) {
          console.warn('⚠️ Nenhum curso encontrado!');
          setQuizzes([]);
          calculateStats([], []);
          return;
        }

        // Buscar quizzes apenas dos cursos permitidos
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            quiz_perguntas(count),
            progresso_quiz(count)
          `)
          .in('curso_id', cursoIds)
          .order('data_criacao', { ascending: false });

        quizzesData = data;
        quizzesError = error;
      }

      if (quizzesError) {
        console.error('❌ Erro ao buscar quizzes:', quizzesError);
        throw quizzesError;
      }

      console.log('✅ Quizzes encontrados:', quizzesData);

      // Buscar estatísticas detalhadas
      const quizIds = quizzesData?.map(quiz => quiz.id) || [];
      let progressData = [];
      
      if (quizIds.length > 0) {
        const { data: progress, error: progressError } = await supabase
          .from('progresso_quiz')
          .select('nota, aprovado')
          .in('quiz_id', quizIds);

        if (progressError) {
          console.error('❌ Erro ao carregar progresso:', progressError);
        } else {
          progressData = progress || [];
          console.log('✅ Progresso carregado:', progressData);
        }
      }

      // Calcular estatísticas por quiz
      const quizzesWithStats = (quizzesData || []).map(quiz => {
        const quizProgress = progressData?.filter(p => p.nota !== null) || [];
        const mediaNota = quizProgress.length > 0 
          ? quizProgress.reduce((sum, p) => sum + p.nota, 0) / quizProgress.length 
          : 0;
        const totalAprovados = quizProgress.filter(p => p.aprovado).length;

        const { categoria: _, ...quizWithoutCategoria } = quiz;
        return {
          ...quizWithoutCategoria,
          categoria: 'Curso ID: ' + quiz.curso_id, // Temporário - será substituído
          total_perguntas: quiz.quiz_perguntas?.[0]?.count || 0,
          total_tentativas: quiz.progresso_quiz?.[0]?.count || 0,
          media_nota: Math.round(mediaNota * 100) / 100,
          total_aprovados: totalAprovados
        };
      });

      console.log('📊 Quizzes com estatísticas:', quizzesWithStats);
      setQuizzes(quizzesWithStats);
      calculateStats(quizzesWithStats, progressData);
    } catch (error) {
      console.error('❌ Erro ao carregar quizzes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os quizzes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quizzesData: Quiz[], progressData: { nota: number; aprovado: boolean }[]) => {
    const total = quizzesData.length;
    const ativos = quizzesData.filter(q => q.ativo).length;
    const inativos = total - ativos;
    const total_perguntas = quizzesData.reduce((sum, q) => sum + q.total_perguntas, 0);
    const total_tentativas = quizzesData.reduce((sum, q) => sum + q.total_tentativas, 0);
    
    const media_nota_geral = progressData.length > 0 
      ? Math.round((progressData.reduce((sum, p) => sum + p.nota, 0) / progressData.length) * 100) / 100
      : 0;

    setStats({
      total,
      ativos,
      inativos,
      total_perguntas,
      media_nota_geral,
      total_tentativas
    });
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(quiz => 
        statusFilter === 'ativo' ? quiz.ativo : !quiz.ativo
      );
    }

    // Filtro por categoria
    if (categoriaFilter !== 'todos') {
      filtered = filtered.filter(quiz => quiz.categoria === categoriaFilter);
    }

    setFilteredQuizzes(filtered);
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };



  const handleViewQuestions = async (quiz: Quiz) => {
    try {
      setSelectedQuiz(quiz);
      setShowQuestionsModal(true);
      setIsEditing(false);
      setEditingQuestion(null);

      // Carregar perguntas do quiz
      const { data: questionsData, error } = await supabase
        .from('quiz_perguntas')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('ordem');

      if (error) {
        throw error;
      }

      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas.",
        variant: "destructive"
      });
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion({ ...question });
    setIsEditing(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !selectedQuiz) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('quiz_perguntas')
        .update({
          pergunta: editingQuestion.pergunta,
          opcoes: editingQuestion.opcoes,
          resposta_correta: editingQuestion.resposta_correta,
          explicacao: editingQuestion.explicacao,
          ordem: editingQuestion.ordem
        })
        .eq('id', editingQuestion.id);

      if (error) {
        throw error;
      }

      // Atualizar lista de perguntas
      setQuestions(prev => 
        prev.map(q => q.id === editingQuestion.id ? editingQuestion : q)
      );

      toast({
        title: "Sucesso",
        description: "Pergunta atualizada com sucesso!",
        variant: "default"
      });

      setEditingQuestion(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a pergunta.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = (questionIndex: number) => {
    if (!editingQuestion) return;

    const newOptions = [...editingQuestion.opcoes, ''];
    setEditingQuestion({
      ...editingQuestion,
      opcoes: newOptions
    });
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!editingQuestion) return;

    const newOptions = [...editingQuestion.opcoes];
    newOptions[optionIndex] = value;
    setEditingQuestion({
      ...editingQuestion,
      opcoes: newOptions
    });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    if (!editingQuestion || editingQuestion.opcoes.length <= 2) return;

    const newOptions = editingQuestion.opcoes.filter((_, index) => index !== optionIndex);
    const newRespostaCorreta = editingQuestion.resposta_correta >= optionIndex 
      ? Math.max(0, editingQuestion.resposta_correta - 1)
      : editingQuestion.resposta_correta;

    setEditingQuestion({
      ...editingQuestion,
      opcoes: newOptions,
      resposta_correta: newRespostaCorreta
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(quizzes.map(q => q.categoria))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <ERALayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        {/* Hero Section com gradiente */}
        <div className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md" style={{background: 'linear-gradient(90deg, #000000 0%, #4A4A4A 40%, #34C759 100%)'}}>
          <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                    <span className="text-xs lg:text-sm font-medium text-white/90">Plataforma de Ensino</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 text-white">
                    Quizzes
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 max-w-2xl">
                    Visualize e gerencie todos os quizzes de conclusão de cursos
                  </p>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Avaliações interativas</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Certificação automática</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Progresso dos alunos</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

            {/* Stats Cards - Simplificados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/90">Total de Quizzes</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/90">Quizzes Ativos</p>
                      <p className="text-2xl font-bold text-white">{stats.ativos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <HelpCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/90">Total Perguntas</p>
                      <p className="text-2xl font-bold text-white">{stats.total_perguntas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/90">Média Geral</p>
                      <p className="text-2xl font-bold text-white">{stats.media_nota_geral}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters - Simplificados */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                <CardTitle className="flex items-center gap-3 text-white font-bold text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Filter className="h-6 w-6 text-white" />
                  </div>
                  <span>Buscar Quizzes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por título ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                    <SelectTrigger className="w-full md:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Categorias</SelectItem>
                      {getUniqueCategories().map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum quiz encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'todos' || categoriaFilter !== 'todos'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Ainda não há quizzes configurados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base lg:text-lg font-bold text-white mb-2 truncate">
                        {quiz.titulo}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        <Badge className="text-xs bg-white/20 text-white border-white/30">
                          {quiz.categoria}
                        </Badge>
                        {getStatusBadge(quiz.ativo)}
                      </div>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <HelpCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                      <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Perguntas:</span>
                      <span className="ml-1">{quiz.total_perguntas}</span>
                    </div>

                    <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Média:</span>
                      <span className="ml-1">{quiz.media_nota}%</span>
                    </div>

                    <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Criado:</span>
                      <span className="ml-1">{formatDate(quiz.data_criacao)}</span>
                    </div>
                  </div>

                  {quiz.descricao && (
                    <div className="bg-era-gray-light p-2 lg:p-3 rounded-lg">
                      <div className="text-xs lg:text-sm font-medium text-era-black mb-1">Descrição:</div>
                      <p className="text-xs lg:text-sm text-era-gray-medium line-clamp-2">{quiz.descricao}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewQuestions(quiz)}
                      className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                      Ver Perguntas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Card para Adicionar Novo Quiz */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-dashed border-era-green bg-era-gray-light">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-era-green/20 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                    <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-era-green" />
                  </div>
                  <h3 className="text-sm lg:text-lg font-bold text-era-black mb-2">
                    Adicionar Novo Quiz
                  </h3>
                  <p className="text-xs lg:text-sm text-era-gray-medium mb-3 lg:mb-4">
                    Crie um novo quiz para um curso
                  </p>
                  <Button 
                    onClick={() => setShowNewQuizModal(true)}
                    className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-4 lg:px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                    Novo Quiz
                  </Button>
                  <p className="text-xs text-era-gray-medium mt-2">
                    Disponível quando novos cursos forem adicionados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Perguntas */}
        <Dialog open={showQuestionsModal} onOpenChange={setShowQuestionsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-era-black">
                  <div className="p-2 bg-era-green/20 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-era-green" />
                  </div>
                  <span>Perguntas do Quiz: {selectedQuiz?.titulo}</span>
                </DialogTitle>
                <Button
                  onClick={() => setShowQuestionsModal(false)}
                  className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-era-gray-medium mx-auto mb-4" />
                  <p className="text-era-gray-medium">Nenhuma pergunta configurada para este quiz.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="text-sm bg-white/20 text-white border-white/30">
                            {index + 1}
                          </Badge>
                          <h3 className="text-lg font-bold text-white">
                            {isEditing && editingQuestion?.id === question.id 
                              ? 'Editando Pergunta' 
                              : question.pergunta
                            }
                          </h3>
                        </div>
                        {!isEditing && (
                          <Button
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {isEditing && editingQuestion?.id === question.id ? (
                        // Modo de edição
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Pergunta
                            </label>
                            <Textarea
                              value={editingQuestion.pergunta}
                              onChange={(e) => setEditingQuestion({
                                ...editingQuestion,
                                pergunta: e.target.value
                              })}
                              placeholder="Digite a pergunta..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Opções
                            </label>
                            <div className="space-y-2">
                              {editingQuestion.opcoes.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => handleUpdateOption(index, optionIndex, e.target.value)}
                                    placeholder={`Opção ${optionIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <input
                                    type="radio"
                                    name={`resposta_${question.id}`}
                                    checked={editingQuestion.resposta_correta === optionIndex}
                                    onChange={() => setEditingQuestion({
                                      ...editingQuestion,
                                      resposta_correta: optionIndex
                                    })}
                                    className="ml-2"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveOption(index, optionIndex)}
                                    disabled={editingQuestion.opcoes.length <= 2}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddOption(index)}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar Opção
                              </Button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Explicação (opcional)
                            </label>
                            <Textarea
                              value={editingQuestion.explicacao || ''}
                              onChange={(e) => setEditingQuestion({
                                ...editingQuestion,
                                explicacao: e.target.value
                              })}
                              placeholder="Explicação da resposta correta..."
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={handleSaveQuestion}
                              disabled={saving}
                              className="flex-1"
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Salvar
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingQuestion(null);
                                setIsEditing(false);
                              }}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {question.opcoes.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  optionIndex === question.resposta_correta
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span className="text-sm">{option}</span>
                                  {optionIndex === question.resposta_correta && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {question.explicacao && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Explicação:</strong> {question.explicacao}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Botão Voltar no final */}
            <div className="flex justify-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowQuestionsModal(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Quizzes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Quizzes; 