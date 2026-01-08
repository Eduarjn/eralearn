import { useEffect, useState } from 'react';

/**
 * Hook simplificado para gerenciar o tema ERA
 */
export function useEraTheme() {
  const [isEraTheme, setIsEraTheme] = useState(false);

  useEffect(() => {
    const shouldActivateEra = 
      import.meta.env.VITE_THEME === 'era' ||
      import.meta.env.VITE_ERA_THEME === 'true' ||
      localStorage.getItem('era-theme') === 'true' ||
      window.location.hostname.includes('era') ||
      window.location.search.includes('theme=era');

    setIsEraTheme(shouldActivateEra);

    const htmlElement = document.documentElement;
    if (shouldActivateEra) {
      htmlElement.classList.add('theme-era');
    } else {
      htmlElement.classList.remove('theme-era');
    }

    if (shouldActivateEra) {
      localStorage.setItem('era-theme', 'true');
    } else {
      localStorage.removeItem('era-theme');
    }
  }, []);

  const toggleEraTheme = () => {
    const newThemeState = !isEraTheme;
    setIsEraTheme(newThemeState);
    
    const htmlElement = document.documentElement;
    if (newThemeState) {
      htmlElement.classList.add('theme-era');
      localStorage.setItem('era-theme', 'true');
    } else {
      htmlElement.classList.remove('theme-era');
      localStorage.removeItem('era-theme');
    }
  };

  return {
    isEraTheme,
    toggleEraTheme,
  };
}

/**
 * Componente simples para alternar o tema ERA
 */
export function EraThemeToggle() {
  const { isEraTheme, toggleEraTheme } = useEraTheme();

  const buttonClasses = isEraTheme 
    ? 'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90'
    : 'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <button
      onClick={toggleEraTheme}
      className={buttonClasses}
      title={isEraTheme ? 'Desativar tema ERA' : 'Ativar tema ERA'}
    >
      {isEraTheme ? '🎨 ERA' : '🎨 Padrão'}
    </button>
  );
}