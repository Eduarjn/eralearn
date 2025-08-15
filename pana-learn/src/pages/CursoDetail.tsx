import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  titulo: string;
  url_video: string;
  thumbnail_url: string;
  duracao: number;
  modulo_id: string;
}

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  if (!src) return <div className="bg-black w-full aspect-video flex items-center justify-center text-white">Vídeo não disponível</div>;
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  return isYouTube ? (
    <iframe
      className="w-full aspect-video"
      src={src.startsWith('http') ? src : `https://www.youtube.com/embed/${src}`}
      title="Video Player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <video className="w-full aspect-video" src={src} controls />
  );
};

const VideoSidebarItem: React.FC<{
  video: Video;
  active: boolean;
  onClick: () => void;
}> = ({ video, active, onClick }) => (
  <div
    className={`flex items-center p-2 mb-2 rounded hover:bg-gray-100 cursor-pointer ${active ? 'bg-gray-200 font-semibold' : ''}`}
    onClick={onClick}
  >
    <img src={video.thumbnail_url} alt="" className="w-12 h-8 object-cover mr-2 rounded" />
    <div>
      <p className="text-sm">{video.titulo}</p>
      <p className="text-xs text-gray-500">{video.duracao} min</p>
    </div>
  </div>
);

const groupByModulo = (videos: Video[]) => {
  const map: Record<string, Video[]> = {};
  videos.forEach((v) => {
    if (!map[v.modulo_id]) map[v.modulo_id] = [];
    map[v.modulo_id].push(v);
  });
  return map;
};

const CursoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      // Buscar módulos do curso
      const { data: modulos, error: modError } = await supabase
        .from('modulos')
        .select('id, video_id')
        .eq('curso_id', id);
      console.log('modulos:', modulos, modError);
      const videoIds = (modulos || []).map((m: { video_id: string }) => m.video_id).filter(Boolean);
      console.log('videoIds:', videoIds);
      let videosData: Video[] = [];
      if (videoIds.length > 0) {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds);
        console.log('videos:', data, error);
        videosData = data || [];
      }
      setVideos(videosData);
      setLoading(false);
    };
    fetchVideos();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando vídeos...</div>;
  if (!videos.length) return <div className="flex items-center justify-center h-screen">Nenhum vídeo encontrado para este curso.</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Coluna principal: player */}
      <div className="w-full lg:w-3/4 p-4 flex flex-col">
        <VideoPlayer src={videos[selectedIndex]?.url_video} />
        <h2 className="mt-4 text-xl font-bold">{videos[selectedIndex]?.titulo}</h2>
      </div>
      {/* Sidebar de vídeos */}
      <aside className="w-full lg:w-1/4 p-4 overflow-y-auto bg-white border-l h-full">
        {videos.map((v, i) => (
          <VideoSidebarItem
            key={v.id}
            video={v}
            active={i === selectedIndex}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </aside>
    </div>
  );
};

export default CursoDetail; 