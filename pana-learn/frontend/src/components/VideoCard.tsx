import React from 'react';
import { VideoFile } from '@/hooks/useVideos';

interface VideoCardProps {
  video: VideoFile;
  onClick: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-md cursor-pointer overflow-hidden transition hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 flex items-center justify-center">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">Sem thumbnail</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>
        <div className="text-sm text-gray-500">{formatDuration(video.duration)}</div>
      </div>
    </div>
  );
}; 