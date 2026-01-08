import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './logo-styles.css'

// Inicializar tema ERA antes de renderizar a aplicação
function initializeEraTheme() {
  const shouldActivateEra = 
    import.meta.env.VITE_THEME === 'era' ||
    import.meta.env.VITE_ERA_THEME === 'true' ||
    localStorage.getItem('era-theme') === 'true' ||
    window.location.hostname.includes('era') ||
    window.location.search.includes('theme=era');

  if (shouldActivateEra) {
    document.documentElement.classList.add('theme-era');
    console.log('🎨 Tema ERA inicializado');
  }
}

// Inicializar tema
initializeEraTheme();

createRoot(document.getElementById("root")!).render(<App />);
