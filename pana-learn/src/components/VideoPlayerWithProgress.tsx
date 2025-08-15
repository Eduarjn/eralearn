import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, Play, Pause, Maximize2 } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { YouTubePlayerWithProgress } from './YouTubePlayerWithProgress';

interface VideoPlayerWithProgressProps {
  video: {
    id: string;
    titulo: string;
    url_video: string;
    thumbnail_url?: string;
    duracao?: number;
    source?: 'upload' | 'youtube';
  };
  cursoId: string;
  moduloId?: string;
  userId?: string;
  onProgressChange?: (progress: number) => void;
  onCourseComplete?: (courseId: string) => void;
  totalVideos?: number;
  completedVideos?: number;
  className?: string;
}

export const VideoPlayerWithProgress: React.FC<VideoPlayerWithProgressProps> = ({
  video,
  cursoId,
  moduloId,
  userId,
  onProgressChange,
  onCourseComplete,
  totalVideos,
  completedVideos,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCompletionBadge, setShowCompletionBadge] = useState(false);
  const [completionChecked, setCompletionChecked] = useState(false); // Nova variável para evitar chamadas repetidas

  const { toast } = useToast();
  const { progress, saveProgress, markAsCompleted } = useVideoProgress(userId, video.id, cursoId, moduloId);

  // Detectar se é vídeo do YouTube
  const isYouTube = video.url_video.includes('youtube.com') || video.url_video.includes('youtu.be');
  const youtubeVideoId = isYouTube ? extractYouTubeVideoId(video.url_video) : '';

  const detectYouTube = () => {
    if (isYouTube) {
      // Para YouTube, usar duração do vídeo se disponível
      if (video.duracao) {
        setDuration(video.duracao);
      }
    }
  };

  // Extrair ID do vídeo do YouTube
  const extractYouTubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Carregar metadados do vídeo
  useEffect(() => {
    if (isYouTube) {
      detectYouTube();
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [isYouTube, video.duracao]);

  // Eventos de tempo do vídeo
  useEffect(() => {
    if (isYouTube) return; // YouTube não suporta esses eventos via iframe

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);
      
      // Salvar progresso a cada 5 segundos
      if (Math.floor(time) % 5 === 0 && Math.floor(time) !== Math.floor(progress.tempoAssistido)) {
        saveProgress(time, duration);
      }

      // Verificar se chegou ao fim do vídeo (90% ou mais) - apenas uma vez
      if (duration > 0 && time >= duration * 0.9 && !progress.concluido && !completionChecked) {
        setCompletionChecked(true); // Marcar como verificado
        handleVideoCompletion();
      }

      // Notificar mudança de progresso
      if (onProgressChange) {
        const progressPercent = duration > 0 ? (time / duration) * 100 : 0;
        onProgressChange(progressPercent);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [progress.tempoAssistido, progress.concluido, duration, isYouTube, saveProgress, onProgressChange, completionChecked]);

  // Eventos de fim do vídeo
  useEffect(() => {
    if (isYouTube) return; // YouTube não suporta esses eventos via iframe

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (!completionChecked) {
        setCompletionChecked(true);
        handleVideoCompletion();
      }
    };

    videoElement.addEventListener('ended', handleEnded);
    return () => {
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [isYouTube, completionChecked]);

  const handleVideoCompletion = async () => {
    if (progress.concluido) return;

    try {
      await markAsCompleted();
      setShowCompletionBadge(true);
      
      toast({
        title: "Vídeo concluído!",
        description: `Você completou "${video.titulo}"`,
        variant: "default"
      });

      // Verificar se é o último vídeo da categoria
      if (onProgressChange) {
        onProgressChange(100); // Notificar que o vídeo foi concluído
      }

      // Verificar se o curso foi completamente concluído
      if (onCourseComplete && totalVideos && completedVideos !== undefined) {
        const newCompletedCount = completedVideos + 1;
        if (newCompletedCount >= totalVideos) {
          // Curso completamente concluído - chamar imediatamente
          console.log('🎯 Último vídeo concluído! Chamando onCourseComplete...');
          onCourseComplete(cursoId);
        }
      }

      // Esconder badge após 3 segundos
      setTimeout(() => setShowCompletionBadge(false), 3000);
    } catch (error) {
      console.error('Erro ao marcar vídeo como concluído:', error);
    }
  };

  const togglePlay = () => {
    if (isYouTube) {
      // Para YouTube, apenas marcar como concluído se necessário
      if (!progress.concluido && duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        if (progressPercent >= 90) {
          handleVideoCompletion();
        }
      }
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const handleFullscreen = () => {
    if (isYouTube) {
      // Para YouTube, deixar o iframe lidar com fullscreen
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Se for vídeo do YouTube, usar o componente especializado
  if (isYouTube) {
    return (
      <YouTubePlayerWithProgress
        video={video}
        cursoId={cursoId}
        moduloId={moduloId}
        userId={userId}
        onProgressChange={onProgressChange}
        onCourseComplete={onCourseComplete}
        totalVideos={totalVideos}
        completedVideos={completedVideos}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Badge de conclusão */}
      {progress.concluido && (
        <div className="absolute top-4 right-4 z-10 animate-pulse">
          <Badge variant="default" className="bg-green-500 text-white">
            <CheckCircle className="w-4 h-4 mr-1" />
            Concluído!
          </Badge>
        </div>
      )}

      {/* Player de vídeo */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.url_video}
          className="w-full aspect-video"
          poster={video.thumbnail_url}
          controls={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Botão fullscreen */}
        <button
          onClick={handleFullscreen}
          className="absolute bottom-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
          title="Tela cheia"
          type="button"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        
        {/* Controles customizados */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1">
              <Progress 
                value={progressPercent} 
                className="h-2 bg-white/20"
              />
            </div>
            
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Informações do vídeo */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.titulo}</h3>
        
        {/* Progresso */}
        <div className="flex items-center gap-2 mb-2">
          <Progress 
            value={progress.percentualAssistido} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-gray-600 font-medium">
            {Math.round(progress.percentualAssistido)}%
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {progress.concluido ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vídeo concluído
            </Badge>
          ) : progress.percentualAssistido > 0 ? (
            <Badge variant="secondary">
              Em andamento
            </Badge>
          ) : (
            <Badge variant="outline">
              Não iniciado
            </Badge>
          )}
          
          {progress.dataConclusao && (
            <span className="text-xs text-gray-500">
              Concluído em {new Date(progress.dataConclusao).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Loading state */}
      {progress.loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-sm text-gray-600">Carregando progresso...</div>
        </div>
      )}
    </div>
  );
}; 