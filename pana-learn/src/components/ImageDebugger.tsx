import React, { useState, useEffect } from 'react';
import { resolveImagePath, testImageLoad } from '@/utils/imageUtils';

interface ImageDebuggerProps {
  imagePath: string;
  alt?: string;
  className?: string;
  fallbackPath?: string;
}

export const ImageDebugger: React.FC<ImageDebuggerProps> = ({
  imagePath,
  alt = 'Debug Image',
  className = '',
  fallbackPath = '/logotipoeralearn.png'
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const debugImage = async () => {
      setIsLoading(true);
      setHasError(false);
      
      // Informações de debug
      const debug = {
        originalPath: imagePath,
        resolvedPath: resolveImagePath(imagePath),
        fallbackPath: resolveImagePath(fallbackPath),
        hostname: window.location.hostname,
        origin: window.location.origin,
        isVercel: window.location.hostname.includes('vercel.app'),
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(debug);
      console.log('🔍 ImageDebugger - Debug Info:', debug);
      
      // Testar carregamento da imagem principal
      const mainImageLoads = await testImageLoad(debug.resolvedPath);
      
      if (mainImageLoads) {
        console.log('✅ Imagem principal carregou:', debug.resolvedPath);
        setCurrentSrc(debug.resolvedPath);
        setIsLoading(false);
      } else {
        console.error('❌ Imagem principal falhou:', debug.resolvedPath);
        
        // Testar fallback
        const fallbackLoads = await testImageLoad(debug.fallbackPath);
        
        if (fallbackLoads) {
          console.log('✅ Fallback carregou:', debug.fallbackPath);
          setCurrentSrc(debug.fallbackPath);
          setIsLoading(false);
        } else {
          console.error('❌ Fallback também falhou:', debug.fallbackPath);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    debugImage();
  }, [imagePath, fallbackPath]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Erro no carregamento da imagem:', {
      currentSrc: e.currentTarget.src,
      originalPath: imagePath,
      debugInfo
    });
    
    if (e.currentTarget.src !== resolveImagePath(fallbackPath)) {
      console.log('🔄 Tentando fallback...');
      e.currentTarget.src = resolveImagePath(fallbackPath);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('✅ Imagem carregada com sucesso:', e.currentTarget.src);
    setIsLoading(false);
    setHasError(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando imagem...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-red-100 border border-red-300 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-600 text-sm font-medium">Erro ao carregar imagem</p>
          <p className="text-red-500 text-xs mt-1">{imagePath}</p>
          <details className="mt-2 text-left">
            <summary className="text-xs text-red-500 cursor-pointer">Debug Info</summary>
            <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Debug overlay (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1 rounded">
          <div>✅ Carregada</div>
          <div className="truncate max-w-32">{currentSrc}</div>
        </div>
      )}
    </div>
  );
};
