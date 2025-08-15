import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
}

const YouTubePlayer: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      try {
        const channelId = 'minhaeravideos';
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&part=snippet&order=date&type=video&maxResults=10&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos');
        }

        const data = await response.json();
        const formattedVideos = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails
        }));

        setVideos(formattedVideos);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchYouTubeVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="h-6 w-6 text-gray-500" />
        <h2 className="text-2xl font-semibold text-gray-900">Vídeos do Canal</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <iframe
              title={video.title}
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${video.id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-t-lg"
            />
            <div className="p-3">
              <p className="text-sm text-gray-600 line-clamp-2">{video.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubePlayer;
