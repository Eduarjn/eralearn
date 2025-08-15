import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useBranding } from '@/context/BrandingContext';

interface ERALogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  position?: 'header-left' | 'header-right' | 'footer-left' | 'footer-right';
  showFallback?: boolean;
}

export const ERALogo: React.FC<ERALogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'full',
  position = 'header-left',
  showFallback = true
}) => {
  const { isMobile, screenWidth } = useMobile();
  const { branding } = useBranding();

  // Tamanhos responsivos seguindo especificações
  const sizeClasses = {
    sm: 'h-6 w-auto', // 24px
    md: 'h-8 w-auto', // 32px
    lg: 'h-10 w-auto', // 40px desktop
    xl: 'h-12 w-auto'  // 48px
  };

  // Responsividade: 32px em telas ≤768px, 40px em desktop
  const responsiveSize = isMobile ? 'h-8' : 'h-10';
  
  // Margens baseadas na posição
  const positionClasses = {
    'header-left': 'm-2', // 8px margin
    'header-right': 'm-2', // 8px margin
    'footer-left': 'm-3', // 12px margin
    'footer-right': 'm-3' // 12px margin
  };

  // Fallback text com fonte corporativa
  const fallbackText = (
    <span className="font-bold text-gray-900 dark:text-white text-sm">
      ERA Learn
    </span>
  );

  // Componente de erro para fallback
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (showFallback) {
      const img = event.target as HTMLImageElement;
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) {
        // Adicionar o texto de fallback
        const fallbackElement = document.createElement('span');
        fallbackElement.className = 'font-bold text-gray-900 dark:text-white text-sm';
        fallbackElement.textContent = 'ERA Learn';
        parent.appendChild(fallbackElement);
      }
    }
  };

  // Logo principal da ERA Learn
  const logoSrc = branding.logo_url || '/logotipoeralearn.png';

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${positionClasses[position]} ${className}`}>
        <img 
          src={logoSrc}
          alt="Logotipo ERA Learn"
          className={`${responsiveSize} w-auto object-contain`}
          onError={handleImageError}
        />
        {showFallback && (
          <div className="sr-only">
            {fallbackText}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${positionClasses[position]} ${className}`}>
        {fallbackText}
      </div>
    );
  }

  // Variante completa (padrão)
  return (
    <div className={`flex items-center ${positionClasses[position]} ${className}`}>
      <img 
        src={logoSrc}
        alt="Logotipo ERA Learn"
        className={`${responsiveSize} w-auto object-contain`}
        onError={handleImageError}
      />
      {showFallback && (
        <div className="sr-only">
          {fallbackText}
        </div>
      )}
    </div>
  );
};

export default ERALogo; 