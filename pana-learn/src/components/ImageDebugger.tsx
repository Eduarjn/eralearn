import React, { useState, useEffect } from 'react';
import { resolveImagePath, testImageLoad, imageFallbacks } from '@/utils/imageUtils';

interface ImageDebuggerProps {
  imagePath: string;
  fallbacks?: string[];
  className?: string;
  alt?: string;
}

export const ImageDebugger: React.FC<ImageDebuggerProps> = ({ 
  imagePath, 
  fallbacks = [], 
  className = '',
  alt = 'Debug Image'
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const testImage = async () => {
      setIsLoading(true);
      setHasError(false);
      
      const resolvedPath = resolveImagePath(imagePath);
      setCurrentSrc(resolvedPath);
      setDebugInfo(`Testando: ${resolvedPath}`);
      
      const success = await testImageLoad(resolvedPath);
      
      if (success) {
        setIsLoading(false);
        setDebugInfo(`✅ Carregado: ${resolvedPath}`);
      } else {
        // Tentar fallbacks
        for (const fallback of fallbacks) {
          const fallbackPath = resolveImagePath(fallback);
          setDebugInfo(`🔄 Tentando fallback: ${fallbackPath}`);
          
          const fallbackSuccess = await testImageLoad(fallbackPath);
          if (fallbackSuccess) {
            setCurrentSrc(fallbackPath);
            setIsLoading(false);
            setDebugInfo(`✅ Carregado com fallback: ${fallbackPath}`);
            return;
          }
        }
        
        setHasError(true);
        setDebugInfo(`❌ Falha: ${resolvedPath} e todos os fallbacks`);
      }
    };

    testImage();
  }, [imagePath, fallbacks]);

  return (
    <div className={`image-debugger ${className}`}>
      <div className="debug-info text-xs text-gray-600 mb-2">
        {debugInfo}
      </div>
      
      {isLoading && (
        <div className="loading text-sm text-blue-600">
          Carregando imagem...
        </div>
      )}
      
      {hasError && (
        <div className="error text-sm text-red-600">
          Erro ao carregar imagem
        </div>
      )}
      
      {!isLoading && !hasError && (
        <img 
          src={currentSrc} 
          alt={alt}
          className="max-w-full h-auto"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};
