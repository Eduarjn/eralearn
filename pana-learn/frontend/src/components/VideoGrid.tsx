import React from 'react';
import { VideoFile } from '@/hooks/useVideos';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: VideoFile[];
  onSelect: (video: VideoFile) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onClick={() => onSelect(video)} />
      ))}
    </div>
  );
}; 