import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CourseProgress {
  totalVideos: number;
  completedVideos: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastVideoCompleted: boolean;
}

export function useCourseProgress(courseId: string) {
  const { userProfile } = useAuth();
  const [progress, setProgress] = useState<CourseProgress>({
    totalVideos: 0,
    completedVideos: 0,
    progressPercentage: 0,
    isCompleted: false,
    lastVideoCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar progresso do curso
  const loadCourseProgress = useCallback(async () => {
    if (!courseId || !userProfile?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar todos os vídeos do curso
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, titulo, duracao')
        .eq('curso_id', courseId)
        .order('data_criacao');

      if (videosError) {
        throw new Error('Erro ao carregar vídeos do curso');
      }

      const totalVideos = videos?.length || 0;

      if (totalVideos === 0) {
        setProgress({
          totalVideos: 0,
          completedVideos: 0,
          progressPercentage: 0,
          isCompleted: false,
          lastVideoCompleted: false
        });
        return;
      }

      // Buscar progresso dos vídeos
      const videoIds = videos?.map(v => v.id) || [];
      const { data: videoProgress, error: progressError } = await supabase
        .from('video_progress')
        .select('video_id, concluido, percentual_assistido')
        .eq('user_id', userProfile.id)
        .in('video_id', videoIds);

      if (progressError) {
        throw new Error('Erro ao carregar progresso dos vídeos');
      }

      // Calcular progresso
      const completedVideos = videoProgress?.filter(vp => vp.concluido)?.length || 0;
      const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
      const isCompleted = completedVideos === totalVideos && totalVideos > 0;
      const lastVideoCompleted = isCompleted && totalVideos > 0;

      setProgress({
        totalVideos,
        completedVideos,
        progressPercentage,
        isCompleted,
        lastVideoCompleted
      });

    } catch (err) {
      console.error('Erro ao carregar progresso do curso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [courseId, userProfile?.id]);

  // Verificar se o curso foi concluído recentemente
  const checkRecentCompletion = useCallback(async () => {
    if (!courseId || !userProfile?.id) return false;

    try {
      // Verificar se há um registro de conclusão recente
      const { data: completionRecord, error } = await supabase
        .from('progresso_usuario')
        .select('data_conclusao')
        .eq('usuario_id', userProfile.id)
        .eq('curso_id', courseId)
        .eq('status', 'concluido')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar conclusão:', error);
        return false;
      }

      return !!completionRecord;
    } catch (err) {
      console.error('Erro ao verificar conclusão recente:', err);
      return false;
    }
  }, [courseId, userProfile?.id]);

  // Marcar curso como concluído
  const markCourseAsCompleted = useCallback(async () => {
    if (!courseId || !userProfile?.id) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('progresso_usuario')
        .upsert({
          usuario_id: userProfile.id,
          curso_id: courseId,
          status: 'concluido',
          percentual_concluido: 100,
          data_conclusao: new Date().toISOString()
        });

      if (error) {
        throw new Error('Erro ao marcar curso como concluído');
      }

      // Recarregar progresso
      await loadCourseProgress();

      return { error: null };
    } catch (err) {
      console.error('Erro ao marcar curso como concluído:', err);
      return { error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  }, [courseId, userProfile?.id, loadCourseProgress]);

  useEffect(() => {
    loadCourseProgress();
  }, [loadCourseProgress]);

  return {
    progress,
    loading,
    error,
    loadCourseProgress,
    checkRecentCompletion,
    markCourseAsCompleted
  };
} 