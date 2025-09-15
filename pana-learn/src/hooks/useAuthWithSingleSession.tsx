import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSingleSession } from '@/hooks/useSingleSession';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

/**
 * Hook que integra autenticação com sistema de sessão única
 * Substitui o useAuth padrão para incluir controle de sessão
 */
export function useAuthWithSingleSession() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    sessionToken,
    sessionInfo,
    isValidating,
    createSession,
    validateSession,
    endSession
  } = useSingleSession({
    onSessionConflict: (existingSession) => {
      toast({
        title: "Sessão Ativa Detectada",
        description: "Você já está logado em outro dispositivo. Esta sessão será encerrada.",
        variant: "destructive"
      });
    },
    onSessionExpired: () => {
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Redirecionando para login...",
        variant: "destructive"
      });
      
      setTimeout(() => {
        signOut();
      }, 2000);
    }
  });

  // Inicializar sessão quando usuário fizer login
  useEffect(() => {
    const initializeSession = async () => {
      if (user && !sessionToken && !isValidating && !isInitialized) {
        setIsInitialized(true);
        
        try {
          const token = await createSession(user.id);
          if (!token) {
            // Se não conseguiu criar sessão, fazer logout
            await signOut();
          }
        } catch (error) {
          console.error('Erro ao inicializar sessão:', error);
          await signOut();
        }
      } else if (!user && isInitialized) {
        setIsInitialized(false);
      }
    };

    initializeSession();
  }, [user, sessionToken, isValidating, isInitialized, createSession, signOut]);

  // Função de login com controle de sessão
  const signInWithSession = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Criar sessão única
        const token = await createSession(data.user.id);
        if (!token) {
          // Se não conseguiu criar sessão, fazer logout
          await supabase.auth.signOut();
          throw new Error('Não foi possível criar sessão única');
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Função de logout com limpeza de sessão
  const signOutWithSession = async () => {
    try {
      if (user && sessionToken) {
        await endSession(user.id, sessionToken);
      }
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Fazer logout mesmo com erro
      await signOut();
    }
  };

  // Função para forçar logout de todas as sessões
  const signOutAllSessions = async () => {
    try {
      if (user) {
        await endSession(user.id); // Encerra todas as sessões
      }
      await signOut();
    } catch (error) {
      console.error('Erro ao encerrar todas as sessões:', error);
      await signOut();
    }
  };

  // Função para verificar se sessão é válida
  const isSessionValid = async () => {
    if (!user || !sessionToken) return false;
    
    try {
      return await validateSession(user.id, sessionToken);
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  };

  return {
    // Estados
    user,
    loading: authLoading || isValidating,
    sessionToken,
    sessionInfo,
    isSessionValid: !!sessionToken,
    
    // Funções
    signInWithSession,
    signOutWithSession,
    signOutAllSessions,
    isSessionValid,
    
    // Funções originais (para compatibilidade)
    signOut: signOutWithSession
  };
}












