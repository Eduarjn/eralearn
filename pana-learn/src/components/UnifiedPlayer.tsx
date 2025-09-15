'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoSource {
  kind: 'internal' | 'youtube';
  url: string;
  mime?: string;
  title?: string;
  id?: string;
}

interface UnifiedPlayerProps {
  source: VideoSource;
  className?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  controls?: boolean;
}

export default function UnifiedPlayer({ 
  source, 
  className = '', 
  onProgress,
  onEnded,
  autoPlay = false,
  controls = true
}: UnifiedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(controls);
  const [isLoading, setIsLoading] = useState(true);

  // YouTube Player
  useEffect(() => {
    if (source.kind === 'youtube' && youtubeRef.current) {
      // Limpar conteúdo anterior
      youtubeRef.current.innerHTML = '';

      // Criar iframe do YouTube
      const iframe = document.createElement('iframe');
      iframe.src = source.url;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.borderRadius = '0.75rem';
      iframe.style.border = 'none';

      youtubeRef.current.appendChild(iframe);
      setIsLoading(false);

      // YouTube não permite controle direto via JavaScript por questões de segurança
      // O player será controlado pelos controles nativos do YouTube
    }
  }, [source]);

  // Video HTML5 Player
  useEffect(() => {
    if (source.kind === 'internal' && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        onProgress?.(video.currentTime, video.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        onEnded?.();
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [source, onProgress, onEnded]);

  const togglePlay = () => {
    if (source.kind === 'internal' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    // YouTube: controles nativos
  };

  const toggleMute = () => {
    if (source.kind === 'internal' && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    // YouTube: controles nativos
  };

  const handleVolumeChange = (newVolume: number) => {
    if (source.kind === 'internal' && videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
    // YouTube: controles nativos
  };

  const handleSeek = (time: number) => {
    if (source.kind === 'internal' && videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    // YouTube: controles nativos
  };

  const toggleFullscreen = () => {
    if (source.kind === 'internal' && videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
    // YouTube: controles nativos
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (source.kind === 'youtube') {
    return (
      <div className={`relative w-full bg-black rounded-xl overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white">Carregando vídeo...</div>
          </div>
        )}
        <div 
          ref={youtubeRef} 
          className="w-full aspect-video"
          style={{ minHeight: '400px' }}
        />
        {source.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-medium">{source.title}</h3>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full bg-black rounded-xl overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-white">Carregando vídeo...</div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={source.url}
        className="w-full h-full"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
      />

      {/* Controles customizados para vídeos internos */}
      {showControls && source.kind === 'internal' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
          {/* Barra de progresso */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
              }}
            />
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {source.title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h3 className="text-white font-medium">{source.title}</h3>
        </div>
      )}
    </div>
  );
}










