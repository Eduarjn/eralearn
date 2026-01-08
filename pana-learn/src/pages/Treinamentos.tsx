import { BlurText } from '@/ui/BlurText';
import { ERALayout } from '@/components/ERALayout';
import { CourseCard } from '@/components/CourseCard';
import  VideoUpload  from '@/components/VideoUpload';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { useCourses } from '@/hooks/useCourses';
import type { Course } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Video, Eye, Download, Youtube, Trash, BookOpen, Clock, Users, TrendingUp, Star, Award, Zap, ArrowLeft, Settings, ListOrdered } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
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
  cursos: Array<{
    id: string;
    nome: string;
    descricao?: string;
    categoria: string;
    status: string;
    imagem_url?: string | null;
    categorias?: { nome: string; cor: string };
    categoria_id?: string;
    ordem?: number;
  }>;
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
    console.log('👤 Usuário:', userProfile?.email, 'Tipo:', userProfile?.tipo_usuario);
    
    try {
      // Primeiro, carregar vídeos sem joins
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (videosError) {
        console.error('❌ Erro ao carregar vídeos:', videosError);
        throw videosError;
      }

      console.log('✅ Vídeos carregados:', videosData?.length || 0);
      console.log('📋 Dados dos vídeos:', videosData);

      // Se há vídeos, carregar dados dos cursos
      if (videosData && videosData.length > 0) {
        const cursoIds = [...new Set(videosData.map(v => v.curso_id).filter(Boolean))];
        
        if (cursoIds.length > 0) {
          const { data: cursosData, error: cursosError } = await supabase
            .from('cursos')
            .select('id, nome, categoria')
            .in('id', cursoIds);

          if (cursosError) {
            console.error('❌ Erro ao carregar cursos:', cursosError);
          } else {
            console.log('✅ Cursos carregados:', cursosData);
            
            // Combinar dados
            const videosWithCursos = videosData.map(video => {
              const curso = cursosData?.find(c => c.id === video.curso_id);
              return {
                ...video,
                cursos: curso || null
              };
            });
            
            setVideos(videosWithCursos);
            console.log('Vídeos com cursos:', videosWithCursos);
            return;
          }
        }
      }
      
      setVideos(videosData || []);
      console.log('Vídeos recebidos do Supabase:', videosData);
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar vídeos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Dados mock dos cinco cursos principais com cores vibrantes
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
      nome: 'Discador', // IMPORTANTE: Tem que ser idêntico ao nome no Banco de Dados
      descricao: 'Treinamento completo sobre o uso e configuração do Discador',
      categoria: 'CALLCENTER',
      status: 'ativo',
      imagem_url: null,
      categorias: { nome: 'CALLCENTER', cor: '#6366F1' },
      gradient: 'from-indigo-500 to-purple-600',
      icon: '📞', // Sugestão: mudei o ícone para telefone (opcional)
      duration: '6 horas',
      modules: '8 módulos',
      level: 'Avançado'
    },
  ];

  // IDs ou nomes dos cinco cursos principais
  const cursosPrincipaisNomes = cursosPrincipaisMock.map(c => c.nome);

  // Buscar cursos do banco que são principais
  const cursosPrincipaisBanco = courses.filter(course => cursosPrincipaisNomes.includes(course.nome));

  // Gerar lista final: usar curso real se existir, senão mock TESTE EDUAR 
  const filteredCourses = cursosPrincipaisNomes.map(nome => {
    const real = courses.find(c => c.nome === nome);
    if (real) return real;

    // Adiciona id mock para o CourseCard saber que é mock
    const mock = cursosPrincipaisMock.find(m => m.nome === nome);
    // Garante que o objeto mock existe antes de usar
    if (!mock) return { id: 'erro', nome: nome, categoria: 'Geral', status: 'inativo' };

    return { ...mock, id: `mock-${mock.nome.replace(/\s+/g, '-').toLowerCase()}` };
  }).filter(course => {
    // --- REGRA DE SEGURANÇA ---
    // Se a categoria for 'Comercial' e o usuário NÃO for admin, esconde o curso
    if (course.categoria === 'Comercial' && !isAdmin) {
      return false;
    }
    // --------------------------

    const matchesSearch = course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || course.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Função utilitária para pegar propriedade visual de mock ou valor padrão
  function getVisualProp(course, prop, fallback) {
    // Se for mock, tem a prop
    if (course.id && course.id.startsWith('mock-')) return course[prop] || fallback;
    // Para cursos reais, retorna fallback
    return fallback;
  }

  // Debug logs para verificar cursos reais vs mockados
  console.log('🔍 Treinamentos - Debug dos cursos:', {
    totalCursosBanco: courses.length,
    cursosPrincipaisBanco: cursosPrincipaisBanco.length,
    cursosPrincipaisNomes: cursosPrincipaisNomes,
    filteredCourses: filteredCourses.map(c => ({
      nome: c.nome,
      id: c.id,
      isMock: c.id.startsWith('mock-')
    }))
  });

  // Obter categorias únicas
  const categories = Array.from(new Set(courses.map(course => course.categoria)));

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
      
      // Calcular horas estimadas baseado no nível
      const level = getVisualProp(course, 'level', 'Iniciante');
      const horas = level === 'Avançado' ? 5 : level === 'Intermediário' ? 3 : 2;
      categoryGroups[course.categoria].totalHoras += horas;

      // Adicionar nível se não existir
      if (!categoryGroups[course.categoria].niveis.includes(level)) {
        categoryGroups[course.categoria].niveis.push(level);
      }

      // Contar cursos ativos
      if (course.status === 'ativo') {
        categoryGroups[course.categoria].cursosAtivos++;
      }
    });

    return Object.values(categoryGroups).sort((a, b) => 
      b.cursos.length - a.cursos.length
    );
  };

  const handleViewCategoryCourses = (categoryGroup: CategoryGroup) => {
    // Filtrar cursos apenas desta categoria
    setSelectedCategory(categoryGroup.categoria);
    setSearchTerm('');
    
    // Removido o scroll automático para deixar a transição mais suave
  };

  const handleStartCourse = (courseId: string) => {
    console.log('🎯 handleStartCourse chamado com courseId:', courseId);
    console.log('🎯 Tipo do courseId:', typeof courseId);
    console.log('🎯 CourseId é string vazia?', courseId === '');
    console.log('🎯 CourseId é undefined?', courseId === undefined);
    console.log('🎯 CourseId é null?', courseId === null);
    
    // Se for um curso mock, não navegar
    if (courseId.startsWith('mock-')) {
      console.log('⚠️ Curso mock detectado, não navegando');
      toast({
        title: "Curso não disponível",
        description: "Este curso ainda não foi configurado no sistema.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o courseId é válido
    if (!courseId || courseId === 'undefined' || courseId === 'null' || courseId === '') {
      console.error('❌ CourseId inválido:', courseId);
      toast({
        title: "Erro",
        description: "ID do curso inválido. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Navegando para curso:', courseId);
    console.log('📍 URL de destino:', `/curso/${courseId}`);
    
    try {
      navigate(`/curso/${courseId}`);
      console.log('✅ Navegação executada com sucesso');
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      toast({
        title: "Erro",
        description: "Erro ao navegar para o curso. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUploadSuccess = () => {
    loadVideos();
    refetch();
  };

  // Função de debug para testar consulta de vídeos
  const testVideoQuery = async () => {
    console.log('🧪 Testando consulta de vídeos...');
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .limit(5);

      console.log('📊 Resultado da consulta:', { data, error });
      
      if (error) {
        toast({
          title: "Erro na consulta",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Consulta bem-sucedida",
          description: `${data?.length || 0} vídeos encontrados`,
        });
      }
    } catch (err) {
      console.error('❌ Erro no teste:', err);
      toast({
        title: "Erro no teste",
        description: "Erro inesperado ao testar consulta",
        variant: "destructive"
      });
    }
  };

  // Função para inserir vídeos de teste
  const insertTestVideos = async () => {
    console.log('🎬 Inserindo vídeos de teste...');
    try {
      // Primeiro, verificar se há cursos disponíveis
      const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .limit(1);

      if (cursosError || !cursos || cursos.length === 0) {
        toast({
          title: "Erro",
          description: "Primeiro insira os cursos usando o botão 'Inserir Cursos'",
          variant: "destructive"
        });
        return;
      }

      const cursoId = cursos[0].id;
      const categoria = cursos[0].categoria;

      // Inserir vídeos de teste
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .insert([
          {
            titulo: 'Introdução ao PABX - Parte 1',
            descricao: 'Vídeo introdutório sobre sistemas PABX',
            duracao: 15,
            url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            categoria: categoria,
            curso_id: cursoId
          },
          {
            titulo: 'Configuração Básica de PABX',
            descricao: 'Como configurar um PABX básico',
            duracao: 25,
            url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            categoria: categoria,
            curso_id: cursoId
          },
          {
            titulo: 'Troubleshooting PABX',
            descricao: 'Como resolver problemas comuns em PABX',
            duracao: 20,
            url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            categoria: categoria,
            curso_id: cursoId
          }
        ])
        .select();

      if (videosError) {
        console.error('❌ Erro ao inserir vídeos:', videosError);
        throw videosError;
      }

      console.log('✅ Vídeos de teste inseridos:', videos);
      toast({
        title: "Sucesso!",
        description: `${videos?.length || 0} vídeos de teste inseridos`,
      });

      // Recarregar vídeos
      loadVideos();
    } catch (err) {
      console.error('❌ Erro ao inserir vídeos de teste:', err);
      toast({
        title: "Erro",
        description: "Erro ao inserir vídeos de teste",
        variant: "destructive"
      });
    }
  };

  // Função para inserir cursos no banco
  // Função para mover "Configurações Avançadas OMNI" para categoria OMNICHANNEL
  const moveOmniAdvancedToOmnichannel = async () => {
    console.log('🔧 Movendo "Configurações Avançadas OMNI" para categoria OMNICHANNEL...');
    try {
      // Buscar todos os cursos
      const { data: allCourses, error: coursesError } = await supabase
        .from('cursos')
        .select('*');

      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return;
      }

      console.log('📝 Cursos encontrados:', allCourses?.map(c => ({
        id: c.id,
        nome: c.nome,
        categoria: c.categoria
      })));

      // Encontrar o curso "Configurações Avançadas OMNI"
      const omniAdvancedCourse = allCourses?.find(c => 
        c.nome.toLowerCase().includes('configurações avançadas omni')
      );

      if (omniAdvancedCourse) {
        console.log('📝 Curso encontrado:', omniAdvancedCourse);

        // Atualizar a categoria para OMNICHANNEL
        const { error: updateError } = await supabase
          .from('cursos')
          .update({ categoria: 'OMNICHANNEL' })
          .eq('id', omniAdvancedCourse.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar curso:', updateError);
          throw updateError;
        }

        console.log('✅ Curso movido para categoria OMNICHANNEL');
        toast({
          title: "Sucesso!",
          description: "Configurações Avançadas OMNI movida para categoria OMNICHANNEL!",
        });
      } else {
        console.log('⚠️ Curso "Configurações Avançadas OMNI" não encontrado');
        toast({
          title: "Info",
          description: "Curso não encontrado. Verifique se o nome está correto.",
        });
      }

      // Recarregar dados
      refetch();
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao mover curso:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover curso para categoria OMNICHANNEL.",
        variant: "destructive"
      });
    }
  };

  // Função para corrigir especificamente duplicações de OMNICHANNEL
  const fixOmnichannelDuplicates = async () => {
    console.log('🔧 Corrigindo duplicações de OMNICHANNEL...');
    try {
      // Buscar todos os cursos
      const { data: allCourses, error: coursesError } = await supabase
        .from('cursos')
        .select('*');

      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return;
      }

      console.log('📝 Cursos encontrados:', allCourses?.map(c => ({
        id: c.id,
        nome: c.nome,
        categoria: c.categoria
      })));

      // Identificar cursos que precisam ser corrigidos
      const coursesToUpdate = [];
      const coursesToDelete = [];

      for (const course of allCourses) {
        // Se o curso tem categoria "Omnichannel" (minúsculo), mudar para "OMNICHANNEL"
        if (course.categoria === 'Omnichannel') {
          coursesToUpdate.push({
            id: course.id,
            categoria: 'OMNICHANNEL'
          });
        }
        
        // Se há duplicações de nomes, manter apenas um
        const normalizedName = course.nome.toLowerCase().trim();
        if (normalizedName === 'omnichannel para empresas' || normalizedName === 'configurações avançadas omni') {
          // Verificar se já existe um curso com esse nome na categoria OMNICHANNEL
          const existingCourse = allCourses.find(c => 
            c.categoria === 'OMNICHANNEL' && 
            c.nome.toLowerCase().trim() === normalizedName &&
            c.id !== course.id
          );
          
          if (existingCourse) {
            coursesToDelete.push(course.id);
          }
        }
      }

      console.log('📝 Cursos para atualizar:', coursesToUpdate);
      console.log('📝 Cursos para deletar:', coursesToDelete);

      // Atualizar categorias
      for (const courseUpdate of coursesToUpdate) {
        const { error: updateError } = await supabase
          .from('cursos')
          .update({ categoria: courseUpdate.categoria })
          .eq('id', courseUpdate.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar curso:', updateError);
        }
      }

      // Deletar duplicados
      if (coursesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cursos')
          .delete()
          .in('id', coursesToDelete);

        if (deleteError) {
          console.error('❌ Erro ao deletar duplicados:', deleteError);
        }
      }

      console.log('✅ Duplicações de OMNICHANNEL corrigidas');
      toast({
        title: "Sucesso!",
        description: "Duplicações de OMNICHANNEL corrigidas!",
      });

      // Recarregar dados
      refetch();
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao corrigir duplicações:', error);
      toast({
        title: "Erro",
        description: "Erro ao corrigir duplicações de OMNICHANNEL.",
        variant: "destructive"
      });
    }
  };

  // Função para corrigir categorias e organizar cursos
  const fixCourseCategories = async () => {
    console.log('🔧 Corrigindo categorias dos cursos...');
    try {
      // Primeiro, deletar todos os cursos existentes
      const { error: deleteError } = await supabase
        .from('cursos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

      if (deleteError) {
        console.error('❌ Erro ao deletar cursos:', deleteError);
        throw deleteError;
      }

      console.log('🗑️ Cursos antigos deletados');

      // Inserir categorias corretas (sem duplicações)
      const { data: categorias, error: catError } = await supabase
        .from('categorias')
        .upsert([
          { nome: 'PABX', descricao: 'Treinamentos sobre sistemas PABX', cor: '#3B82F6' },
          { nome: 'CALLCENTER', descricao: 'Treinamentos sobre sistemas de call center', cor: '#6366F1' },
          { nome: 'VoIP', descricao: 'Treinamentos sobre tecnologias VoIP', cor: '#8B5F6' },
          { nome: 'OMNICHANNEL', descricao: 'Treinamentos sobre plataformas Omnichannel', cor: '#10B981' }
        ], { onConflict: 'nome' });

      if (catError) {
        console.error('❌ Erro ao inserir categorias:', catError);
        throw catError;
      }

      // Inserir cursos com categorias corretas (sem duplicações)
      const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .insert([
          {
            nome: 'Fundamentos de PABX',
            categoria: 'PABX',
            descricao: 'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas',
            status: 'ativo',
            ordem: 1
          },
          {
            nome: 'Configurações Avançadas PABX',
            categoria: 'PABX',
            descricao: 'Configurações avançadas para otimização do sistema PABX',
            status: 'ativo',
            ordem: 2
          },
          {
            nome: 'Fundamentos CALLCENTER',
            categoria: 'CALLCENTER',
            descricao: 'Introdução aos sistemas de call center e suas funcionalidades',
            status: 'ativo',
            ordem: 3
          },
          {
            nome: 'OMNICHANNEL para Empresas',
            categoria: 'OMNICHANNEL',
            descricao: 'Implementação de soluções omnichannel em ambientes empresariais',
            status: 'ativo',
            ordem: 4
          },
          {
            nome: 'Configurações Avançadas OMNI',
            categoria: 'OMNICHANNEL',
            descricao: 'Configurações avançadas para sistemas omnichannel',
            status: 'ativo',
            ordem: 5
          },
          {
            nome: 'Configuração VoIP Avançada',
            categoria: 'VoIP',
            descricao: 'Configurações avançadas para sistemas VoIP corporativos',
            status: 'ativo',
            ordem: 6
          }
        ]);

      if (cursosError) {
        console.error('❌ Erro ao inserir cursos:', cursosError);
        throw cursosError;
      }

      console.log('✅ Cursos organizados com sucesso:', cursos);
      toast({
        title: "Sucesso!",
        description: "Cursos organizados corretamente por categoria!",
      });

      // Recarregar dados
      refetch();
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao corrigir categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao corrigir categorias dos cursos.",
        variant: "destructive"
      });
    }
  };

  const insertCoursesToDatabase = async () => {
    console.log('🔧 Inserindo cursos no banco...');
    try {
      // Primeiro inserir categorias
      const { data: categorias, error: catError } = await supabase
        .from('categorias')
        .upsert([
          { nome: 'PABX', descricao: 'Treinamentos sobre sistemas PABX', cor: '#3B82F6' },
          { nome: 'CALLCENTER', descricao: 'Treinamentos sobre sistemas de call center', cor: '#6366F1' },
          { nome: 'VoIP', descricao: 'Treinamentos sobre tecnologias VoIP', cor: '#8B5F6' },
          { nome: 'OMNICHANNEL', descricao: 'Treinamentos sobre plataformas Omnichannel', cor: '#10B981' }
        ], { onConflict: 'nome' });

      if (catError) {
        console.error('❌ Erro ao inserir categorias:', catError);
        throw catError;
      }

      // Agora inserir cursos
      const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .upsert([
          {
            nome: 'Fundamentos de PABX',
            categoria: 'PABX',
            descricao: 'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas',
            status: 'ativo',
            ordem: 1
          },
          {
            nome: 'Fundamentos CALLCENTER',
            categoria: 'CALLCENTER',
            descricao: 'Introdução aos sistemas de call center e suas funcionalidades',
            status: 'ativo',
            ordem: 2
          },
          {
            nome: 'Configurações Avançadas PABX',
            categoria: 'PABX',
            descricao: 'Configurações avançadas para otimização do sistema PABX',
            status: 'ativo',
            ordem: 3
          },
          {
            nome: 'OMNICHANNEL para Empresas',
            categoria: 'OMNICHANNEL',
            descricao: 'Implementação de soluções omnichannel em ambientes empresariais',
            status: 'ativo',
            ordem: 4
          },
          {
            nome: 'Configurações Avançadas OMNI',
            categoria: 'OMNICHANNEL',
            descricao: 'Configurações avançadas para sistemas omnichannel',
            status: 'ativo',
            ordem: 5
          }
        ], { onConflict: 'nome' });

      if (cursosError) {
        console.error('❌ Erro ao inserir cursos:', cursosError);
        throw cursosError;
      }

      console.log('✅ Cursos inseridos com sucesso:', cursos);
      toast({
        title: "Sucesso!",
        description: "Cursos inseridos no banco de dados. Recarregue a página para ver as mudanças.",
      });

      // Recarregar dados
      refetch();
    } catch (error) {
      console.error('❌ Erro ao inserir cursos:', error);
      toast({
        title: "Erro",
        description: "Erro ao inserir cursos no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleViewVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const handleDownloadVideo = (video: Video) => {
    if (video.url_video) {
      const link = document.createElement('a');
      link.href = video.url_video;
      link.download = video.titulo || 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Função para verificar e corrigir vídeos órfãos
  // Função para verificar e corrigir IDs dos cursos
  // Função para verificar vídeos do curso OMNICHANNEL para Empresas
  const checkOmnichannelVideos = async () => {
    console.log('🔧 Verificando vídeos do curso OMNICHANNEL para Empresas...');
    try {
      // Primeiro, buscar TODOS os cursos para ver o que existe
      const { data: allCourses, error: allCoursesError } = await supabase
        .from('cursos')
        .select('id, nome, categoria, status');

      if (allCoursesError) {
        console.error('❌ Erro ao buscar todos os cursos:', allCoursesError);
        return;
      }

      console.log('📋 Todos os cursos encontrados:', allCourses?.map(c => ({
        id: c.id,
        nome: c.nome,
        categoria: c.categoria,
        status: c.status
      })));

      // Buscar curso OMNICHANNEL para Empresas com diferentes variações
      const omnichannelVariations = [
        'OMNICHANNEL para Empresas',
        'Omnichannel para Empresas',
        'omnichannel para empresas',
        'OMNICHANNEL PARA EMPRESAS'
      ];

      let omnichannelCourse = null;
      let foundVariation = null;

      for (const variation of omnichannelVariations) {
        const course = allCourses?.find(c => 
          c.nome.toLowerCase() === variation.toLowerCase()
        );
        if (course) {
          omnichannelCourse = course;
          foundVariation = variation;
          break;
        }
      }

      if (!omnichannelCourse) {
        console.error('❌ Curso OMNICHANNEL para Empresas não encontrado em nenhuma variação');
        console.log('🔍 Tentando buscar por categoria OMNICHANNEL...');
        
        // Buscar por categoria OMNICHANNEL
        const omnichannelCourses = allCourses?.filter(c => 
          c.categoria.toLowerCase().includes('omnichannel')
        ) || [];

        console.log('📋 Cursos da categoria OMNICHANNEL:', omnichannelCourses);

        if (omnichannelCourses.length > 0) {
          omnichannelCourse = omnichannelCourses[0]; // Usar o primeiro curso OMNICHANNEL
          foundVariation = omnichannelCourse.nome;
          console.log('✅ Usando primeiro curso OMNICHANNEL encontrado:', omnichannelCourse);
        }
      } else {
        console.log('✅ Curso encontrado com variação:', foundVariation);
        console.log('✅ Curso encontrado:', omnichannelCourse);
      }

      if (!omnichannelCourse) {
        console.error('❌ Nenhum curso OMNICHANNEL encontrado');
        toast({
          title: "Erro",
          description: "Nenhum curso OMNICHANNEL encontrado no banco de dados.",
          variant: "destructive"
        });
        return;
      }

      // Buscar vídeos associados a este curso
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('curso_id', omnichannelCourse.id);

      if (videosError) {
        console.error('❌ Erro ao buscar vídeos:', videosError);
        toast({
          title: "Erro",
          description: "Erro ao buscar vídeos do curso.",
          variant: "destructive"
        });
        return;
      }

      console.log('📋 Vídeos encontrados para OMNICHANNEL:', videos?.length || 0);
      videos?.forEach(video => {
        console.log(`📋 Vídeo: "${video.titulo}" - ID: ${video.id} - URL: ${video.url_video}`);
      });

      if (!videos || videos.length === 0) {
        console.log('⚠️ Nenhum vídeo encontrado para o curso');
        toast({
          title: "Aviso",
          description: `Nenhum vídeo encontrado para o curso ${omnichannelCourse.nome}.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${videos.length} vídeo(s) encontrado(s) para o curso ${omnichannelCourse.nome}.`,
        });
      }

    } catch (error) {
      console.error('❌ Erro ao verificar vídeos do OMNICHANNEL:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar vídeos do curso.",
        variant: "destructive"
      });
    }
  };

  // Função para recriar o curso OMNICHANNEL para Empresas
  // Função para testar importação de vídeos para OMNICHANNEL
  // Função para verificar vídeos específicos do curso OMNICHANNEL
  const checkOmnichannelVideosInDatabase = async () => {
    console.log('🔍 Verificando vídeos do curso OMNICHANNEL no banco...');
    try {
      // Primeiro, buscar o curso OMNICHANNEL para Empresas
      const { data: omnichannelCourse, error: courseError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .eq('nome', 'OMNICHANNEL para Empresas')
        .single();

      if (courseError || !omnichannelCourse) {
        console.error('❌ Curso OMNICHANNEL para Empresas não encontrado:', courseError);
        toast({
          title: "Erro",
          description: "Curso OMNICHANNEL para Empresas não encontrado.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Curso OMNICHANNEL encontrado:', omnichannelCourse);

      // Buscar TODOS os vídeos no banco
      const { data: allVideos, error: allVideosError } = await supabase
        .from('videos')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (allVideosError) {
        console.error('❌ Erro ao buscar todos os vídeos:', allVideosError);
        return;
      }

      console.log('📋 Todos os vídeos no banco:', allVideos?.map(v => ({
        id: v.id,
        titulo: v.titulo,
        curso_id: v.curso_id,
        categoria: v.categoria,
        modulo_id: v.modulo_id
      })));

      // Filtrar vídeos do curso OMNICHANNEL
      const omnichannelVideos = allVideos?.filter(v => v.curso_id === omnichannelCourse.id) || [];

      console.log('🔍 Vídeos do curso OMNICHANNEL:', {
        cursoId: omnichannelCourse.id,
        cursoNome: omnichannelCourse.nome,
        totalVideos: allVideos?.length || 0,
        omnichannelVideosCount: omnichannelVideos.length,
        omnichannelVideos: omnichannelVideos.map(v => ({
          id: v.id,
          titulo: v.titulo,
          curso_id: v.curso_id,
          categoria: v.categoria,
          modulo_id: v.modulo_id,
          url_video: v.url_video
        }))
      });

      if (omnichannelVideos.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum vídeo encontrado para o curso OMNICHANNEL para Empresas.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${omnichannelVideos.length} vídeo(s) encontrado(s) para OMNICHANNEL.`,
        });
      }

    } catch (error) {
      console.error('❌ Erro ao verificar vídeos OMNICHANNEL:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar vídeos OMNICHANNEL.",
        variant: "destructive"
      });
    }
  };

  const testOmnichannelVideoImport = async () => {
    console.log('🧪 Testando importação de vídeo para OMNICHANNEL...');
    try {
      // Primeiro, buscar o curso OMNICHANNEL para Empresas
      const { data: omnichannelCourse, error: courseError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .eq('nome', 'OMNICHANNEL para Empresas')
        .single();

      if (courseError || !omnichannelCourse) {
        console.error('❌ Curso OMNICHANNEL para Empresas não encontrado:', courseError);
        toast({
          title: "Erro",
          description: "Curso OMNICHANNEL para Empresas não encontrado. Use 'Recriar OMNI' primeiro.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Curso OMNICHANNEL encontrado:', omnichannelCourse);

      // Inserir um vídeo de teste para o curso OMNICHANNEL
      const { data: testVideo, error: videoError } = await supabase
        .from('videos')
        .insert({
          titulo: 'Teste de Importação OMNICHANNEL',
          descricao: 'Vídeo de teste para verificar se a importação funciona',
          duracao: 5,
          url_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          categoria: 'OMNICHANNEL',
          curso_id: omnichannelCourse.id,
          modulo_id: null
        })
        .select()
        .single();

      if (videoError) {
        console.error('❌ Erro ao inserir vídeo de teste:', videoError);
        toast({
          title: "Erro",
          description: "Erro ao inserir vídeo de teste para OMNICHANNEL.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Vídeo de teste inserido com sucesso:', testVideo);
      toast({
        title: "Sucesso",
        description: "Vídeo de teste inserido para OMNICHANNEL. Teste o botão 'Iniciar Curso' agora!",
      });

      // Recarregar dados
      refetch();
      
    } catch (error) {
      console.error('❌ Erro ao testar importação OMNICHANNEL:', error);
      toast({
        title: "Erro",
        description: "Erro ao testar importação para OMNICHANNEL.",
        variant: "destructive"
      });
    }
  };

  const recreateOmnichannelCourse = async () => {
    console.log('🔧 Recriando curso OMNICHANNEL para Empresas...');
    try {
      // Primeiro, verificar se a categoria OMNICHANNEL existe
      const { data: categoria, error: catError } = await supabase
        .from('categorias')
        .select('*')
        .eq('nome', 'OMNICHANNEL')
        .single();

      if (catError) {
        console.log('⚠️ Categoria OMNICHANNEL não encontrada, criando...');
        const { data: newCategoria, error: newCatError } = await supabase
          .from('categorias')
          .insert({
            nome: 'OMNICHANNEL',
            descricao: 'Treinamentos sobre plataformas Omnichannel',
            cor: '#10B981'
          })
          .select()
          .single();

        if (newCatError) {
          console.error('❌ Erro ao criar categoria OMNICHANNEL:', newCatError);
          return;
        }
        console.log('✅ Categoria OMNICHANNEL criada:', newCategoria);
      } else {
        console.log('✅ Categoria OMNICHANNEL encontrada:', categoria);
      }

      // Agora criar o curso OMNICHANNEL para Empresas
      const { data: newCourse, error: courseError } = await supabase
        .from('cursos')
        .insert({
          nome: 'OMNICHANNEL para Empresas',
          categoria: 'OMNICHANNEL',
          descricao: 'Implementação de soluções omnichannel em ambientes empresariais',
          status: 'ativo',
          ordem: 1
        })
        .select()
        .single();

      if (courseError) {
        console.error('❌ Erro ao criar curso OMNICHANNEL para Empresas:', courseError);
        toast({
          title: "Erro",
          description: "Erro ao criar curso OMNICHANNEL para Empresas.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Curso OMNICHANNEL para Empresas criado:', newCourse);
      toast({
        title: "Sucesso",
        description: "Curso OMNICHANNEL para Empresas recriado com sucesso!",
      });

      // Recarregar dados
      refetch();
      
    } catch (error) {
      console.error('❌ Erro ao recriar curso OMNICHANNEL:', error);
      toast({
        title: "Erro",
        description: "Erro ao recriar curso OMNICHANNEL para Empresas.",
        variant: "destructive"
      });
    }
  };

  const checkAndFixCourseIds = async () => {
    console.log('🔧 Verificando IDs dos cursos...');
    try {
      // Buscar todos os cursos
      const { data: allCourses, error: coursesError } = await supabase
        .from('cursos')
        .select('id, nome, categoria, status');
      
      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return;
      }

      console.log('📋 Total de cursos encontrados:', allCourses?.length || 0);
      console.log('📋 Cursos disponíveis:', allCourses?.map(c => ({
        id: c.id,
        nome: c.nome,
        categoria: c.categoria,
        status: c.status
      })));

      // Verificar curso OMNICHANNEL para Empresas especificamente
      const omnichannelCourse = allCourses?.find(c => 
        c.nome.toLowerCase().includes('omnichannel para empresas')
      );

      if (omnichannelCourse) {
        console.log('✅ Curso OMNICHANNEL para Empresas encontrado:', omnichannelCourse);
        console.log('✅ ID do curso:', omnichannelCourse.id);
        console.log('✅ ID é válido?', omnichannelCourse.id && omnichannelCourse.id !== '');
      } else {
        console.log('⚠️ Curso OMNICHANNEL para Empresas NÃO encontrado');
      }

      // Verificar todos os cursos OMNICHANNEL
      const omnichannelCourses = allCourses?.filter(c => 
        c.categoria.toLowerCase() === 'omnichannel'
      ) || [];

      console.log('📋 Cursos OMNICHANNEL encontrados:', omnichannelCourses.length);
      omnichannelCourses.forEach(c => {
        console.log(`📋 Curso: "${c.nome}" - ID: ${c.id} - Status: ${c.status}`);
      });

      toast({
        title: "Verificação Concluída",
        description: `${allCourses?.length || 0} cursos verificados. Verifique o console para detalhes.`,
      });

      // Recarregar dados
      refetch();
      
    } catch (error) {
      console.error('❌ Erro ao verificar IDs dos cursos:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar IDs dos cursos.",
        variant: "destructive"
      });
    }
  };

  const checkAndFixOrphanVideos = async () => {
    console.log('🔧 Verificando vídeos órfãos...');
    try {
      // Buscar todos os vídeos
      const { data: allVideos, error: videosError } = await supabase
        .from('videos')
        .select('*');
      
      if (videosError) {
        console.error('❌ Erro ao buscar vídeos:', videosError);
        return;
      }

      console.log('📋 Total de vídeos encontrados:', allVideos?.length || 0);
      
      // Buscar todos os cursos
      const { data: allCourses, error: coursesError } = await supabase
        .from('cursos')
        .select('id, nome, categoria');
      
      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return;
      }

      console.log('📋 Total de cursos encontrados:', allCourses?.length || 0);
      console.log('📋 Cursos disponíveis:', allCourses?.map(c => ({ id: c.id, nome: c.nome, categoria: c.categoria })));
      
      // Verificar vídeos sem curso_id ou com curso_id inválido
      const orphanVideos = allVideos?.filter(video => {
        return !video.curso_id || !allCourses?.find(c => c.id === video.curso_id);
      }) || [];

      console.log('📋 Vídeos órfãos encontrados:', orphanVideos.length);
      
      if (orphanVideos.length > 0) {
        console.log('🔧 Vídeos órfãos:', orphanVideos.map(v => ({
          id: v.id,
          titulo: v.titulo,
          curso_id: v.curso_id,
          categoria: v.categoria
        })));

        // Tentar associar vídeos órfãos aos cursos corretos
        for (const video of orphanVideos) {
          // Se o vídeo tem categoria, tentar encontrar curso correspondente
          if (video.categoria) {
            const matchingCourse = allCourses?.find(c => 
              c.categoria.toLowerCase() === video.categoria.toLowerCase()
            );
            
            if (matchingCourse) {
              console.log(`🔧 Associando vídeo "${video.titulo}" ao curso "${matchingCourse.nome}"`);
              
              const { error: updateError } = await supabase
                .from('videos')
                .update({ curso_id: matchingCourse.id })
                .eq('id', video.id);
              
              if (updateError) {
                console.error(`❌ Erro ao associar vídeo ${video.id}:`, updateError);
              } else {
                console.log(`✅ Vídeo ${video.id} associado com sucesso`);
              }
            } else {
              console.log(`⚠️ Não foi possível encontrar curso para categoria "${video.categoria}"`);
            }
          }
        }
      }

      // Verificar especificamente vídeos do OMNICHANNEL
      console.log('🔍 Verificando vídeos do OMNICHANNEL...');
      const omnichannelVideos = allVideos?.filter(v => 
        v.categoria?.toLowerCase().includes('omnichannel') || 
        v.categoria?.toLowerCase().includes('omni')
      ) || [];

      console.log('📋 Vídeos do OMNICHANNEL encontrados:', omnichannelVideos.length);
      omnichannelVideos.forEach(v => {
        console.log(`📋 Vídeo OMNICHANNEL: "${v.titulo}" - Curso ID: ${v.curso_id} - Categoria: ${v.categoria}`);
      });

      // Verificar se há curso OMNICHANNEL
      const omnichannelCourse = allCourses?.find(c => 
        c.categoria.toLowerCase() === 'omnichannel'
      );

      if (omnichannelCourse) {
        console.log('✅ Curso OMNICHANNEL encontrado:', omnichannelCourse);
        
        // Associar vídeos OMNICHANNEL ao curso correto
        for (const video of omnichannelVideos) {
          if (video.curso_id !== omnichannelCourse.id) {
            console.log(`🔧 Corrigindo associação do vídeo "${video.titulo}" para o curso OMNICHANNEL`);
            
            const { error: updateError } = await supabase
              .from('videos')
              .update({ curso_id: omnichannelCourse.id })
              .eq('id', video.id);
            
            if (updateError) {
              console.error(`❌ Erro ao corrigir vídeo ${video.id}:`, updateError);
            } else {
              console.log(`✅ Vídeo ${video.id} corrigido com sucesso`);
            }
          }
        }
      } else {
        console.log('⚠️ Curso OMNICHANNEL não encontrado');
      }

      toast({
        title: "Verificação Concluída",
        description: `${orphanVideos.length} vídeos órfãos verificados e corrigidos.`,
      });

      // Recarregar vídeos
      loadVideos();
      
    } catch (error) {
      console.error('❌ Erro ao verificar vídeos órfãos:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar vídeos órfãos.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVideo = async (video) => {
    console.log('🗑️ Tentando deletar vídeo:', video);
    
    if (!window.confirm('Tem certeza que deseja deletar este vídeo?')) {
      console.log('❌ Usuário cancelou a exclusão');
      return;
    }

    // Definir estado de loading
    setDeletingVideoId(video.id);

    try {
      console.log('🔧 Iniciando processo de exclusão...');
      
      // 1. Remover do Storage (se existir)
      let storageError = null;
      if (video.storage_path) {
        console.log('📁 Removendo do storage:', video.storage_path);
        const { error } = await supabase.storage.from('training-videos').remove([video.storage_path]);
        storageError = error;
        if (error) {
          console.error('❌ Erro ao remover do storage:', error);
        } else {
          console.log('✅ Removido do storage com sucesso');
        }
      } else {
        console.log('ℹ️ Vídeo não tem storage_path (pode ser YouTube)');
      }

      // 2. Remover do banco de dados
      console.log('🗄️ Removendo do banco de dados:', video.id);
      const { error: dbError } = await supabase.from('videos').delete().eq('id', video.id);
      
      if (dbError) {
        console.error('❌ Erro ao remover do banco:', dbError);
        toast({ 
          title: 'Erro', 
          description: `Erro ao deletar vídeo: ${dbError.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      console.log('✅ Vídeo removido do banco com sucesso');

      // 3. Atualizar estado local
      setVideos(prev => prev.filter(v => v.id !== video.id));
      
      // 4. Feedback de sucesso
      toast({ 
        title: 'Sucesso', 
        description: 'Vídeo deletado com sucesso!' 
      });
      
      console.log('✅ Processo de exclusão concluído');

    } catch (error) {
      console.error('❌ Erro inesperado ao deletar vídeo:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro inesperado ao deletar vídeo.', 
        variant: 'destructive' 
      });
    } finally {
      // Limpar estado de loading
      setDeletingVideoId(null);
    }
  };

  if (isLoading) {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3 lg:mb-4"></div>
            <p className="text-gray-600 text-sm lg:text-base">Carregando treinamentos...</p>
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
            <p className="text-gray-500 text-xs lg:text-sm">Tente recarregar a página ou entre em contato com o suporte.</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  return (
    <ERALayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <VideoUpload 
              onClose={() => setShowUpload(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {/* Hero Section com gradiente */}
        <div className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md" style={{background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)"}}>
          <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  
                  {/* 1. Label "Plataforma de Ensino" (Delay 0ms) */}
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
                  
                  {/* 2. Título "Treinamentos" (Delay 100ms) */}
                  <div className="mb-2 lg:mb-3">
                    <BlurText 
                      text="Treinamentos" 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white m-0 p-0"
                      delay={50}
                      animateBy="letters"
                      direction="top"
                    />
                  </div>

                  {/* 3. Descrição (Delay 200ms) */}
                  <div className="mb-3 lg:mb-4 max-w-2xl">
                    <BlurText 
                      text="Explore nossos cursos de PABX e Omnichannel com conteúdo exclusivo e atualizado"
                      className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 m-0 p-0"
                      delay={30} // Delay entre palavras
                      animateBy="words" // Melhor usar 'words' para frases longas
                      direction="top"
                    />
                  </div>

                  {/* 4. Estatísticas (Delay 400ms - aparecem juntas) */}
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                    
                    {/* Stat 1 */}
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <BlurText 
                        text={`${filteredCourses.length} cursos disponíveis`}
                        className="text-white m-0 p-0"
                        delay={20}
                        animateBy="words"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <BlurText 
                        text="+1 horas de conteúdo"
                        className="text-white m-0 p-0"
                        delay={20}
                        animateBy="words"
                      />
                    </div>

                    {/* Stat 3 */}
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

                {/* Botões de Admin (Mantidos iguais) */}
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
            {/* Tabs com design melhorado */}
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
                {/* Filtros com design melhorado */}
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

                {/* Lista de vídeos para administrador */}
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
                      {/* Modal de visualização de vídeo */}
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
                      {/* Resumo inferior */}
                      <div className="mt-6 flex justify-end">
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          Vídeos Importados: {videos.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cursos agrupados por categoria */}
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
                    {getCoursesByCategory().map((categoryGroup) => (
                      <Card key={categoryGroup.categoria} className="hover:shadow-xl transition-all duration-300 h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-white rounded-xl" style={{background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)"}}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base lg:text-lg font-bold text-white mb-2 truncate">
                                {categoryGroup.categoria}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-1 mb-2">
                                <Badge className="text-xs bg-white/20 text-white border-white/30">
                                  {categoryGroup.cursos.length} curso{categoryGroup.cursos.length !== 1 ? 's' : ''}
                                </Badge>
                                <Badge className="text-xs bg-white/20 text-white border-white/30">
                                  {categoryGroup.totalHoras}+ horas
                                </Badge>
                              </div>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">Categoria:</span>
                              <span className="ml-1 truncate">{categoryGroup.categoria}</span>
                            </div>

                            <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                              <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">Total de horas:</span>
                              <span className="ml-1">{categoryGroup.totalHoras}+ horas</span>
                            </div>

                            <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                              <Users className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">Níveis:</span>
                              <span className="ml-1 truncate">{categoryGroup.niveis.join(', ')}</span>
                            </div>

                            <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                              <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">Status:</span>
                              <span className="ml-1">{categoryGroup.cursosAtivos} ativos</span>
                            </div>
                          </div>

                          {/* Lista de cursos da categoria */}
                          <div className="bg-era-gray-light p-2 lg:p-3 rounded-lg">
                            <div className="text-xs lg:text-sm font-medium text-era-black mb-2">Cursos disponíveis:</div>
                            <div className="space-y-1 lg:space-y-2">
                              {categoryGroup.cursos.slice(0, 3).map((course) => (
                                <div key={course.id} className="flex items-center justify-between text-xs lg:text-sm">
                                  <span className="text-era-gray-medium truncate flex-1 mr-2">{course.nome}</span>
                                  <Badge className="text-xs flex-shrink-0 bg-era-green text-black" variant="outline">
                                    {getVisualProp(course, 'level', 'Iniciante')}
                                  </Badge>
                                </div>
                              ))}
                              {categoryGroup.cursos.length > 3 && (
                                <div className="text-xs text-era-gray-medium text-center pt-1">
                                  +{categoryGroup.cursos.length - 3} mais cursos
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewCategoryCourses(categoryGroup)}
                              className="w-full text-xs lg:text-sm bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                              Ver Cursos
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Card para Adicionar Novo Curso - Apenas para admins */}
                    {isAdmin && (
                      <Card className="hover:shadow-xl transition-all duration-300 border-2 border-dashed border-era-green bg-era-gray-light h-full">
                        <CardContent className="p-6 lg:p-8 text-center">
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-era-green/20 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                              <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-era-green" />
                            </div>
                            <h3 className="text-sm lg:text-lg font-bold text-era-black mb-2">
                              Adicionar Novo Curso
                            </h3>
                            <p className="text-xs lg:text-sm text-era-gray-medium mb-3 lg:mb-4">
                              Crie um novo curso de treinamento
                            </p>
                            <Button
                              className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white text-xs lg:text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled
                            >
                              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                              Criar Curso
                            </Button>
                            <p className="text-xs text-era-gray-medium mt-2">
                              Disponível para administradores
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Cursos individuais quando categoria está filtrada */}
                {selectedCategory !== 'all' && filteredCourses.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <h2 className="text-xl lg:text-2xl font-bold text-era-black">
                        Cursos - {selectedCategory}
                      </h2>
                      <Button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchTerm('');
                        }}
                        className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para Categorias
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {filteredCourses.map((course, index) => (
                        <CourseCard
                          key={course.id}
                          course={course as unknown as Course}
                          onStartCourse={handleStartCourse}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Estatísticas com design melhorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{courses.length}</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Cursos Disponíveis</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{categories.length}</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Categorias</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{isAdmin ? videos.length : '50+'}</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">
                    {isAdmin ? 'Vídeos Importados' : 'Horas de Conteúdo'}
                  </p>
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
