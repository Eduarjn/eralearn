import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function NavItem({ 
  icon: Icon, 
  label, 
  path, 
  isExpanded, 
  isActive = false,
  onClick 
}: NavItemProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <NavLink
            to={path}
            onClick={onClick}
            className={({ isActive: navIsActive }) => `
              group relative flex items-center px-3 py-2 rounded-lg
              transition-all duration-200 ease-out
              ${isExpanded ? 'w-full' : 'w-12 justify-center'}
              ${navIsActive || isActive 
                ? 'bg-surface-2 border-accent text-accent shadow-neon' 
                : 'text-muted hover:text-text hover:bg-surface-hover border-transparent'
              }
              border border-transparent
              focus-neon
              focus:outline-none
            `}
            style={{
              '--surface-2': 'var(--surface-2)',
              '--accent': 'var(--accent)',
              '--muted': 'var(--muted)',
              '--text': 'var(--text)',
              '--surface-hover': 'var(--surface-hover)',
            } as React.CSSProperties}
          >
            {({ isActive: navIsActive }) => (
              <>
                {/* Icon */}
                <Icon 
                  className={`
                    h-5 w-5 transition-all duration-200
                    ${isExpanded ? 'mr-3' : 'mx-auto'}
                    ${navIsActive || isActive ? 'text-accent' : 'text-muted group-hover:text-text'}
                  `}
                  style={{
                    '--accent': 'var(--accent)',
                    '--muted': 'var(--muted)',
                    '--text': 'var(--text)',
                  } as React.CSSProperties}
                />
                
                {/* Label */}
                {isExpanded && (
                  <span 
                    className={`
                      text-sm font-medium transition-all duration-200
                      ${navIsActive || isActive ? 'text-accent' : 'text-muted group-hover:text-text'}
                    `}
                    style={{
                      '--accent': 'var(--accent)',
                      '--muted': 'var(--muted)',
                      '--text': 'var(--text)',
                    } as React.CSSProperties}
                  >
                    {label}
                  </span>
                )}
                
                {/* Active indicator */}
                {(navIsActive || isActive) && (
                  <div className="absolute right-2 w-2 h-2 bg-accent rounded-full shadow-neon" />
                )}
              </>
            )}
          </NavLink>
        </TooltipTrigger>
        
        {/* Tooltip for collapsed state */}
        {!isExpanded && (
          <TooltipContent 
            side="right" 
            className="bg-surface border border-accent text-text shadow-neon"
            style={{
              '--surface': 'var(--surface)',
              '--accent': 'var(--accent)',
              '--text': 'var(--text)',
            } as React.CSSProperties}
          >
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
