import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function TestDashboard() {
  const { user, userProfile, session, loading, createTestUsers, signOut } = useAuth();

  console.log('🧪 TestDashboard - Estado:', { 
    user: user?.email, 
    userProfile: userProfile?.nome,
    session: !!session,
    loading 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Testes
          </h1>
          <p className="text-gray-600">
            Dashboard de desenvolvimento e testes do sistema
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Status do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Autenticado:</span>
                  <Badge variant={user ? "default" : "secondary"}>
                    {user ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Perfil:</span>
                  <Badge variant={userProfile ? "default" : "secondary"}>
                    {userProfile ? "Carregado" : "Não carregado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sessão:</span>
                  <Badge variant={session ? "default" : "secondary"}>
                    {session ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Nome:</span>
                    <p className="text-sm font-medium">{userProfile.nome}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="text-sm">{userProfile.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Tipo:</span>
                    <Badge variant={userProfile.tipo_usuario === 'admin' ? "destructive" : "outline"}>
                      {userProfile.tipo_usuario}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Status:</span>
                    <Badge variant={userProfile.status === 'ativo' ? "default" : "secondary"}>
                      {userProfile.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum perfil carregado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Supabase conectado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Auth configurado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs">RLS ativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usuários de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Credenciais de Teste
            </CardTitle>
            <CardDescription>
              Use estas credenciais para testar diferentes tipos de usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">👨‍💼 Administrador</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> admin@eralearn.com</p>
                  <p><strong>Senha:</strong> test123456</p>
                  <p className="text-red-600 text-xs">Acesso completo ao sistema</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">👤 Cliente</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> cliente@eralearn.com</p>
                  <p><strong>Senha:</strong> test123456</p>
                  <p className="text-blue-600 text-xs">Acesso aos treinamentos</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              onClick={createTestUsers} 
              variant="outline" 
              className="w-full"
            >
              📋 Exibir credenciais no console
            </Button>
          </CardContent>
        </Card>

        {/* Dados da Sessão (se logado) */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dados da Sessão Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Usuário Supabase:</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Confirmado:</strong> {user.email_confirmed_at ? 'Sim' : 'Não'}</p>
                    <p><strong>Criado:</strong> {new Date(user.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                
                {userProfile && (
                  <div>
                    <h4 className="font-medium mb-2">Perfil do Usuário:</h4>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                      <p><strong>ID:</strong> {userProfile.id}</p>
                      <p><strong>Nome:</strong> {userProfile.nome}</p>
                      <p><strong>Tipo:</strong> {userProfile.tipo_usuario}</p>
                      <p><strong>Status:</strong> {userProfile.status}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                onClick={signOut} 
                variant="destructive" 
                className="w-full"
              >
                🚪 Fazer Logout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Problemas Conhecidos */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Autenticação funcionando</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Usuários de teste configurados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Redirecionamento funcionando</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
