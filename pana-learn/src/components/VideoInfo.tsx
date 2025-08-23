import React from 'react';
import { Clock, CheckCircle, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VideoInfoProps {
  titulo: string;
  descricao?: string;
  duracao?: number;
  progresso?: {
    percentual_assistido: number;
    concluido: boolean;
  };
  className?: string;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({
  titulo,
  descricao,
  duracao,
  progresso,
  className = ''
}) => {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return 'Duração não definida';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    if (progresso?.concluido) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (progresso && progresso.percentual_assistido > 0) {
      return <Play className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (progresso?.concluido) {
      return 'Concluído';
    }
    if (progresso && progresso.percentual_assistido > 0) {
      return 'Em andamento';
    }
    return 'Não iniciado';
  };

  const getStatusColor = () => {
    if (progresso?.concluido) {
      return 'bg-green-100 text-green-800';
    }
    if (progresso && progresso.percentual_assistido > 0) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Título do Vídeo */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {titulo}
        </h2>
        {descricao && (
          <p className="text-gray-600 text-base leading-relaxed">
            {descricao}
          </p>
        )}
      </div>
      
      {/* Status e Informações do Vídeo */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Duração */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatDuration(duracao)}
            </span>
          </div>
          
          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={`text-xs ${getStatusColor()}`}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        
        {/* Progresso */}
        {progresso && progresso.percentual_assistido > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {Math.round(progresso.percentual_assistido)}%
            </span>
            <div className="w-16">
              <Progress value={progresso.percentual_assistido} className="h-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
