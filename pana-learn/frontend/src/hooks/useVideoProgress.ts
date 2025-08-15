import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVideoProgress(userId: string, videoId: string, cursoId?: string, moduloId?: string) {
  const [progress, setProgress] = useState<{ resumeTime: number; watched: boolean }>({ resumeTime: 0, watched: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !videoId) return;
    setLoading(true);
    supabase
      .from("video_progress")
      .select("resume_time, watched")
      .eq("user_id", userId)
      .eq("video_id", videoId)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          setError(error.message);
        } else if (data) {
          setProgress({ resumeTime: data.resume_time || 0, watched: !!data.watched });
        }
        setLoading(false);
      });
  }, [userId, videoId]);

  const saveProgress = useCallback(async (currentTime: number, watched?: boolean) => {
    if (!userId || !videoId) return;
    setLoading(true);
    await supabase.from("video_progress").upsert({
      user_id: userId,
      video_id: videoId,
      resume_time: currentTime,
      watched: watched ?? false,
    });

    // Se marcou como assistido, atualiza progresso_usuario
    if (watched && cursoId) {
      await supabase.from("progresso_usuario").upsert({
        usuario_id: userId,
        curso_id: cursoId,
        modulo_id: moduloId,
        percentual_concluido: 100,
        status: 'concluido',
        data_conclusao: new Date().toISOString(),
      });
    }

    setProgress({ resumeTime: currentTime, watched: watched ?? false });
    setLoading(false);
  }, [userId, videoId, cursoId, moduloId]);

  return { progress, saveProgress, loading, error };
} 