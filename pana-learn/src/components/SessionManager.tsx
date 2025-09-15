import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSingleSession } from '@/hooks/useSingleSession';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, AlertTriangle, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SessionManagerProps {
  children: React.ReactNode;
}

/**
 * Componente para gerenciar sessões únicas
 * Exibe alertas quando há conflitos de sessão
 */
export function SessionManager({ children }: SessionManagerProps) {
  const { user } = useAuth();
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<any>(null);

  const { 
    sessionToken, 
    sessionInfo, 
    isValidating, 
    createSession, 
    endSession 
  } = useSingleSession({
    onSessionConflict: (existingSession) => {
      setConflictInfo(existingSession);
      setShowConflictModal(true);
    },
    onSessionExpired: () => {
      // Redirecionar para login ou mostrar modal de sessão expirada
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Redirecionando para login...",
        variant: "destructive"
      });
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  });

  // Criar sessão quando usuário fizer login
  useEffect(() => {
    if (user && !sessionToken && !isValidating) {
      createSession(user.id);
    }
  }, [user, sessionToken, isValidating, createSession]);

  // Função para forçar login (encerrar outras sessões)
  const handleForceLogin = async () => {
    if (!user) return;

    try {
      await endSession(user.id); // Encerra todas as sessões
      const newToken = await createSession(user.id);
      
      if (newToken) {
        setShowConflictModal(false);
        toast({
          title: "Login Forçado",
          description: "Outras sessões foram encerradas. Você está logado.",
        });
      }
    } catch (error) {
      console.error('Erro ao forçar login:', error);
      toast({
        title: "Erro",
        description: "Não foi possível forçar o login. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Função para cancelar login
  const handleCancelLogin = () => {
    setShowConflictModal(false);
    // Redirecionar para login ou logout
    window.location.href = '/login';
  };

  // Função para obter ícone do dispositivo
  const getDeviceIcon = (deviceInfo: any) => {
    if (!deviceInfo) return <Monitor className="h-4 w-4" />;
    
    const userAgent = deviceInfo.browser || '';
    
    if (/mobile/i.test(userAgent)) {
      return <Smartphone className="h-4 w-4" />;
    } else if (/tablet/i.test(userAgent)) {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  // Função para formatar informações do dispositivo
  const formatDeviceInfo = (deviceInfo: any) => {
    if (!deviceInfo) return 'Dispositivo desconhecido';
    
    const browser = deviceInfo.browser || '';
    const platform = deviceInfo.platform || '';
    
    // Extrair nome do navegador
    let browserName = 'Navegador';
    if (browser.includes('Chrome')) browserName = 'Chrome';
    else if (browser.includes('Firefox')) browserName = 'Firefox';
    else if (browser.includes('Safari')) browserName = 'Safari';
    else if (browser.includes('Edge')) browserName = 'Edge';
    
    // Extrair sistema operacional
    let osName = '';
    if (platform.includes('Win')) osName = 'Windows';
    else if (platform.includes('Mac')) osName = 'macOS';
    else if (platform.includes('Linux')) osName = 'Linux';
    else if (platform.includes('Android')) osName = 'Android';
    else if (platform.includes('iOS')) osName = 'iOS';
    
    return `${browserName}${osName ? ` em ${osName}` : ''}`;
  };

  return (
    <>
      {children}
      
      {/* Modal de Conflito de Sessão */}
      {showConflictModal && conflictInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Sessão Ativa Detectada</CardTitle>
              </div>
              <CardDescription>
                Você já está logado em outro dispositivo. Escolha uma opção:
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações da sessão existente */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getDeviceIcon(conflictInfo.deviceInfo)}
                  <span className="font-medium">Sessão Ativa</span>
                  <Badge variant="secondary">Online</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDeviceInfo(conflictInfo.deviceInfo)}
                </p>
                {conflictInfo.lastActivity && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última atividade: {new Date(conflictInfo.lastActivity).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Opções */}
              <div className="space-y-2">
                <Button 
                  onClick={handleForceLogin}
                  className="w-full"
                  variant="default"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Encerrar Outra Sessão e Fazer Login
                </Button>
                
                <Button 
                  onClick={handleCancelLogin}
                  className="w-full"
                  variant="outline"
                >
                  Cancelar Login
                </Button>
              </div>

              {/* Aviso */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ao forçar o login, a sessão no outro dispositivo será encerrada automaticamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicador de Validação de Sessão */}
      {isValidating && (
        <div className="fixed top-4 right-4 z-40">
          <Badge variant="secondary" className="animate-pulse">
            Validando sessão...
          </Badge>
        </div>
      )}
    </>
  );
}
















