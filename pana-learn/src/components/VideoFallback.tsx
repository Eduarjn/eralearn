import React from 'react';
import { Play, AlertCircle, RefreshCw, Download } from 'lucide-react';

interface VideoFallbackProps {
  title: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

export const VideoFallback: React.FC<VideoFallbackProps> = ({ 
  title, 
  onRetry, 
  onContactSupport 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-900 rounded-lg border border-gray-700 p-8">
      <div className="text-center max-w-md">
        {/* Ícone de alerta */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
        </div>

        {/* Título do erro */}
        <h3 className="text-xl font-semibold text-white mb-4">
          Vídeo Temporariamente Indisponível
        </h3>

        {/* Descrição */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          O vídeo <strong>"{title}"</strong> não está disponível no momento. 
          Isso pode acontecer por manutenção ou problemas técnicos temporários.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </button>
          )}
          
          <button
            onClick={() => window.open('mailto:suporte@eralearn.com?subject=Problema com vídeo&body=Olá, estou com problema para acessar o vídeo: ' + encodeURIComponent(title), '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Contatar Suporte
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-200 mb-2">
            💡 Dicas para resolver:
          </h4>
          <ul className="text-sm text-gray-400 space-y-1 text-left">
            <li>• Verifique sua conexão com a internet</li>
            <li>• Tente recarregar a página</li>
            <li>• Limpe o cache do navegador</li>
            <li>• Entre em contato com o suporte se o problema persistir</li>
          </ul>
        </div>

        {/* Status do sistema */}
        <div className="mt-4 text-xs text-gray-500">
          Status: Sistema funcionando normalmente
        </div>
      </div>
    </div>
  );
};

export default VideoFallback;














