import { useEffect, useState } from 'react';

/**
 * Hook para gerenciar o tema ERA
 * Permite ativação condicional baseada em variáveis de ambiente ou configuração
 */
export function useEraTheme() {
    const [isEraTheme, setIsEraTheme] = useState(false);

    useEffect(() => {
        // Verificar se o tema ERA deve ser ativado
        const shouldActivateEra =
            import.meta.env.VITE_THEME === 'era' ||
            import.meta.env.VITE_ERA_THEME === 'true' ||
            localStorage.getItem('era-theme') === 'true' ||
            window.location.hostname.includes('era') ||
            window.location.search.includes('theme=era');

        setIsEraTheme(shouldActivateEra);

        // Aplicar ou remover a classe do tema no HTML
        const htmlElement = document.documentElement;
        if (shouldActivateEra) {
            htmlElement.classList.add('theme-era');
            console.log('Tema ERA ativado');
        } else {
            htmlElement.classList.remove('theme-era');
            console.log('Tema padrão ativo');
        }

        // Salvar preferência no localStorage
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
            console.log('Tema ERA ativado manualmente');
        } else {
            htmlElement.classList.remove('theme-era');
            localStorage.removeItem('era-theme');
            console.log('Tema padrão ativado manualmente');
        }
    };

    return {
        isEraTheme,
        toggleEraTheme,
        // Utilitários para classes condicionais
        eraClass: (eraClass: string, defaultClass: string = '') =>
            isEraTheme ? eraClass : defaultClass,
        // Utilitário para aplicar classes condicionais
        conditionalClass: (eraClass: string, fallbackClass: string = '') =>
            isEraTheme ? `${eraClass} ${fallbackClass}`.trim() : fallbackClass,
    };
}

/**
 * Hook para obter classes de tema condicionais
 * Útil para aplicar estilos específicos do tema ERA
 */
export function useEraClasses() {
    const { isEraTheme } = useEraTheme();

    return {
        // Classes de fonte
        fontSans: isEraTheme ? 'font-sans' : 'font-sans',
        fontHeading: isEraTheme ? 'font-heading' : 'font-sans',

        // Classes de cor
        textPrimary: isEraTheme ? 'text-brand-dark' : 'text-gray-900',
        textSecondary: isEraTheme ? 'text-brand-muted' : 'text-gray-600',
        bgPrimary: isEraTheme ? 'bg-brand-primary' : 'bg-blue-600',
        bgSecondary: isEraTheme ? 'bg-brand-sand' : 'bg-gray-100',

        // Classes de botão
        buttonPrimary: isEraTheme
            ? 'bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90'
            : 'bg-blue-600 text-white hover:bg-blue-700',

        // Classes de card
        cardBackground: isEraTheme ? 'bg-white border-brand-muted' : 'bg-white border-gray-200',

        // Classes de input
        inputStyle: isEraTheme
            ? 'border-brand-muted focus:border-brand-primary focus:ring-brand-primary'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    };
}

/**
 * Componente para alternar o tema ERA
 * Pode ser usado em qualquer lugar da aplicação
 */
export function EraThemeToggle() {
    const { isEraTheme, toggleEraTheme } = useEraTheme();

    const buttonClasses = isEraTheme
        ? 'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90'
        : 'px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300';

    const buttonText = isEraTheme ? 'ERA' : 'Padrao';
    const buttonTitle = isEraTheme ? 'Desativar tema ERA' : 'Ativar tema ERA';

    return (
        <button
            onClick={toggleEraTheme}
            className={buttonClasses}
            title={buttonTitle}
        >
            {buttonText}
        </button>
    );
}
