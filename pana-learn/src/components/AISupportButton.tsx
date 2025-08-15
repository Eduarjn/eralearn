import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Zap } from 'lucide-react';
import { AISupportChat } from './AISupportChat';
import { useAuth } from '@/hooks/useAuth';

interface AISupportButtonProps {
  courseId?: string;
  courseName?: string;
}

export function AISupportButton({ courseId, courseName }: AISupportButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { userProfile } = useAuth();

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={handleOpenChat}
          className="
            bg-surface border border-accent text-accent 
            hover:bg-surface-hover hover:border-accent-600 hover:text-accent-600
            shadow-neon hover:shadow-lg
            rounded-full w-14 h-14 p-0 relative group
            transition-all duration-200
            focus-neon
          "
          style={{
            '--surface': 'var(--surface)',
            '--accent': 'var(--accent)',
            '--surface-hover': 'var(--surface-hover)',
            '--accent-600': 'var(--accent-600)',
          } as React.CSSProperties}
          title="Suporte IA - Tire suas dúvidas"
        >
          <Bot className="h-6 w-6" />
          
          {/* Indicador de disponibilidade */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-surface animate-pulse shadow-neon" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-surface border border-accent text-text text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-neon">
            Suporte IA
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface" />
          </div>
        </Button>
      </div>

      {/* Chat de Suporte */}
      <AISupportChat
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        courseId={courseId}
        courseName={courseName}
      />
    </>
  );
}
