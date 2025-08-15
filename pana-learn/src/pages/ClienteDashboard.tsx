import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ERALayout } from '@/components/ERALayout';
import { useAuth } from '@/hooks/useAuth';
import { useDomains } from '@/hooks/useDomains';
import { useDomainUsers } from '@/hooks/useDomainUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Globe, 
  Users, 
  BookOpen, 
  Award, 
  BarChart3, 
  Calendar,
  Eye,
  ExternalLink,
  Shield,
  AlertCircle,
  Plus,
  Settings,
  Database,
  UserPlus,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database as DatabaseType } from '@/integrations/supabase/types';

type Domain = DatabaseType['public']['Tables']['domains']['Row'];
type User = DatabaseType['public']['Tables']['usuarios']['Row'];

const ClienteDashboard: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { domains, isAdminMaster, currentUserType } = useDomains();
  const { 
    users, 
    loading: usersLoading, 
    error: usersError,
    createUser,
    fetchUsersByDomain,
    setupDefaultUsers,
    deleteUser,
    updateUser
  } = useDomainUsers();
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    tipo_usuario: 'cliente' as 'cliente' | 'admin' | 'admin_master',
    senha: ''
  });
  const [setupLoading, setSetupLoading] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    if (domainId && domains.length > 0) {
      const foundDomain = domains.find(d => d.id === domainId);
      setDomain(foundDomain || null);
      setLoading(false);
      
      // Carregar usuários do domínio
      if (foundDomain) {
        fetchUsersByDomain(domainId);
      }
    }
  }, [domainId, domains, fetchUsersByDomain]);

  // Verificar se é admin_master (usando o tipo original)
  if (currentUserType !== 'admin_master') {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Acesso Negado</h2>
            <p className="text-gray-500">Apenas administradores master podem acessar esta página.</p>
            <p className="text-sm text-gray-400 mt-2">Tipo de usuário: {currentUserType || 'Não identificado'}</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  if (loading) {
    return (
      <ERALayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600">Carregando dados do cliente...</span>
        </div>
      </ERALayout>
    );
  }

  if (!domain) {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Cliente não encontrado</h2>
            <p className="text-gray-500 mb-4">O domínio solicitado não foi encontrado.</p>
            <Button onClick={() => navigate('/dominios')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Domínios
            </Button>
          </div>
        </div>
      </ERALayout>
    );
  }

  const handleAccessClient = () => {
    const clientUrl = `https://${domain.name}`;
    window.open(clientUrl, '_blank');
    toast({
      title: "🔗 Acessando Cliente",
      description: `Redirecionando para ${domain.name}...`,
    });
  };

  const handleSetupNewClient = async () => {
    setSetupLoading(true);
    const result = await setupDefaultUsers(domain.id);
    
    if (result.success) {
      toast({
        title: "✅ Cliente Configurado",
        description: result.message,
      });
      setShowSetupModal(false);
    } else {
      toast({
        title: "❌ Erro na Configuração",
        description: result.message,
        variant: "destructive"
      });
    }
    setSetupLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.nome || !newUser.email) {
      toast({
        title: "❌ Campos Obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = await createUser(domain.id, newUser);
    
    if (result.success) {
      toast({
        title: "✅ Usuário Criado",
        description: result.message,
      });
      
      if (result.password) {
        setCreatedPassword(result.password);
        // Mostrar senha por 5 segundos
        setTimeout(() => setCreatedPassword(null), 5000);
      }
      
      setShowCreateUserModal(false);
      setNewUser({ nome: '', email: '', tipo_usuario: 'cliente', senha: '' });
    } else {
      toast({
        title: "❌ Erro ao Criar Usuário",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      const result = await deleteUser(userId);
      
      if (result.success) {
        toast({
          title: "✅ Usuário Deletado",
          description: result.message,
        });
      } else {
        toast({
          title: "❌ Erro ao Deletar",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: "Senha copiada para a área de transferência",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dados simulados do cliente (em uma implementação real, viriam do banco)
  const clientStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'ativo').length,
    totalCourses: 0, // Cliente novo, sem cursos
    completedCourses: 0,
    totalCertificates: 0,
    averageProgress: 0
  };

  const isNewClient = clientStats.totalUsers === 0 && clientStats.totalCourses === 0;

  return (
    <ERALayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dominios')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard do Cliente</h1>
              <div className="flex items-center gap-2 mt-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="text-xl font-semibold text-blue-600">{domain.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {isNewClient ? 'Novo Cliente' : 'Ativo'}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  Admin Master
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={handleAccessClient}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Acessar Site
            </Button>
            {isNewClient && (
              <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Configurar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Isso irá criar usuários padrão para o domínio {domain.name}:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>admin@{domain.name} (Administrador)</li>
                      <li>usuario@{domain.name} (Cliente)</li>
                      <li>gerente@{domain.name} (Administrador)</li>
                    </ul>
                    <Button 
                      onClick={handleSetupNewClient}
                      disabled={setupLoading}
                      className="w-full"
                    >
                      {setupLoading ? 'Configurando...' : 'Confirmar Configuração'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={newUser.nome}
                      onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="usuario@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo de Usuário</Label>
                                         <Select
                       value={newUser.tipo_usuario}
                       onValueChange={(value) => setNewUser({ ...newUser, tipo_usuario: value as 'cliente' | 'admin' | 'admin_master' })}
                     >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha (opcional)</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={newUser.senha}
                      onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                      placeholder="Deixe em branco para gerar automaticamente"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateUser}
                    className="w-full"
                  >
                    Criar Usuário
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Modo Visualização
            </Button>
          </div>
        </div>

        {/* Banner para Cliente Novo */}
        {isNewClient && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    Cliente Novo - Ambiente Limpo
                  </h3>
                  <p className="text-blue-700">
                    Este é um ambiente novo para {domain.name}. Clique em "Configurar Cliente" para 
                    criar usuários padrão e preparar o ambiente para uso.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSetupModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner de Senha Criada */}
        {createdPassword && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    Usuário Criado com Sucesso!
                  </h3>
                  <p className="text-green-700">
                    Senha gerada: <strong>{createdPassword}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(createdPassword)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button 
                    onClick={() => setCreatedPassword(null)}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Cliente */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Detalhes do Domínio</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{domain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descrição:</span>
                    <span className="font-medium">{domain.description || 'Sem descrição'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criado em:</span>
                    <span className="font-medium">{formatDate(domain.created_at)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status da Plataforma</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={isNewClient ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                      {isNewClient ? 'Configurando' : 'Ativo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuários:</span>
                    <span className="font-medium">{clientStats.totalUsers} cadastrados</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versão:</span>
                    <span className="font-medium">v2.1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900">{clientStats.totalUsers}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? 'Nenhum usuário cadastrado' : `${clientStats.activeUsers} ativos`}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cursos Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{clientStats.totalCourses}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? 'Nenhum curso cadastrado' : `${clientStats.completedCourses} concluídos`}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Certificados</p>
                  <p className="text-3xl font-bold text-gray-900">{clientStats.totalCertificates}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? 'Nenhum certificado emitido' : '+8 esta semana'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Progresso Médio</p>
                  <p className="text-3xl font-bold text-gray-900">{clientStats.averageProgress}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? 'Sem dados disponíveis' : '+5% este mês'}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{clientStats.activeUsers}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? '0% do total' : `${Math.round((clientStats.activeUsers / clientStats.totalUsers) * 100)}% do total`}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Última Atividade</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {isNewClient ? 'Nunca' : 'Hoje'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isNewClient ? 'Cliente ainda não configurado' : '14:30 - Login de usuário'}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Domínio
              </div>
              <Button 
                onClick={() => setShowCreateUserModal(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Carregando usuários...</span>
              </div>
            ) : usersError ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{usersError}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum usuário cadastrado neste domínio</p>
                <Button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="mt-4"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Primeiro Usuário
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Nome</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Criado em</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.nome}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={user.tipo_usuario === 'admin' ? 'default' : 'secondary'}>
                            {user.tipo_usuario}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.status === 'ativo' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(user.data_criacao)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {/* Implementar edição */}}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id, user.nome)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm">Gerenciar Usuários</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="text-sm">Gerenciar Cursos</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Database className="h-5 w-5 mb-1" />
                <span className="text-sm">Importar Dados</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-sm">Configurações</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERALayout>
  );
};

export default ClienteDashboard; 