import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseModules, useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Module, Course } from '@/hooks/useCourses';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Play, Clock, PlusCircle, Video, BookOpen, FileText, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { VideoPlayerWithProgress } from '@/components/VideoPlayerWithProgress';
import { VideoChecklist } from '@/components/VideoChecklist';
import { QuizModal } from '@/components/QuizModal';
import { CourseCompletionModal } from '@/components/CourseCompletionModal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CommentsSection from '@/components/CommentsSection';
import { useQuiz } from '@/hooks/useQuiz';
import { useOptionalQuiz } from '@/hooks/useOptionalQuiz';
import { useCertificates } from '@/hooks/useCertificates';
import { QuizNotification } from '@/components/QuizNotification';
import { CourseQuizModal } from '@/components/CourseQuizModal';
import { toast } from '@/components/ui/use-toast';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoInfo } from '@/components/VideoInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Adicionar tipo auxiliar para vídeo com modulo_id e categoria
type VideoWithModulo = Database['public']['Tables']['videos']['Row'] & {
  modulo_id?: string;
  categoria?: string;
};

const ModuleEditForm = ({ modulo, onSaved }: { modulo: Module, onSaved: () => void }) => {
  const [link, setLink] = React.useState(modulo.link_video || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase
      .from('modulos')
      .update({ link_video: link })
      .eq('id', modulo.id);
    setLoading(false);
    if (error) {
      setError('Erro ao salvar');
    } else {
      onSaved();
    }
  };

  return (
    <div className="p-2 border rounded mb-2 bg-gray-50">
      <label className="block mb-1 font-semibold">Link do vídeo</label>
      <input
        className="border px-2 py-1 w-full mb-2"
        value={link}
        onChange={e => setLink(e.target.value)}
        placeholder="https://youtu.be/..."
      />
      <button
        className="bg-era-green text-era-black px-3 py-1 rounded font-bold"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

// Helper para pegar o link do vídeo
function getVideoUrl(item: Module | { url_video?: string; link_video?: string }) {
  if ('link_video' in item && item.link_video) return item.link_video;
  if ('url_video' in item && item.url_video) return item.url_video;
  return '';
}

function getModuleTitle(item: Module | { titulo?: string; nome_modulo?: string }) {
  if ('nome_modulo' in item && item.nome_modulo) return item.nome_modulo;
  if ('titulo' in item && item.titulo) return item.titulo;
  return '';
}

const CursoDetalhe = () => {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';
  const userId = userProfile?.id;
  const navigate = useNavigate();

  // Debug logs apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 CursoDetalhe - Componente carregado');
    console.log('🎯 CursoDetalhe - ID recebido:', id);
    console.log('🎯 CursoDetalhe - IsAdmin:', isAdmin);
  }

  const [videos, setVideos] = React.useState<VideoWithModulo[]>([]);
  const [progress, setProgress] = React.useState<Record<string, Database['public']['Tables']['video_progress']['Row']>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = React.useState<VideoWithModulo | null>(null);
  const [selectedModule, setSelectedModule] = React.useState<Module | null>(null);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showQuizNotification, setShowQuizNotification] = React.useState(false);
  const [showQuizModal, setShowQuizModal] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);

  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [currentCourse, setCurrentCourse] = React.useState<Course | null>(null);
  const [totalVideos, setTotalVideos] = React.useState(0);
  const [completedVideos, setCompletedVideos] = React.useState(0);
  const [quizCompleted, setQuizCompleted] = React.useState(false);
  const [quizShown, setQuizShown] = React.useState(false);
  const [showVideoUpload, setShowVideoUpload] = React.useState(false);
  const { data: allCourses = [] } = useCourses();
  const currentCourseData = allCourses.find(c => c.id === id);
  const currentCategory = currentCourseData?.categoria;
  const { data: modules = [] } = useCourseModules(id || '');
  
  // Hook para gerenciar quiz opcional (não interfere no fluxo atual)
  const { quizState, loading: quizLoading, checkCourseCompletion } = useOptionalQuiz(id || '');
  
  // Hook para gerenciar quiz
  const { 
    quizConfig, 
    certificate
  } = useQuiz(userId, id);
  
  // Hook para gerenciar certificados
  const { generateCertificate } = useCertificates(userId);

  // Calcular progresso do curso
  const calculateCourseProgress = React.useCallback(async () => {
    if (!id || !userId) return;

    try {
      // Buscar todos os vídeos do curso
      const { data: allVideos } = await supabase
        .from('videos')
        .select('id')
        .eq('curso_id', id);

      if (!allVideos) return;

      const total = allVideos.length;
      setTotalVideos(total);

      // Buscar progresso dos vídeos
      const videoIds = allVideos.map(v => v.id);
      const { data: progress } = await supabase
        .from('video_progress')
        .select('video_id, concluido')
        .eq('user_id', userId)
        .in('video_id', videoIds);

      if (progress) {
        const completed = progress.filter(p => p.concluido).length;
        setCompletedVideos(completed);
      }
    } catch (error) {
      console.error('Erro ao calcular progresso do curso:', error);
    }
  }, [id, userId]);

  // Carregar progresso inicial
  React.useEffect(() => {
    calculateCourseProgress();
  }, [calculateCourseProgress]);

  // Verificar se deve mostrar notificação de quiz (apenas uma vez)
  React.useEffect(() => {
    if (quizState.shouldShowQuiz && !quizCompleted && !quizShown) {
      console.log('🎯 Curso concluído! Mostrando notificação de quiz...');
      setShowQuizNotification(true);
      setQuizShown(true); // Marcar como já mostrado para esta sessão
    }
  }, [quizState.shouldShowQuiz, quizCompleted, quizShown]);

  // Forçar verificação do quiz quando progresso dos vídeos mudar
  React.useEffect(() => {
    if (videos.length > 0 && Object.keys(progress).length > 0) {
      // Verificar se todos os vídeos foram concluídos
      const allVideosCompleted = videos.every(video => {
        const videoProgress = progress[video.id];
        const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 90;
        return isCompleted;
      });

      if (allVideosCompleted && !quizState.quizAlreadyCompleted) {
        console.log('🎯 Todos os vídeos concluídos detectados! Forçando verificação do quiz...');
        checkCourseCompletion();
      }
    }
  }, [videos, progress, quizState.quizAlreadyCompleted, checkCourseCompletion]);

  const handleCourseComplete = React.useCallback(async (courseId: string) => {
    if (!userId || !id) return;
    
    try {
      // Verificar se todos os vídeos foram concluídos
      const allVideosCompleted = videos.every(video => {
        const videoProgress = progress[video.id];
        const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 90;
        return isCompleted;
      });

      if (allVideosCompleted) {
        console.log('🎉 Todos os vídeos foram concluídos!');
        
        // Forçar nova verificação do quiz
        await checkCourseCompletion();
        
        // Verificar se deve mostrar quiz imediatamente
        if (quizState.shouldShowQuiz && !quizCompleted && !quizShown) {
          console.log('🎯 Mostrando quiz imediatamente após conclusão do curso!');
          setShowQuizNotification(true);
          setQuizShown(true);
        }
        
        // Gerar certificado se disponível (nota 100 para conclusão por vídeos)
        if (generateCertificate && id) {
          try {
            // Para conclusão por vídeos, usar um quiz_id padrão ou null
            await generateCertificate(id, '', 100);
            console.log('✅ Certificado gerado com sucesso!');
          } catch (error) {
            console.error('❌ Erro ao gerar certificado:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conclusão do curso:', error);
    }
  }, [userId, id, videos, progress, generateCertificate, quizState, quizCompleted, quizShown, checkCourseCompletion]);

  const handleQuizComplete = React.useCallback(async () => {
    setQuizCompleted(true);
    setShowQuizModal(false);
    setShowQuizNotification(false);
    
    // Marcar quiz como completado no banco de dados
    try {
      if (currentCategory && userProfile?.id) {
        // Buscar o quiz da categoria
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('id')
          .eq('categoria', currentCategory)
          .eq('ativo', true)
          .single();

        if (quizData) {
          // Marcar como completado (mesmo que não tenha nota ainda)
          await supabase
            .from('progresso_quiz')
            .upsert({
              usuario_id: userProfile.id,
              quiz_id: quizData.id,
              respostas: {},
              nota: 0, // Será atualizada quando o quiz for realmente completado
              aprovado: false,
              data_conclusao: new Date().toISOString()
            });

          console.log('✅ Quiz marcado como completado no banco de dados');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao marcar quiz como completado:', error);
    }
    
    // Gerar certificado após conclusão do quiz (nota será definida pelo quiz)
    if (generateCertificate && id) {
      try {
        // Para conclusão por quiz, usar quiz_id da categoria
        const quizId = currentCategory || '';
        await generateCertificate(id, quizId, 100); // Nota padrão para conclusão por quiz
        toast({
          title: "Parabéns!",
          description: "Quiz concluído com sucesso! Seu certificado foi gerado.",
        });
      } catch (error) {
        console.error('❌ Erro ao gerar certificado:', error);
      }
    }
  }, [generateCertificate, toast, currentCategory, userProfile?.id]);

  const fetchVideosAndProgress = async () => {
    setLoading(true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 CursoDetalhe - Iniciando carregamento:', {
        cursoId: id,
        userId: userId,
        isAdmin: isAdmin
      });
    }
    
    let finalVideos: VideoWithModulo[] = [];
    
    try {
      // Consulta direta por curso_id
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('curso_id', id)
        .order('data_criacao', { ascending: false });

      if (videosError) {
        console.error('❌ Erro ao buscar vídeos por curso_id:', videosError);
      } else {
        console.log('🔍 CursoDetalhe - Vídeos encontrados por curso_id:', videosData);
      }

      // Buscar vídeos específicos deste curso OU vídeos da mesma categoria sem curso_id
      if (videosData && videosData.length > 0) {
        console.log('✅ Vídeos encontrados especificamente para este curso:', videosData);
        finalVideos = videosData;
      } else {
        console.log('🔍 CursoDetalhe - Nenhum vídeo encontrado por curso_id, verificando por categoria...');
        
        // Buscar o curso para obter a categoria
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('categoria')
          .eq('id', id)
          .single();

        if (cursoError) {
          console.error('❌ Erro ao buscar curso:', cursoError);
        } else if (cursoData?.categoria) {
          console.log('🔍 CursoDetalhe - Categoria do curso:', cursoData.categoria);
          
          // Buscar vídeos da mesma categoria que não têm curso_id definido
          const { data: videosByCategory, error: categoryError } = await supabase
            .from('videos')
            .select('*')
            .eq('categoria', cursoData.categoria)
            .is('curso_id', null)
            .order('ordem', { ascending: true });

          if (categoryError) {
            console.error('❌ Erro ao buscar vídeos por categoria:', categoryError);
          } else {
            console.log('🔍 CursoDetalhe - Vídeos encontrados por categoria (sem curso_id):', videosByCategory);
            
            if (videosByCategory && videosByCategory.length > 0) {
              console.log('🔧 CursoDetalhe - Associando vídeos órfãos ao curso atual...');
              
              // Associar vídeos órfãos ao curso atual
              for (const video of videosByCategory) {
                const { error: updateError } = await supabase
                  .from('videos')
                  .update({ curso_id: id })
                  .eq('id', video.id);
                
                if (updateError) {
                  console.error(`❌ Erro ao associar vídeo ${video.titulo}:`, updateError);
                } else {
                  console.log(`✅ Vídeo "${video.titulo}" associado ao curso ${id}`);
                }
              }
              
              // Recarregar vídeos após associação
              const { data: updatedVideos, error: reloadError } = await supabase
                .from('videos')
                .select('*')
                .eq('curso_id', id)
                .order('data_criacao', { ascending: false });

              if (reloadError) {
                console.error('❌ Erro ao recarregar vídeos:', reloadError);
              } else {
                console.log('✅ Vídeos recarregados após associação:', updatedVideos);
                finalVideos = updatedVideos || [];
              }
            } else {
              console.log('📋 Nenhum vídeo órfão encontrado para esta categoria');
              finalVideos = [];
            }
          }
        } else {
          console.log('📋 Nenhum vídeo encontrado para este curso específico');
          finalVideos = [];
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar vídeos:', error);
    }

    // Definir vídeos encontrados
    if (finalVideos.length > 0) {
      console.log('✅ Vídeos carregados com sucesso:', finalVideos);
      setVideos(finalVideos);
    } else {
      console.log('📋 Nenhum vídeo encontrado para este curso');
      setVideos([]);
    }

    // Buscar progresso do usuário para cada vídeo
    const { data: progressData, error: progressError } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .in('video_id', videos.map(v => v.id));

    console.log('🔍 CursoDetalhe - Resultado da consulta de progresso:', {
      progressData: progressData,
      progressError: progressError,
      totalProgress: progressData?.length || 0
    });

    if (progressError) {
      console.error('❌ Erro ao carregar progresso:', progressError);
    } else {
      console.log('✅ Progresso carregado com sucesso:', progressData);
    }

    // Indexar por video_id
    const progressMap: Record<string, Database['public']['Tables']['video_progress']['Row']> = {};
    (progressData || []).forEach((p) => {
      if (p.video_id) progressMap[p.video_id] = p;
    });
    setProgress(progressMap);
    setLoading(false);
  };

  React.useEffect(() => {
    if (!id || !userId) return;
    fetchVideosAndProgress();
  }, [id, userId, refresh]);

  // Filtrar vídeos do curso atual
  const filteredVideos = videos.filter(v => {
    // Verificar se o vídeo pertence ao curso atual
    return v.curso_id === id;
  });

  // Log apenas quando necessário para debug
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 CursoDetalhe - Vídeos filtrados:', {
      totalVideos: videos.length,
      filteredVideosCount: filteredVideos.length,
      currentCourseId: id,
      currentCategory: currentCategory
    });
  }

  // Calcular progresso total
  const totalProgress = Object.values(progress).reduce((acc, p) => acc + (p.percentual_assistido || 0), 0);
  const averageProgress = filteredVideos.length > 0 ? totalProgress / filteredVideos.length : 0;

  // Verificar se o curso está completo
  const isCourseComplete = filteredVideos.length > 0 && 
    filteredVideos.every(video => {
      const videoProgress = progress[video.id];
      return videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 90;
    });

  // Verificar se deve mostrar o quiz quando o curso for concluído
  React.useEffect(() => {
    if (isCourseComplete && !certificate && quizConfig) {
      setShowQuizModal(true);
    }
  }, [isCourseComplete, certificate, quizConfig]);

  const handleViewCertificate = () => {
    if (certificate) {
      window.open(`/certificado/${certificate.id}`, '_blank');
    }
  };

  // Criar módulos automáticos se necessário (para clientes)
  const createDefaultModules = async () => {
    if (!isAdmin && modules.length === 0 && videos.length > 0) {
      try {
        console.log('🔧 Criando módulos padrão para o curso...');
        
        // Criar módulo "Introdução"
        const { data: introModule, error: introError } = await supabase
          .from('modulos')
          .insert({
            curso_id: id,
            nome_modulo: 'Introdução',
            descricao: 'Vídeos introdutórios do curso',
            ordem: 1
          })
          .select()
          .single();

        if (introError) {
          console.error('❌ Erro ao criar módulo Introdução:', introError);
        } else {
          console.log('✅ Módulo Introdução criado:', introModule);
        }
      } catch (error) {
        console.error('❌ Erro ao criar módulos padrão:', error);
      }
    }
  };

  // Criar módulos automáticos quando necessário
  React.useEffect(() => {
    if (!isAdmin && modules.length === 0 && videos.length > 0 && !loading) {
      createDefaultModules();
    }
  }, [isAdmin, modules.length, videos.length, loading, id]);

  // Selecionar primeiro vídeo automaticamente
  React.useEffect(() => {
    if (filteredVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(filteredVideos[0]);
    }
  }, [filteredVideos, selectedVideo]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentCourseData?.nome || 'Carregando...'}
              </h1>
              <p className="text-gray-600">
                {currentCourseData?.categoria || 'Categoria não definida'}
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('🎯 Botão Adicionar Vídeo clicado!');
                  console.log('🎯 showVideoUpload antes:', showVideoUpload);
                  setShowVideoUpload(true);
                  console.log('🎯 showVideoUpload depois:', true);
                }}
                className="bg-era-green hover:bg-era-green/90 text-era-black"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {filteredVideos.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso do Curso
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(averageProgress)}% completo
              </span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando curso...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player e Comentários */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {selectedVideo ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-2">
                  {/* Player de Vídeo */}
                  <VideoPlayerWithProgress
                    video={selectedVideo}
                    cursoId={id || ''}
                    moduloId={selectedModule?.id}
                    userId={userId}
                    onCourseComplete={handleCourseComplete}
                    totalVideos={totalVideos}
                    completedVideos={completedVideos}
                    className="mb-6"
                  />
                  
                  {/* Informações do Vídeo */}
                  <VideoInfo
                    titulo={selectedVideo.titulo}
                    descricao={selectedVideo.descricao}
                    duracao={selectedVideo.duracao}
                    progresso={progress[selectedVideo.id]}
                  />
                  
                  {/* Seção de Quiz (quando vídeos estão completos) */}
                  {isCourseComplete && quizConfig && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-era-green/10 to-era-green/20 rounded-lg border border-era-green/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-era-black mb-1">
                            🎯 Prova Final Disponível
                          </h3>
                          <p className="text-sm text-gray-600">
                            {quizConfig.perguntas?.length || 0} perguntas • Nota mínima: {quizConfig.nota_minima || 70}%
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowQuizModal(true)}
                          className="bg-era-green hover:bg-era-green/90 text-era-black"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Apresentar Prova
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum vídeo selecionado
                  </h3>
                  <p className="text-gray-600">
                    Selecione um vídeo da lista ao lado para começar a assistir.
                  </p>
                </div>
              )}

              {/* Comentários */}
              {selectedVideo && (
                <CommentsSection
                  videoId={selectedVideo.id}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lista de Vídeos */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-era-green" />
                  Vídeos do Curso
                </h3>
                
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      Nenhum vídeo disponível para este curso.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredVideos.map((video, index) => {
                      const videoProgress = progress[video.id];
                      const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 90;
                      const isSelected = selectedVideo?.id === video.id;
                      
                      return (
                        <div
                          key={video.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-era-green/20 border border-era-green/30'
                              : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                          }`}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-era-green" />
                              ) : (
                                <Play className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {video.titulo}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {video.duracao ? `${Math.round(video.duracao / 60)} min` : 'Duração não definida'}
                                </span>
                                {videoProgress && (
                                  <span className="text-xs text-era-green font-medium">
                                    {Math.round(videoProgress.percentual_assistido || 0)}% completo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estatísticas */}
              {filteredVideos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-era-green" />
                    Estatísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de vídeos</span>
                      <span className="text-sm font-medium">{filteredVideos.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vídeos concluídos</span>
                      <span className="text-sm font-medium text-era-green">
                        {filteredVideos.filter(v => {
                          const videoProgress = progress[v.id];
                          return videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 90;
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progresso geral</span>
                      <span className="text-sm font-medium">{Math.round(averageProgress)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificado */}
              {certificate && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-era-green" />
                    Certificado
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Parabéns! Você concluiu este curso com sucesso.
                  </p>
                  <Button
                    onClick={handleViewCertificate}
                    className="w-full bg-era-green hover:bg-era-green/90 text-era-black"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Certificado
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificação de Quiz (Não-intrusiva) */}
        <QuizNotification
          courseId={id || ''}
          courseName={currentCourseData?.nome || ''}
          isVisible={showQuizNotification}
          onClose={() => setShowQuizNotification(false)}
          onQuizComplete={handleQuizComplete}
        />

        {/* Modal de Quiz */}
        <CourseQuizModal
          courseId={id || ''}
          courseName={currentCourseData?.nome || ''}
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          onQuizComplete={handleQuizComplete}
        />

        {/* Video Upload Modal */}
        {showVideoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <VideoUpload
              onClose={() => {
                console.log('🎯 Fechando modal VideoUpload');
                setShowVideoUpload(false);
              }}
              onSuccess={() => {
                console.log('🎯 Sucesso no upload, fechando modal');
                setShowVideoUpload(false);
                setRefresh(prev => prev + 1);
              }}
              preSelectedCourseId={id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CursoDetalhe; 