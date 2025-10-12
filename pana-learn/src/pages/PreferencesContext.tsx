import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'pt-BR' | 'en-US' | 'es';
export type FontSize = 'small' | 'medium' | 'large';

interface Preferences {
    theme: Theme;
    language: Language;
    fontSize: FontSize;
    keyboardShortcuts: boolean;
}

interface PreferencesContextType extends Preferences {
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: Language) => void;
    setFontSize: (size: FontSize) => void;
    setKeyboardShortcuts: (enabled: boolean) => void;
}

const defaultPreferences: Preferences = {
    theme: 'light',
    language: 'pt-BR',
    fontSize: 'medium',
    keyboardShortcuts: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(defaultPreferences.theme);
    const [language, setLanguageState] = useState<Language>(defaultPreferences.language);
    const [fontSize, setFontSizeState] = useState<FontSize>(defaultPreferences.fontSize);
    const [keyboardShortcuts, setKeyboardShortcutsState] = useState<boolean>(defaultPreferences.keyboardShortcuts);

    // Carregar preferências do localStorage
    useEffect(() => {
        const stored = localStorage.getItem('pana-learn-preferences');
        if (stored) {
            try {
                const prefs = JSON.parse(stored);
                if (prefs.theme) setThemeState(prefs.theme);
                if (prefs.language) setLanguageState(prefs.language);
                if (prefs.fontSize) setFontSizeState(prefs.fontSize);
                if (typeof prefs.keyboardShortcuts === 'boolean') setKeyboardShortcutsState(prefs.keyboardShortcuts);
            } catch {}
        }
    }, []);

    // Persistir preferências no localStorage
    useEffect(() => {
        localStorage.setItem('pana-learn-preferences', JSON.stringify({ theme, language, fontSize, keyboardShortcuts }));
    }, [theme, language, fontSize, keyboardShortcuts]);

    // Aplicar tema (dark/light)
    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [theme]);

    // Aplicar tamanho da fonte global
    useEffect(() => {
        const html = document.documentElement;
        if (fontSize === 'small') html.style.fontSize = '14px';
        else if (fontSize === 'large') html.style.fontSize = '18px';
        else html.style.fontSize = '16px';
    }, [fontSize]);

    // (Opcional) Aplicar idioma dinamicamente via i18n aqui
    // (Opcional) Ativar/desativar listeners de atalhos de teclado globalmente

    const setTheme = (t: Theme) => setThemeState(t);
    const setLanguage = (l: Language) => setLanguageState(l);
    const setFontSize = (f: FontSize) => setFontSizeState(f);
    const setKeyboardShortcuts = (v: boolean) => setKeyboardShortcutsState(v);

    return (
        <PreferencesContext.Provider value={{ theme, language, fontSize, keyboardShortcuts, setTheme, setLanguage, setFontSize, setKeyboardShortcuts }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
    return ctx;
}