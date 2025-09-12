import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface SessionInfo {
  hasActiveSession: boolean;
  sessionId: string | null;
  deviceInfo: any;
  lastActivity: string | null;
}

interface UseSingleSessionOptions {
  onSessionConflict?: (existingSession: SessionInfo) => void;
  onSessionExpired?: () => void;
  checkInterval?: number; // em milissegundos
}

/**
 * Hook para gerenciar sessão única por usuário
 * Impede múltiplos logins simultâneos
 */
export function useSingleSession(options: UseSingleSessionOptions = {}) {
  const {
    onSessionConflict,
    onSessionExpired,
    checkInterval = 30000 // 30 segundos
  } = options;

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // Gerar token único para a sessão
  const generateSessionToken = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Obter informações do dispositivo
  const getDeviceInfo = useCallback(() => {
    return {
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: new Date().toISOString()
    };
  }, []);

  // Verificar se usuário já tem sessão ativa
  const checkExistingSession = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_active_session', {
        p_user_id: userId
      });

      if (error) {
        console.error('Erro ao verificar sessão existente:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao verificar sessão existente:', error);
      return null;
    }
  }, []);

  // Criar nova sessão
  const createSession = useCallback(async (userId: string) => {
    try {
      setIsValidating(true);
      
      const token = generateSessionToken();
      const deviceInfo = getDeviceInfo();
      
      // Verificar se já existe sessão ativa
      const existingSession = await checkExistingSession(userId);
      
      if (existingSession?.has_active_session) {
        // Notificar sobre conflito de sessão
        const conflictInfo: SessionInfo = {
          hasActiveSession: true,
          sessionId: existingSession.session_id,
          deviceInfo: existingSession.device_info,
          lastActivity: existingSession.last_activity
        };
        
        setSessionInfo(conflictInfo);
        onSessionConflict?.(conflictInfo);
        
        toast({
          title: "Sessão Ativa Detectada",
          description: "Você já está logado em outro dispositivo. Esta sessão será encerrada.",
          variant: "destructive"
        });
        
        return null;
      }

      // Criar nova sessão
      const { data, error } = await supabase.rpc('create_user_session', {
        p_user_id: userId,
        p_session_token: token,
        p_device_info: deviceInfo,
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Erro ao criar sessão:', error);
        toast({
          title: "Erro de Sessão",
          description: "Não foi possível criar a sessão. Tente novamente.",
          variant: "destructive"
        });
        return null;
      }

      setSessionToken(token);
      return token;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [generateSessionToken, getDeviceInfo, checkExistingSession, onSessionConflict]);

  // Validar sessão atual
  const validateSession = useCallback(async (userId: string, token: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_user_session', {
        p_user_id: userId,
        p_session_token: token
      });

      if (error) {
        console.error('Erro ao validar sessão:', error);
        return false;
      }

      if (!data) {
        // Sessão expirada ou inválida
        onSessionExpired?.();
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return false;
    }
  }, [onSessionExpired]);

  // Encerrar sessão
  const endSession = useCallback(async (userId: string, token?: string) => {
    try {
      const { error } = await supabase.rpc('end_user_session', {
        p_user_id: userId,
        p_session_token: token || null
      });

      if (error) {
        console.error('Erro ao encerrar sessão:', error);
        return false;
      }

      setSessionToken(null);
      setSessionInfo(null);
      return true;
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      return false;
    }
  }, []);

  // Verificação periódica da sessão
  useEffect(() => {
    if (!sessionToken) return;

    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isValid = await validateSession(user.id, sessionToken);
        if (!isValid) {
          clearInterval(interval);
        }
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [sessionToken, validateSession, checkInterval]);

  // Limpar sessão ao desmontar componente
  useEffect(() => {
    return () => {
      if (sessionToken) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            endSession(user.id, sessionToken);
          }
        });
      }
    };
  }, [sessionToken, endSession]);

  return {
    sessionToken,
    sessionInfo,
    isValidating,
    createSession,
    validateSession,
    endSession,
    checkExistingSession
  };
}











