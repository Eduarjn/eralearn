import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useEraTheme } from '@/hooks/useEraTheme';
import { cn } from '@/lib/utils';

interface EraThemedButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

/**
 * Botão com suporte ao tema ERA
 * Mantém compatibilidade total com o Button original
 */
export function EraThemedButton({ 
  variant = 'primary', 
  size = 'default', 
  children, 
  className,
  ...props 
}: EraThemedButtonProps) {
  const { isEraTheme } = useEraTheme();

  // Classes específicas do tema ERA
  const eraClasses = {
    primary: isEraTheme 
      ? 'bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 border-brand-primary' 
      : '',
    secondary: isEraTheme 
      ? 'bg-brand-sand text-brand-sand-foreground hover:bg-brand-sand/90 border-brand-sand' 
      : '',
    outline: isEraTheme 
      ? 'border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-primary-foreground' 
      : '',
    ghost: isEraTheme 
      ? 'text-brand-dark hover:bg-brand-muted/20' 
      : '',
  };

  // Classes de fonte específicas do tema ERA
  const fontClass = isEraTheme ? 'font-heading' : '';

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        fontClass,
        eraClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Exemplo de uso do botão com tema ERA
 */
export function ExampleEraButton() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Botões com Tema ERA</h3>
      
      <div className="flex flex-wrap gap-4">
        <EraThemedButton variant="primary">
          Botão Primário
        </EraThemedButton>
        
        <EraThemedButton variant="secondary">
          Botão Secundário
        </EraThemedButton>
        
        <EraThemedButton variant="outline">
          Botão Outline
        </EraThemedButton>
        
        <EraThemedButton variant="ghost">
          Botão Ghost
        </EraThemedButton>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>• Tema ERA: Cores vibrantes (#CFFF00, #2B363D, #9DB6C3, #CCC4A5)</p>
        <p>• Tema Padrão: Cores originais da plataforma</p>
        <p>• Fontes: Inter (padrão) / Manrope (títulos ERA)</p>
      </div>
    </div>
  );
}
