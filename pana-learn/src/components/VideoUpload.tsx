import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, X, Youtube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useCourses, useCourseModules } from '@/hooks/useCourses';

interface VideoUploadProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCourseId?: string;
}

type VideoSource = 'upload' | 'youtube';

export function VideoUpload({ onClose, onSuccess, preSelectedCourseId }: VideoUploadProps) {
  console.log('🎯 VideoUpload - Componente montado');
  console.log('🎯 VideoUpload - Props:', { onClose, onSuccess, preSelectedCourseId });
  
  const { userProfile } = useAuth();
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState(preSelectedCourseId || '');
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(selectedCourseId);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<VideoSource>('upload');

  // Debug logs para módulos
  console.log('🔍 VideoUpload - Estado dos módulos:', {
    selectedCourseId,
    modulesLoading,
    modulesCount: modules.length,
    modules: modules.map(m => ({ id: m.id, nome_modulo: m.nome_modulo, ordem: m.ordem })),
    selectedModuleId
  });
  const [videoData, setVideoData] = useState({
    titulo: '',
    descricao: '',
    duracao: 0,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Debug logs
  console.log('🔍 VideoUpload - Estado dos cursos:', {
    coursesLoading,
    coursesError,
    coursesCount: courses.length,
    courses: courses.map(c => ({ id: c.id, nome: c.nome, categoria: c.categoria })),
    selectedCourseId
  });

  // Obter categoria do curso selecionado
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseCategory = selectedCourse?.categoria || '';

  console.log('🔍 VideoUpload - Curso selecionado:', {
    selectedCourse,
    courseCategory
  });

  // Debug logs específicos para OMNICHANNEL
  console.log('🔍 VideoUpload - Debug OMNICHANNEL:', {
    selectedCourseId,
    selectedCourse: selectedCourse,
    courseCategory: courseCategory,
    isOmnichannel: courseCategory?.toLowerCase().includes('omnichannel'),
    selectedCourseName: selectedCourse?.nome,
    isOmnichannelCourse: selectedCourse?.nome?.toLowerCase().includes('omnichannel')
  });

  // Atualizar selectedCourseId quando preSelectedCourseId mudar
  useEffect(() => {
    if (preSelectedCourseId) {
      setSelectedCourseId(preSelectedCourseId);
      console.log('🔍 VideoUpload - Curso pré-selecionado:', preSelectedCourseId);
    }
  }, [preSelectedCourseId]);

  // Executar padronização de módulos automaticamente quando o componente carregar
  useEffect(() => {
    const standardizeModulesOnLoad = async () => {
      try {
        console.log('🔧 Verificando e padronizando módulos automaticamente...');
        
        // Buscar todos os cursos
        const { data: allCourses, error: coursesError } = await supabase
          .from('cursos')
          .select('id, nome, categoria');

        if (coursesError || !allCourses) {
          console.error('❌ Erro ao buscar cursos:', coursesError);
          return;
        }

        // Verificar se algum curso não tem os módulos padrão
        for (const course of allCourses) {
          const { data: courseModules, error: modulesError } = await supabase
            .from('modulos')
            .select('nome_modulo')
            .eq('curso_id', course.id);

          if (modulesError) {
            console.error(`❌ Erro ao verificar módulos de ${course.nome}:`, modulesError);
            continue;
          }

          const hasUsabilidade = courseModules?.some(m => m.nome_modulo === 'Usabilidade');
          const hasConfiguracao = courseModules?.some(m => m.nome_modulo === 'Configuração');

          if (!hasUsabilidade || !hasConfiguracao) {
            console.log(`🔧 Padronizando módulos para ${course.nome}...`);
            
            // Remover módulos existentes
            await supabase
              .from('modulos')
              .delete()
              .eq('curso_id', course.id);

            // Inserir módulos padrão
            await supabase
              .from('modulos')
              .insert([
                {
                  curso_id: course.id,
                  nome_modulo: 'Usabilidade',
                  descricao: `Módulo focado na usabilidade e experiência do usuário do ${course.nome}`,
                  ordem: 1,
                  duracao: 0
                },
                {
                  curso_id: course.id,
                  nome_modulo: 'Configuração',
                  descricao: `Módulo focado na configuração e setup do ${course.nome}`,
                  ordem: 2,
                  duracao: 0
                }
              ]);

            console.log(`✅ Módulos padronizados para ${course.nome}`);
          }
        }

        console.log('✅ Verificação e padronização de módulos concluída');
      } catch (error) {
        console.error('❌ Erro ao padronizar módulos:', error);
      }
    };

    standardizeModulesOnLoad();
  }, []);

  // Função para inserir módulos de teste
  const insertTestModules = async () => {
    try {
      console.log('🔧 Inserindo módulos de teste...');
      
      // Verificar se há cursos disponíveis
      const { data: cursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .order('ordem', { ascending: true });

      if (cursosError || !cursos || cursos.length === 0) {
        toast({
          title: "Erro",
          description: "Primeiro insira os cursos usando o botão 'Inserir Cursos' na página de Treinamentos",
          variant: "destructive"
        });
        return;
      }

      console.log('📝 Cursos encontrados:', cursos.map(c => ({ id: c.id, nome: c.nome, categoria: c.categoria })));

      // Criar módulos para TODOS os cursos (forçar criação)
      const modulosToInsert = [];
      
      for (const curso of cursos) {
        console.log(`📝 Criando módulos para o curso "${curso.nome}"...`);
        
        // Primeiro, deletar módulos existentes para este curso (se houver)
        const { error: deleteError } = await supabase
          .from('modulos')
          .delete()
          .eq('curso_id', curso.id);

        if (deleteError) {
          console.log(`⚠️ Erro ao deletar módulos existentes para "${curso.nome}":`, deleteError);
        } else {
          console.log(`🗑️ Módulos existentes deletados para "${curso.nome}"`);
        }
        
        const modulosDoCurso = [
          {
            nome_modulo: 'Usabilidade',
            descricao: `Módulo focado na usabilidade e experiência do usuário do ${curso.nome}`,
            duracao: 0,
            ordem: 1,
            curso_id: curso.id
          },
          {
            nome_modulo: 'Configuração',
            descricao: `Módulo focado na configuração e setup do ${curso.nome}`,
            duracao: 0,
            ordem: 2,
            curso_id: curso.id
          }
        ];
        
        modulosToInsert.push(...modulosDoCurso);
      }

      console.log(`📝 Total de módulos a inserir: ${modulosToInsert.length}`);

      // Inserir módulos
      const { data: modulos, error: modulosError } = await supabase
        .from('modulos')
        .insert(modulosToInsert)
        .select();

      if (modulosError) {
        console.error('❌ Erro ao inserir módulos:', modulosError);
        throw modulosError;
      }

      console.log('✅ Módulos inseridos com sucesso:', modulos);
      toast({
        title: "Sucesso!",
        description: `Módulos 'Usabilidade' e 'Configuração' criados para ${cursos.length} cursos`,
      });

      // Recarregar a página para atualizar a lista
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('❌ Erro ao inserir módulos de teste:', err);
      toast({
        title: "Erro",
        description: "Erro ao inserir módulos de teste",
        variant: "destructive"
      });
    }
  };

  // Função para limpar cursos duplicados
  const cleanDuplicateCourses = async () => {
    try {
      console.log('🧹 Limpando cursos duplicados...');
      
      // Buscar todos os cursos
      const { data: allCourses, error: coursesError } = await supabase
        .from('cursos')
        .select('*')
        .order('data_criacao', { ascending: true });

      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return;
      }

      console.log('📝 Todos os cursos encontrados:', allCourses?.map(c => ({
        id: c.id,
        nome: c.nome,
        data_criacao: c.data_criacao
      })));

      // Identificar duplicados por nome (mais agressivo)
      const courseNames = new Map();
      const duplicatesToDelete = [];
      const keepCourses = [];

      for (const course of allCourses) {
        // Normalizar nome (remover espaços extras, converter para minúsculas)
        const normalizedName = course.nome.toLowerCase().trim().replace(/\s+/g, ' ');
        
        console.log(`🔍 Verificando: "${course.nome}" -> "${normalizedName}"`);
        
        if (courseNames.has(normalizedName)) {
          // Se já existe, adicionar à lista de duplicados
          duplicatesToDelete.push(course.id);
          console.log(`❌ Duplicado encontrado: "${course.nome}"`);
        } else {
          // Se é novo, adicionar ao mapa e lista de manter
          courseNames.set(normalizedName, course);
          keepCourses.push(course);
          console.log(`✅ Mantendo: "${course.nome}"`);
        }
      }

      console.log('📝 Cursos a manter:', keepCourses.map(c => c.nome));
      console.log('📝 Cursos a deletar:', duplicatesToDelete);

      if (duplicatesToDelete.length > 0) {
        console.log('🗑️ Deletando cursos duplicados:', duplicatesToDelete);
        
        // Deletar duplicados
        const { error: deleteError } = await supabase
          .from('cursos')
          .delete()
          .in('id', duplicatesToDelete);

        if (deleteError) {
          console.error('❌ Erro ao deletar duplicados:', deleteError);
          toast({
            title: "Erro",
            description: `Erro ao deletar duplicados: ${deleteError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Cursos duplicados removidos:', duplicatesToDelete.length);
          toast({
            title: "Sucesso!",
            description: `${duplicatesToDelete.length} cursos duplicados removidos`,
          });
          
          // Recarregar a página para atualizar a lista
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        console.log('✅ Nenhum curso duplicado encontrado');
        toast({
          title: "Info",
          description: "Nenhum curso duplicado encontrado",
        });
      }
    } catch (err) {
      console.error('❌ Erro ao limpar duplicados:', err);
      toast({
        title: "Erro",
        description: "Erro ao limpar cursos duplicados",
        variant: "destructive"
      });
    }
  };

  // Função para corrigir tudo de uma vez
  const fixAllIssues = async () => {
    try {
      console.log('🔧 Iniciando correção completa...');
      
      // 1. Limpar duplicados
      console.log('📝 Passo 1: Limpando duplicados...');
      await cleanDuplicateCourses();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. Criar módulos
      console.log('📝 Passo 2: Criando módulos...');
      await insertTestModules();
      
      toast({
        title: "Correção Completa!",
        description: "Duplicados removidos e módulos criados com sucesso!",
      });
      
    } catch (err) {
      console.error('❌ Erro na correção completa:', err);
      toast({
        title: "Erro",
        description: "Erro durante a correção completa",
        variant: "destructive"
      });
    }
  };

  // Função para inserir dados de teste
  const insertTestData = async () => {
    try {
      console.log('🔧 Inserindo dados de teste...');
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário autenticado:', user?.email);
      
      if (!user) {
        console.error('❌ Usuário não autenticado');
        toast({
          title: "Erro",
          description: "Você precisa estar logado para inserir dados de teste.",
          variant: "destructive"
        });
        return;
      }

      // Inserir categorias primeiro
      console.log('📝 Inserindo categorias...');
      const { data: categorias, error: catError } = await supabase
        .from('categorias')
        .upsert([
          { nome: 'PABX', descricao: 'Treinamentos sobre sistemas PABX', cor: '#3B82F6' },
          { nome: 'VoIP', descricao: 'Treinamentos sobre tecnologias VoIP', cor: '#10B981' },
          { nome: 'Omnichannel', descricao: 'Treinamentos sobre plataformas Omnichannel', cor: '#8B5CF6' },
          { nome: 'CALLCENTER', descricao: 'Treinamentos sobre call center', cor: '#6366F1' },
          { nome: 'Básico', descricao: 'Treinamentos introdutórios', cor: '#F59E0B' },
          { nome: 'Avançado', descricao: 'Treinamentos avançados', cor: '#EF4444' },
          { nome: 'Intermediário', descricao: 'Treinamentos de nível intermediário', cor: '#6B7280' }
        ], { onConflict: 'nome' });

      if (catError) {
        console.error('❌ Erro ao inserir categorias:', catError);
        toast({
          title: "Erro",
          description: `Erro ao inserir categorias: ${catError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Categorias inseridas:', categorias);

      // Inserir cursos completos (todos os que aparecem na página de Treinamentos)
      console.log('📝 Inserindo cursos...');
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
            nome: 'Omnichannel para Empresas',
            categoria: 'Omnichannel',
            descricao: 'Implementação de soluções omnichannel em ambientes empresariais',
            status: 'ativo',
            ordem: 4
          },
          {
            nome: 'Configurações Avançadas OMNI',
            categoria: 'Omnichannel',
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
          },
          {
            nome: 'Telefonia Básica',
            categoria: 'Básico',
            descricao: 'Conceitos fundamentais de telefonia e comunicação',
            status: 'ativo',
            ordem: 7
          },
          {
            nome: 'Sistemas de Comunicação',
            categoria: 'Intermediário',
            descricao: 'Sistemas intermediários de comunicação empresarial',
            status: 'ativo',
            ordem: 8
          }
        ], { onConflict: 'nome' });

      if (cursosError) {
        console.error('❌ Erro ao inserir cursos:', cursosError);
        toast({
          title: "Erro",
          description: `Erro ao inserir cursos: ${cursosError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Cursos inseridos:', cursos);
      
      toast({
        title: "Sucesso",
        description: "Dados de teste inseridos com sucesso! Recarregando...",
      });
      
      // Recarregar dados após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Erro ao inserir dados de teste:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao inserir dados de teste.",
        variant: "destructive"
      });
    }
  };

  // Reset módulo quando curso muda
  useEffect(() => {
    setSelectedModuleId('');
  }, [selectedCourseId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações melhoradas
    if (!selectedCourseId) {
      toast({
        title: "Erro",
        description: "Selecione um curso.",
        variant: "destructive"
      });
      return;
    }

    if (!videoData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "Digite o título do vídeo.",
        variant: "destructive"
      });
      return;
    }

    if (videoData.duracao <= 0) {
      toast({
        title: "Erro",
        description: "Digite a duração do vídeo em minutos.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'upload' && !videoFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo de vídeo.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'youtube' && !youtubeUrl) {
      toast({
        title: "Erro",
        description: "Insira a URL do vídeo do YouTube.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'youtube' && !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast({
        title: "Erro",
        description: "Insira uma URL válida do YouTube.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Debug: Verificar dados antes da inserção
      console.log('🔍 VideoUpload - Dados para inserção:', {
        titulo: videoData.titulo,
        descricao: videoData.descricao,
        duracao: videoData.duracao,
        curso_id: selectedCourseId,
        categoria: courseCategory,
        modulo_id: selectedModuleId || null,
        source: activeTab,
        selectedCourse: selectedCourse
      });

      let videoUrl = '';
      let storagePath = '';

      if (activeTab === 'upload') {
        // Upload do vídeo
        const videoPath = `videos/${Date.now()}_${videoFile!.name}`;
        videoUrl = await uploadFile(videoFile!, 'training-videos', videoPath);
        storagePath = videoPath;
      } else {
        // YouTube URL
        videoUrl = youtubeUrl;
        storagePath = `youtube/${Date.now()}_${videoData.titulo.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }

      // Upload da thumbnail (se fornecida)
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
        thumbnailUrl = await uploadFile(thumbnailFile, 'training-videos', thumbnailPath);
      }

      // Validação adicional para curso_id
      if (!selectedCourseId) {
        console.error('❌ VideoUpload - selectedCourseId está vazio:', selectedCourseId);
        toast({
          title: "Erro",
          description: "ID do curso não foi selecionado corretamente.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o curso existe antes da inserção
      const { data: courseCheck, error: courseCheckError } = await supabase
        .from('cursos')
        .select('id, nome, categoria')
        .eq('id', selectedCourseId)
        .single();

      if (courseCheckError || !courseCheck) {
        console.error('❌ VideoUpload - Curso não encontrado:', {
          selectedCourseId,
          courseCheckError,
          courseCheck
        });
        toast({
          title: "Erro",
          description: "Curso selecionado não foi encontrado no banco de dados.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ VideoUpload - Curso validado:', courseCheck);

      // Obter próxima ordem disponível
      const { data: nextOrderData, error: orderError } = await supabase.rpc('obter_proxima_ordem_video', {
        p_curso_id: selectedCourseId
      });

      if (orderError) {
        console.error('❌ Erro ao obter próxima ordem:', orderError);
        throw new Error('Erro ao calcular ordem do vídeo');
      }

      const nextOrder = nextOrderData || 1;

      // Dados para inserção no banco
      const videoDataToInsert = {
        titulo: videoData.titulo,
        descricao: videoData.descricao,
        duracao: videoData.duracao,
        url_video: videoUrl,
        thumbnail_url: thumbnailUrl,
        categoria: courseCategory,
        curso_id: selectedCourseId,
        modulo_id: selectedModuleId || null,
        ordem: nextOrder
      };

      console.log('📝 VideoUpload - Dados para inserção:', {
        ...videoDataToInsert,
        selectedCourse: selectedCourse?.nome,
        selectedModule: modules.find(m => m.id === selectedModuleId)?.nome_modulo
      });

      // Debug específico para OMNICHANNEL
      console.log('🔍 VideoUpload - Debug OMNICHANNEL Upload:', {
        cursoId: selectedCourseId,
        cursoNome: selectedCourse?.nome,
        categoria: courseCategory,
        isOmnichannel: courseCategory?.toLowerCase().includes('omnichannel'),
        videoTitulo: videoData.titulo,
        videoUrl: videoUrl,
        moduloId: selectedModuleId,
        moduloNome: modules.find(m => m.id === selectedModuleId)?.nome_modulo,
        totalModules: modules.length,
        modules: modules.map(m => ({ id: m.id, nome: m.nome_modulo, curso_id: m.curso_id }))
      });

      console.log('📝 VideoUpload - Inserindo vídeo no banco:', videoDataToInsert);

      // Salvar informações do vídeo no banco
      const { data: insertedVideo, error: insertError } = await supabase
        .from('videos')
        .insert(videoDataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir vídeo:', insertError);
        console.error('❌ Dados que tentou inserir:', videoDataToInsert);
        throw insertError;
      }

      console.log('✅ Vídeo inserido com sucesso:', insertedVideo);

      toast({
        title: "Sucesso",
        description: `Vídeo ${activeTab === 'upload' ? 'enviado' : 'importado'} com sucesso!`,
      });

      // Limpar formulário
      setVideoData({
        titulo: '',
        descricao: '',
        duracao: 0,
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setYoutubeUrl('');
      setSelectedCourseId('');
      setSelectedModuleId('');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${activeTab === 'upload' ? 'enviar' : 'importar'} o vídeo. Tente novamente.`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Importar Vídeo de Treinamento
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Faça upload de novos vídeos de treinamento para a plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Abas */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'youtube'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Youtube className="h-4 w-4" />
            YouTube
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curso">Curso *</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? "Carregando..." : "Selecione o curso"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modulo">Módulo (opcional)</Label>
              <div className="space-y-2">
                <Select 
                  value={selectedModuleId} 
                  onValueChange={setSelectedModuleId} 
                  disabled={!selectedCourseId || modulesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedCourseId ? "Selecione um curso primeiro" :
                      modulesLoading ? "Carregando..." :
                      modules.length === 0 ? "Nenhum módulo disponível" :
                      "Selecione o módulo (opcional)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(modulo => (
                      <SelectItem key={modulo.id} value={modulo.id}>
                        {modulo.nome_modulo} ({modulo.duracao || 0} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourseId && modules.length === 0 && (
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Nenhum módulo encontrado para este curso.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertTestModules}
                      className="text-xs h-6 px-2"
                    >
                      Criar Módulos
                    </Button>
                  </div>
                )}
                {selectedCourseId && modules.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {modules.length} módulo(s) disponível(is) para este curso
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Vídeo *</Label>
            <Input
              id="titulo"
              value={videoData.titulo}
              onChange={(e) => setVideoData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Digite o título do vídeo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={videoData.descricao}
              onChange={(e) => setVideoData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o conteúdo do vídeo"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (em minutos) *</Label>
            <Input
              id="duracao"
              type="number"
              min="1"
              value={videoData.duracao}
              onChange={(e) => setVideoData(prev => ({ ...prev, duracao: parseInt(e.target.value) || 0 }))}
              placeholder="Ex: 15"
              required
            />
          </div>

          {/* Aba Upload */}
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video">Arquivo de Vídeo *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    required
                  />
                  {videoFile && (
                    <span className="text-sm text-green-600">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Formatos aceitos: MP4, MOV, AVI, etc.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                  />
                  {thumbnailFile && (
                    <span className="text-sm text-green-600">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Imagem de capa do vídeo</p>
              </div>
            </div>
          )}

          {/* Aba YouTube */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">URL do Vídeo do YouTube *</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-gray-500">Cole a URL completa do vídeo do YouTube</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail-youtube">Thumbnail (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail-youtube"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                  />
                  {thumbnailFile && (
                    <span className="text-sm text-green-600">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Imagem de capa personalizada (opcional)</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                uploading || 
                !selectedCourseId || 
                !videoData.titulo || 
                !videoData.duracao || 
                (activeTab === 'upload' && !videoFile) ||
                (activeTab === 'youtube' && !youtubeUrl)
              }
              className="era-green-button flex-1"
            >
              {uploading ? (
                <>Enviando...</>
              ) : (
                <>
                  {activeTab === 'upload' ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Vídeo
                    </>
                  ) : (
                    <>
                      <Youtube className="mr-2 h-4 w-4" />
                      Importar do YouTube
                    </>
                  )}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
          </div>
        </form>


      </CardContent>
    </Card>
  );
}
