import React, { useState, useEffect } from 'react';
import { ERALayout } from '@/components/ERALayout';
import { useDomains } from '@/hooks/useDomains';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Eye,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';

type Domain = Database['public']['Tables']['domains']['Row'];

interface DomainFormData {
  name: string;
  description: string;
}

const Dominios: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { 
    domains, 
    loading, 
    error, 
    createDomain, 
    updateDomain, 
    deleteDomain, 
    isAdminMaster,
    fetchDomains
  } = useDomains();

  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [formData, setFormData] = useState<DomainFormData>({
    name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Verificar se é admin_master
  if (!isAdminMaster) {
    return (
      <ERALayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Acesso Negado</h2>
            <p className="text-gray-500 mb-4">Apenas administradores master podem acessar esta página.</p>
            <p className="text-sm text-gray-400">Tipo de usuário atual: {userProfile?.tipo_usuario || 'Não identificado'}</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  const handleOpenModal = (domain?: Domain) => {
    if (domain) {
      setEditingDomain(domain);
      setFormData({
        name: domain.name,
        description: domain.description || ''
      });
    } else {
      setEditingDomain(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDomain(null);
    setFormData({ name: '', description: '' });
    setSubmitting(false);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "O nome do domínio é obrigatório.";
    }
    
    // Validar formato do domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(formData.name.trim())) {
      return "Formato de domínio inválido. Use o formato: exemplo.com";
    }
    
    // Verificar se já existe
    const existingDomain = domains.find(d => 
      d.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      d.id !== editingDomain?.id
    );
    if (existingDomain) {
      return "Este domínio já existe.";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingDomain) {
        await updateDomain(editingDomain.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null
        });
        toast({
          title: "✅ Sucesso!",
          description: "Domínio atualizado com sucesso.",
        });
      } else {
        await createDomain({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        });
        toast({
          title: "✅ Sucesso!",
          description: "Domínio criado com sucesso.",
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar domínio:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar domínio.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (domain: Domain) => {
    if (!window.confirm(`Tem certeza que deseja excluir o domínio "${domain.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteDomain(domain.id);
      toast({
        title: "✅ Sucesso!",
        description: "Domínio excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir domínio:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir domínio.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    fetchDomains();
    toast({
      title: "🔄 Atualizando...",
      description: "Lista de domínios atualizada.",
    });
  };

  const handleAccessClient = (domain: Domain) => {
    // Simular acesso ao ambiente do cliente
    const clientUrl = `https://${domain.name}`;
    
    toast({
      title: "🔗 Acessando Cliente",
      description: `Redirecionando para ${domain.name}...`,
    });

    // Abrir em nova aba
    window.open(clientUrl, '_blank');
  };

  const handleViewClientDashboard = (domain: Domain) => {
    // Navegar para o dashboard do cliente
    navigate(`/cliente/${domain.id}`);
    
    toast({
      title: "👁️ Visualizando Cliente",
      description: `Abrindo dashboard de ${domain.name}...`,
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

  // Ordenar domínios: eralearn.com primeiro, depois os outros
  const sortedDomains = domains.sort((a, b) => {
    if (a.name === 'eralearn.com') return -1;
    if (b.name === 'eralearn.com') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <ERALayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domínios</h1>
            <p className="text-gray-600 mt-2">Gerencie os domínios dos clientes da plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              + Novo Domínio
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Domínios</p>
                  <p className="text-3xl font-bold text-gray-900">{domains.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{domains.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Última Atualização</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {domains.length > 0 ? formatDate(domains[0].created_at) : 'Nunca'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Domínios */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domínios Cadastrados ({domains.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600">Carregando domínios...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum domínio cadastrado</p>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Domínio
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Nome do Domínio</th>
                      <th className="text-left py-3 px-4 font-medium">Descrição</th>
                      <th className="text-left py-3 px-4 font-medium">Criado Por</th>
                      <th className="text-left py-3 px-4 font-medium">Data de Criação</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDomains.map((domain) => (
                      <tr 
                        key={domain.id} 
                        className={`border-b hover:bg-gray-50 ${
                          domain.name === 'eralearn.com' ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{domain.name}</span>
                            {domain.name === 'eralearn.com' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {domain.description || 'Sem descrição'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Admin Master</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(domain.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewClientDashboard(domain)}
                              className="text-green-600 hover:text-green-700"
                              title="Visualizar Dashboard do Cliente"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAccessClient(domain)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Acessar Site do Cliente"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenModal(domain)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Editar Domínio"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {domain.name !== 'eralearn.com' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(domain)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir Domínio"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
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

        {/* Modal de Criação/Edição */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDomain ? 'Editar Domínio' : 'Novo Domínio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Domínio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do cliente/empresa"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingDomain ? 'Atualizar Domínio' : 'Criar Domínio'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ERALayout>
  );
};

export default Dominios; 