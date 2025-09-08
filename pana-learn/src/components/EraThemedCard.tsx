import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEraTheme } from '@/hooks/useEraTheme';
import { cn } from '@/lib/utils';

interface EraThemedCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

/**
 * Card com suporte ao tema ERA
 * Mantém compatibilidade total com o Card original
 */
export function EraThemedCard({ 
  children, 
  className,
  title,
  description,
  footer,
  ...props 
}: EraThemedCardProps) {
  const { isEraTheme } = useEraTheme();

  // Classes específicas do tema ERA
  const eraCardClasses = isEraTheme 
    ? 'border-brand-muted bg-white shadow-lg hover:shadow-xl transition-shadow' 
    : '';

  const eraTitleClasses = isEraTheme 
    ? 'text-brand-dark font-heading' 
    : '';

  const eraDescriptionClasses = isEraTheme 
    ? 'text-brand-muted' 
    : '';

  return (
    <Card 
      className={cn(eraCardClasses, className)} 
      {...props}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className={eraTitleClasses}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={eraDescriptionClasses}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Exemplo de uso do card com tema ERA
 */
export function ExampleEraCard() {
  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-semibold">Cards com Tema ERA</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EraThemedCard
          title="Card com Tema ERA"
          description="Este card usa as cores e fontes do tema ERA quando ativado"
        >
          <p className="text-sm">
            O conteúdo do card se adapta automaticamente ao tema ativo.
            Quando o tema ERA está ativo, usa as cores vibrantes e a fonte Manrope.
          </p>
        </EraThemedCard>
        
        <EraThemedCard
          title="Card Padrão"
          description="Este card mantém o visual original quando o tema ERA não está ativo"
        >
          <p className="text-sm">
            Sem o tema ERA, o card mantém o visual original da plataforma,
            garantindo que nada seja quebrado.
          </p>
        </EraThemedCard>
      </div>
      
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Características do Tema ERA:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Bordas em #9DB6C3 (brand-muted)</li>
          <li>Títulos em #2B363D (brand-dark) com fonte Manrope</li>
          <li>Descrições em #9DB6C3 (brand-muted)</li>
          <li>Sombras mais pronunciadas</li>
          <li>Transições suaves</li>
        </ul>
      </div>
    </div>
  );
}
