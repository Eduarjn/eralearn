import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bot, 
  Zap, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TokenUsage {
  id: string;
  user_id: string;
  tokens_used: number;
  tokens_limit: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  user_type?: string;
}

interface ChatHistory {
  id: string;
  user_id: string;
  content: string;
  sender: string;
  tokens_used: number;
  course_id?: string;
  created_at: string;
  user_email?: string;
  course_name?: string;
}

export function AITokenManagement() {
  const { userProfile } = useAuth();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newTokenLimit, setNewTokenLimit] = useState('');

  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

  useEffect(() => {
    if (isAdmin) {
      loadTokenUsage();
      loadChatHistory();
    }
  }, [isAdmin]);

  const loadTokenUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_token_usage')
        .select(`
          *,
          user_profiles:user_id (
            email,
            nome,
            tipo_usuario
          )
        `)
        .order('tokens_used', { ascending: false });

      if (error) throw error;

      const formattedData: TokenUsage[] = data?.map(item => ({
        ...item,
        user_email: item.user_profiles?.email,
        user_name: item.user_profiles?.nome,
        user_type: item.user_profiles?.tipo_usuario
      })) || [];

      setTokenUsage(formattedData);
    } catch (error) {
      console.error('Erro ao carregar uso de tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de uso de tokens.",
        variant: "destructive"
      });
    }
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select(`
          *,
          user_profiles:user_id (
            email
          ),
          cursos:course_id (
            nome
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedData: ChatHistory[] = data?.map(item => ({
        ...item,
        user_email: item.user_profiles?.email,
        course_name: item.cursos?.nome
      })) || [];

      setChatHistory(formattedData);
    } catch (error) {
      console.error('Erro ao carregar histórico de chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTokenLimit = async (userId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('ai_token_usage')
        .update({
          tokens_limit: newLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Limite de tokens atualizado com sucesso!",
      });

      loadTokenUsage();
      setNewTokenLimit('');
      setSelectedUser('');
    } catch (error) {
      console.error('Erro ao atualizar limite de tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o limite de tokens.",
        variant: "destructive"
      });
    }
  };

  const resetUserTokens = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('ai_token_usage')
        .update({
          tokens_used: 0,
          last_reset: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tokens do usuário resetados com sucesso!",
      });

      loadTokenUsage();
    } catch (error) {
      console.error('Erro ao resetar tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar os tokens.",
        variant: "destructive"
      });
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const filteredTokenUsage = tokenUsage.filter(user => 
    user.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTokensUsed = tokenUsage.reduce((sum, user) => sum + user.tokens_used, 0);
  const totalTokensLimit = tokenUsage.reduce((sum, user) => sum + user.tokens_limit, 0);
  const averageUsage = totalTokensLimit > 0 ? (totalTokensUsed / totalTokensLimit) * 100 : 0;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-era-green" />
            Gerenciamento de Tokens IA
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie o uso de tokens de IA por usuário e visualize estatísticas
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-era-green" />
                <div>
                  <p className="text-sm text-gray-600">Total de Tokens Usados</p>
                  <p className="text-2xl font-bold">{totalTokensUsed.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{tokenUsage.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Uso Médio</p>
                  <p className="text-2xl font-bold">{averageUsage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Limite Alto</p>
                  <p className="text-2xl font-bold">
                    {tokenUsage.filter(u => getUsagePercentage(u.tokens_used, u.tokens_limit) >= 90).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={loadTokenUsage}
            disabled={loading}
            className="bg-era-green hover:bg-era-green/90 text-era-black"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Tabela de Uso de Tokens */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Uso de Tokens por Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tokens Usados</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Último Reset</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokenUsage.map((user) => {
                  const usagePercentage = getUsagePercentage(user.tokens_used, user.tokens_limit);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.user_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.user_type || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{user.tokens_used.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{user.tokens_limit.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center gap-2 mb-1">
                            <Progress value={usagePercentage} className="flex-1" />
                            <span className={`text-xs font-medium ${getUsageColor(usagePercentage)}`}>
                              {usagePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(user.last_reset).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user.user_id);
                              setNewTokenLimit(user.tokens_limit.toString());
                            }}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetUserTokens(user.user_id)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal para Editar Limite */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Editar Limite de Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tokenLimit">Novo Limite de Tokens</Label>
                    <Input
                      id="tokenLimit"
                      type="number"
                      value={newTokenLimit}
                      onChange={(e) => setNewTokenLimit(e.target.value)}
                      placeholder="Ex: 10000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTokenLimit(selectedUser, parseInt(newTokenLimit))}
                      className="bg-era-green hover:bg-era-green/90 text-era-black"
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser('');
                        setNewTokenLimit('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Histórico de Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Histórico de Chat IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatHistory.slice(0, 20).map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>
                      <span className="text-sm">{chat.user_email}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {chat.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={chat.sender === 'ai' ? 'default' : 'secondary'}>
                        {chat.sender === 'ai' ? 'IA' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{chat.tokens_used}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{chat.course_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(chat.created_at).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}















