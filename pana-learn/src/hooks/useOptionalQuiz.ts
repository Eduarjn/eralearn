import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OptionalQuizState {
  shouldShowQuiz: boolean;
  courseCompleted: boolean;
  quizAvailable: boolean;
  quizAlreadyCompleted: boolean;
}

export function useOptionalQuiz(courseId: string) {
  const { userProfile } = useAuth();
  const [quizState, setQuizState] = useState<OptionalQuizState>({
    shouldShowQuiz: false,
    courseCompleted: false,
    quizAvailable: false,
    quizAlreadyCompleted: false
  });
  const [loading, setLoading] = useState(false);

  // Verificar se curso foi concluído e se quiz já foi completado
  const checkCourseCompletion = useCallback(async () => {
    if (!courseId || !userProfile?.id) return;

    try {
      setLoading(true);

      // Buscar vídeos do curso
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id')
        .eq('curso_id', courseId);

      if (videosError || !videos || videos.length === 0) {
        setQuizState(prev => ({ ...prev, quizAvailable: false }));
        return;
      }

      // Buscar progresso dos vídeos
      const videoIds = videos.map(v => v.id);
      const { data: progress, error: progressError } = await supabase
        .from('video_progress')
        .select('video_id, concluido, percentual_assistido')
        .eq('user_id', userProfile.id)
        .in('video_id', videoIds);

      if (progressError) {
        console.error('Erro ao verificar progresso:', progressError);
        return;
      }

      // Verificar se todos os vídeos foram concluídos
      const totalVideos = videos.length;
      const completedVideos = progress?.filter(p => p.concluido)?.length || 0;
      const courseCompleted = completedVideos === totalVideos && totalVideos > 0;

      // Verificar se existe quiz para este curso usando o novo mapeamento
      let quizAvailable = false;
      let quizAlreadyCompleted = false;
      let quizId: string | null = null;
      
      // Primeiro, tentar usar o mapeamento específico por curso
      let mappingData = null;
      try {
        const { data: mappingResult } = await supabase
          .from('curso_quiz_mapping')
          .select('quiz_id')
          .eq('curso_id', courseId)
          .maybeSingle();

        mappingData = mappingResult;
      } catch (mappingErr) {
        console.error('Erro ao buscar mapeamento de quiz:', mappingErr);
      }

      if (mappingData?.quiz_id) {
        // Usar o quiz mapeado diretamente
        let quizData = null;
        try {
          const { data: quizResult } = await supabase
            .from('quizzes')
            .select('id')
            .eq('id', mappingData.quiz_id)
            .eq('ativo', true)
            .maybeSingle();

          quizData = quizResult;
        } catch (quizErr) {
          console.error('Erro ao buscar quiz mapeado:', quizErr);
        }

        quizAvailable = !!quizData;
        quizId = quizData?.id || null;
      } else {
        // Fallback: usar a categoria do curso (método antigo)
        let courseData = null;
        try {
          const { data: courseResult } = await supabase
            .from('cursos')
            .select('categoria')
            .eq('id', courseId)
            .maybeSingle();

          courseData = courseResult;
        } catch (courseErr) {
          console.error('Erro ao buscar dados do curso:', courseErr);
        }

        if (courseData?.categoria) {
          let quizData = null;
          try {
            const { data: quizResult } = await supabase
              .from('quizzes')
              .select('id')
              .eq('categoria', courseData.categoria)
              .eq('ativo', true)
              .maybeSingle();

            quizData = quizResult;
          } catch (quizErr) {
            console.error('Erro ao buscar quiz por categoria:', quizErr);
          }

          quizAvailable = !!quizData;
          quizId = quizData?.id || null;
        }
      }

      // Verificar se o usuário já completou o quiz para este curso
      if (quizId) {
        let quizProgress = null;
        try {
          const { data: progressResult } = await supabase
            .from('progresso_quiz')
            .select('id, aprovado')
            .eq('usuario_id', userProfile.id)
            .eq('quiz_id', quizId)
            .maybeSingle();

          quizProgress = progressResult;
        } catch (progressErr) {
          console.error('Erro ao buscar progresso do quiz:', progressErr);
        }

        quizAlreadyCompleted = !!quizProgress;
      }

      // Verificar se já existe certificado para este curso
      let existingCertificate = null;
      try {
        const { data: certResult } = await supabase
          .from('certificados')
          .select('id')
          .eq('usuario_id', userProfile.id)
          .eq('curso_id', courseId)
          .maybeSingle();

        existingCertificate = certResult;
      } catch (certErr) {
        console.error('Erro ao buscar certificado existente:', certErr);
      }

      // Quiz deve aparecer apenas se:
      // 1. Curso foi concluído
      // 2. Quiz está disponível
      // 3. Quiz ainda não foi completado
      // 4. Não existe certificado ainda
      const shouldShowQuiz = courseCompleted && 
                           quizAvailable && 
                           !quizAlreadyCompleted && 
                           !existingCertificate;

      console.log('🎯 Verificação de Quiz:', {
        courseCompleted,
        quizAvailable,
        quizAlreadyCompleted,
        hasCertificate: !!existingCertificate,
        shouldShowQuiz
      });

      setQuizState({
        shouldShowQuiz,
        courseCompleted,
        quizAvailable,
        quizAlreadyCompleted
      });

    } catch (error) {
      console.error('Erro ao verificar conclusão do curso:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, userProfile?.id]);

  useEffect(() => {
    checkCourseCompletion();
  }, [checkCourseCompletion]);

  return {
    quizState,
    loading,
    checkCourseCompletion
  };
} 