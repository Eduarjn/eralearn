import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEraTheme } from '@/hooks/useEraTheme';
import { cn } from '@/lib/utils';

interface EraThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

/**
 * Input com suporte ao tema ERA
 * Mantém compatibilidade total com o Input original
 */
export function EraThemedInput({ 
  label,
  error,
  helperText,
  className,
  ...props 
}: EraThemedInputProps) {
  const { isEraTheme } = useEraTheme();

  // Classes específicas do tema ERA
  const eraInputClasses = isEraTheme 
    ? 'border-brand-muted focus:border-brand-primary focus:ring-brand-primary/20 font-sans' 
    : '';

  const eraLabelClasses = isEraTheme 
    ? 'text-brand-dark font-heading font-medium' 
    : '';

  const eraHelperClasses = isEraTheme 
    ? 'text-brand-muted' 
    : '';

  const eraErrorClasses = isEraTheme 
    ? 'text-red-600' 
    : '';

  return (
    <div className="space-y-2">
      {label && (
        <Label className={eraLabelClasses}>
          {label}
        </Label>
      )}
      
      <Input
        className={cn(eraInputClasses, className)}
        {...props}
      />
      
      {error && (
        <p className={cn("text-sm", eraErrorClasses)}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={cn("text-sm", eraHelperClasses)}>
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Exemplo de uso do input com tema ERA
 */
export function ExampleEraInput() {
  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-semibold">Inputs com Tema ERA</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <EraThemedInput
            label="Nome Completo"
            placeholder="Digite seu nome"
            helperText="Este campo é obrigatório"
          />
          
          <EraThemedInput
            label="Email"
            type="email"
            placeholder="seu@email.com"
            helperText="Usaremos para contato"
          />
          
          <EraThemedInput
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            error="Senha deve ter pelo menos 8 caracteres"
          />
        </div>
        
        <div className="space-y-4">
          <EraThemedInput
            label="Telefone"
            placeholder="(11) 99999-9999"
            helperText="Formato: (XX) XXXXX-XXXX"
          />
          
          <EraThemedInput
            label="Empresa"
            placeholder="Nome da empresa"
            helperText="Opcional"
          />
          
          <EraThemedInput
            label="Cargo"
            placeholder="Seu cargo atual"
            helperText="Ex: Desenvolvedor, Analista, etc."
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Características do Tema ERA:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Labels em #2B363D (brand-dark) com fonte Manrope</li>
          <li>Bordas em #9DB6C3 (brand-muted)</li>
          <li>Focus em #CFFF00 (brand-primary)</li>
          <li>Texto de ajuda em #9DB6C3 (brand-muted)</li>
          <li>Erros em vermelho padrão</li>
        </ul>
      </div>
    </div>
  );
}
