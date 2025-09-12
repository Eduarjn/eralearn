import React from 'react';
import { EraThemeToggle, useEraTheme } from '@/hooks/useEraThemeSimple';
import { EraThemedButton } from './EraThemedButton';
import { EraThemedCard } from './EraThemedCard';
import { EraThemedInput } from './EraThemedInput';

/**
 * Componente de demonstração do sistema de temas ERA
 * Mostra como os componentes se adaptam ao tema ativo
 */
export function EraThemeDemo() {
  const { isEraTheme } = useEraTheme();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🎨 Sistema de Temas ERA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstração do sistema de temas opt-in que permite alternar entre o visual padrão 
            e o tema ERA sem quebrar funcionalidades existentes.
          </p>
          
          <div className="flex justify-center">
            <EraThemeToggle />
          </div>
          
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Tema Ativo: {isEraTheme ? '🎨 ERA' : '📱 Padrão'}
          </div>
        </div>

        {/* Paleta de Cores */}
        <EraThemedCard
          title="Paleta de Cores"
          description="Cores específicas do tema ERA"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-full h-16 rounded-lg bg-brand-primary flex items-center justify-center text-brand-primary-foreground font-bold">
                Primary
              </div>
              <p className="text-xs text-gray-600">#CFFF00</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-full h-16 rounded-lg bg-brand-dark flex items-center justify-center text-brand-dark-foreground font-bold">
                Dark
              </div>
              <p className="text-xs text-gray-600">#2B363D</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-full h-16 rounded-lg bg-brand-muted flex items-center justify-center text-brand-muted-foreground font-bold">
                Muted
              </div>
              <p className="text-xs text-gray-600">#9DB6C3</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-full h-16 rounded-lg bg-brand-sand flex items-center justify-center text-brand-sand-foreground font-bold">
                Sand
              </div>
              <p className="text-xs text-gray-600">#CCC4A5</p>
            </div>
          </div>
        </EraThemedCard>

        {/* Tipografia */}
        <EraThemedCard
          title="Tipografia"
          description="Fontes Inter (padrão) e Manrope (títulos ERA)"
        >
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-brand-dark font-heading">
                Título Principal (Manrope)
              </h1>
              <p className="text-sm text-gray-600 mt-1">Fonte: Manrope (tema ERA) / Inter (padrão)</p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-brand-dark font-heading">
                Título Secundário
              </h2>
              <p className="text-sm text-gray-600 mt-1">Fonte: Manrope (tema ERA) / Inter (padrão)</p>
            </div>
            
            <div>
              <p className="text-base text-brand-muted font-sans">
                Texto do corpo em Inter. Esta é uma demonstração de como o texto se adapta 
                ao tema ativo, mantendo a legibilidade e o contraste adequados.
              </p>
              <p className="text-sm text-gray-600 mt-1">Fonte: Inter (sempre)</p>
            </div>
          </div>
        </EraThemedCard>

        {/* Componentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Botões */}
          <EraThemedCard
            title="Botões"
            description="Diferentes variantes de botões"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <EraThemedButton variant="primary">
                  Primário
                </EraThemedButton>
                <EraThemedButton variant="secondary">
                  Secundário
                </EraThemedButton>
                <EraThemedButton variant="outline">
                  Outline
                </EraThemedButton>
                <EraThemedButton variant="ghost">
                  Ghost
                </EraThemedButton>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Tema ERA:</strong> Cores vibrantes, fonte Manrope</p>
                <p><strong>Tema Padrão:</strong> Cores originais da plataforma</p>
              </div>
            </div>
          </EraThemedCard>

          {/* Inputs */}
          <EraThemedCard
            title="Inputs"
            description="Campos de entrada com tema"
          >
            <div className="space-y-4">
              <EraThemedInput
                label="Nome"
                placeholder="Digite seu nome"
                helperText="Campo obrigatório"
              />
              
              <EraThemedInput
                label="Email"
                type="email"
                placeholder="seu@email.com"
                helperText="Usaremos para contato"
              />
              
              <div className="text-sm text-gray-600">
                <p><strong>Tema ERA:</strong> Bordas em brand-muted, focus em brand-primary</p>
                <p><strong>Tema Padrão:</strong> Estilo original da plataforma</p>
              </div>
            </div>
          </EraThemedCard>
        </div>

        {/* Instruções de Uso */}
        <EraThemedCard
          title="Como Usar o Sistema de Temas"
          description="Instruções para desenvolvedores"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-brand-dark mb-2">1. Ativação do Tema</h4>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                <p>// Variáveis de ambiente</p>
                <p>VITE_THEME=era</p>
                <p>VITE_ERA_THEME=true</p>
                <p></p>
                <p>// URL com parâmetro</p>
                <p>?theme=era</p>
                <p></p>
                <p>// localStorage</p>
                <p>localStorage.setItem('era-theme', 'true')</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-brand-dark mb-2">2. Usando Componentes Temáticos</h4>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                <p>import {`{ EraThemedButton }`} from '@/components/EraThemedButton';</p>
                <p></p>
                <p>{`<EraThemedButton variant="primary">`}</p>
                <p>  Botão com Tema ERA</p>
                <p>{`</EraThemedButton>`}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-brand-dark mb-2">3. Classes Condicionais</h4>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                <p>import {`{ useEraTheme }`} from '@/hooks/useEraTheme';</p>
                <p></p>
                <p>const {`{ isEraTheme, eraClass }`} = useEraTheme();</p>
                <p></p>
                <p>{`<div className={eraClass('bg-brand-primary', 'bg-blue-600')}>`}</p>
                <p>  Conteúdo</p>
                <p>{`</div>`}</p>
              </div>
            </div>
          </div>
        </EraThemedCard>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>
            Sistema de Temas ERA - Desenvolvido para manter compatibilidade total 
            com a plataforma existente
          </p>
          <p className="mt-2">
            🎨 Cores: #CFFF00, #2B363D, #9DB6C3, #CCC4A5 | 
            📝 Fontes: Inter, Manrope
          </p>
        </div>
      </div>
    </div>
  );
}
