import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VideoFile {
  id: string;
  title: string;
  path: string;
  thumbnailUrl: string;
  duration: number;
  url: string;
}

export function useVideos() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from("training-videos")
        .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const files = data?.filter(file => file.name.endsWith(".mp4") || file.name.endsWith(".webm") || file.name.endsWith(".mov")) || [];
      const videos = files.map(file => {
        const { data } = supabase.storage.from("training-videos").getPublicUrl(file.name);
        return {
          id: file.id || file.name,
          title: file.name.replace(/\.[^/.]+$/, ""),
          path: file.name,
          thumbnailUrl: '', // Pode ser ajustado se houver thumbnails
          duration: 0,
          url: data.publicUrl,
        };
      });
      setVideos(videos);
      setLoading(false);
    }
    fetchVideos();
  }, []);

  return { videos, loading, error };
} 