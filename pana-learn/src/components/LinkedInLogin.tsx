import React from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';

interface LinkedInLoginProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export const LinkedInLogin: React.FC<LinkedInLoginProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const handleLinkedInLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            scope: 'r_liteprofile r_emailaddress'
          }
        }
      });

      if (error) {
        console.error('Erro no login LinkedIn:', error);
        onError?.(error);
      } else {
        console.log('Login LinkedIn iniciado:', data);
        // O usuário será redirecionado para o LinkedIn
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      onError?.(error);
    }
  };

  return (
    <Button
      onClick={handleLinkedInLogin}
      className={`bg-[#0077B5] hover:bg-[#005885] text-white ${className}`}
      variant="outline"
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      Entrar com LinkedIn
    </Button>
  );
};

export default LinkedInLogin; 