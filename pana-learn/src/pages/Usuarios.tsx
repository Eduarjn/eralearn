import { ERALayout } from '@/components/ERALayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Users, UserCheck, Shield, Edit, Trash2, Mail, Calendar, Clock, User, Download, MoreHorizontal, Smartphone, Award, Eye, Activity } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserListItem {
  id: string;
  nome: string;
  email: string;
  user_id: string;
  tipo_usuario: string;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
  ultimo_login?: string | null;
  login?: string;
}

interface UserStats {
  total: number;
  ativos: number;
  administradores: number;
  novosEstaSemana: number;
}

const Usuarios = () => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.tipo_usuario === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Database['public']['Tables']['usuarios']['Row'] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    tipo: 'Cliente',
    status: 'Ativo'
  });
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    ativos: 0,
    administradores: 0,
    novosEstaSemana: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const [showEmailValidationMsg, setShowEmailValidationMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [selectedUserCertificates, setSelectedUserCertificates] = useState<Database['public']['Tables']['certificados']['Row'][]>([]);
  const [selectedUserProgress, setSelectedUserProgress] = useState<{
    userId: string;
    userName: string;
    progress: Database['public']['Tables']['progresso_usuario']['Row'][];
  } | null>(null);
  const [sortField, setSortField] = useState<'nome' | 'email' | 'ultimo_login' | 'tipo_usuario' | 'data_criacao'>('data_criacao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch users from API
  const fetchUsers = async (search = searchTerm) => {
    setLoading(true);
    try {
      // Buscar todos os usuários do Supabase com contagem exata
      const { data: usersData, count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact' })
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const allUsersData = usersData || [];
      setAllUsers(allUsersData);

      // Filtrar localmente se houver termo de busca
      let filteredUsers = allUsersData;
      if (search.trim()) {
        filteredUsers = allUsersData.filter(user => 
          user.nome?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase()) ||
          user.login?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setUsers(filteredUsers);

      // Calcular estatísticas
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const stats: UserStats = {
        total: allUsersData.length,
        ativos: allUsersData.filter(user => user.status === 'ativo').length,
        administradores: allUsersData.filter(user => user.tipo_usuario === 'admin').length,
        novosEstaSemana: allUsersData.filter(user => 
          new Date(user.data_criacao) >= oneWeekAgo
        ).length
      };

      setUserStats(stats);
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
      toast({ title: 'Erro ao carregar usuários', description: 'Erro interno do servidor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários quando o componente montar
  useEffect(() => {
    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile]);

  // Debounce para busca
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, sortField, sortDirection]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleSort = (field: 'nome' | 'email' | 'ultimo_login' | 'tipo_usuario' | 'data_criacao') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatLastLogin = (lastLogin: string | null | undefined) => {
    if (!lastLogin) return 'Nunca';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 168) { // 7 dias
      const days = Math.floor(diffInHours / 24);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
      setSelectAll(true);
    } else {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast({ title: 'Nenhum usuário selecionado', description: 'Selecione pelo menos um usuário', variant: 'destructive' });
      return;
    }

    const actionText = {
      activate: 'ativar',
      deactivate: 'desativar',
      delete: 'excluir'
    }[action];

    if (!window.confirm(`Tem certeza que deseja ${actionText} ${selectedUsers.length} usuário(s)?`)) {
      return;
    }

    try {
      let updateData: Partial<Database['public']['Tables']['usuarios']['Update']> = {};
      
      if (action === 'activate') {
        updateData = { status: 'ativo' };
      } else if (action === 'deactivate') {
        updateData = { status: 'inativo' };
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .in('id', selectedUsers);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .in('id', selectedUsers);

        if (error) throw error;
      }

      toast({ title: `Usuários ${actionText} com sucesso!` });
      setSelectedUsers([]);
      setSelectAll(false);
      fetchUsers();
    } catch (error) {
      console.error(`Erro ao ${actionText} usuários:`, error);
      toast({ title: `Erro ao ${actionText} usuários`, description: 'Erro interno do servidor', variant: 'destructive' });
    }
  };

  const exportUsers = (format: 'csv' | 'json') => {
    const data = users.map(user => ({
      Nome: user.nome,
      Email: user.email,
      Login: user.login || '',
      Tipo: user.tipo_usuario,
      Status: user.status,
      'Data de Criação': new Date(user.data_criacao).toLocaleDateString('pt-BR')
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({ title: 'Exportação concluída', description: `Arquivo ${format.toUpperCase()} baixado com sucesso` });
  };

  const handleNewUserSubmit = async () => {
    if (!newUser.nome || !newUser.email) {
      toast({ title: 'Campos obrigatórios', description: 'Nome e email são obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      // ✅ CORREÇÃO: Usar estrutura correta da tabela usuarios
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome: newUser.nome,
          email: newUser.email,
          tipo_usuario: newUser.tipo === 'Cliente' ? 'cliente' : 'admin' as Database['public']['Enums']['user_type'],
          status: newUser.status === 'Ativo' ? 'ativo' : 'inativo' as Database['public']['Enums']['status_type']
          // ✅ NOTA: user_id será NULL para usuários criados manualmente por admin
          // Isso é aceitável para usuários que não fazem login via Supabase Auth
        });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        if (error.code === '23505') { // unique_violation
          toast({ title: 'Erro ao criar usuário', description: 'Email já existe no sistema', variant: 'destructive' });
        } else {
          throw error;
        }
        return;
      }

      toast({ title: 'Usuário criado com sucesso!' });
      setNewUser({ nome: '', email: '', tipo: 'Cliente', status: 'Ativo' });
      setShowNewUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({ title: 'Erro ao criar usuário', description: 'Erro interno do servidor', variant: 'destructive' });
    }
  };

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user as Database['public']['Tables']['usuarios']['Row']);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: editingUser.nome,
          email: editingUser.email,
          tipo_usuario: editingUser.tipo_usuario as Database['public']['Enums']['user_type'],
          status: editingUser.status as Database['public']['Enums']['status_type'],
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      
      toast({ title: 'Usuário atualizado com sucesso!' });
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao atualizar usuário', description: message, variant: 'destructive' });
    }
  };

  const handleChangeUserPassword = async () => {
    if (!editingUser) return;

    // Validações
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Nova senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);

    try {
      // Usar a API admin do Supabase para alterar a senha
      const { error } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast({ title: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao alterar senha', description: message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Função para visualizar certificados do usuário
  const handleViewCertificates = async (userId: string, userName: string) => {
    try {
      const { data: certificates, error } = await supabase
        .from('certificados')
        .select(`
          *,
          cursos (
            id,
            nome,
            categoria
          )
        `)
        .eq('usuario_id', userId)
        .order('data_emissao', { ascending: false });

      if (error) {
        toast({ title: 'Erro ao carregar certificados', description: error.message, variant: 'destructive' });
        return;
      }

      setSelectedUserCertificates(certificates || []);
      setShowCertificatesModal(true);
    } catch (error) {
      toast({ title: 'Erro ao carregar certificados', description: 'Tente novamente.', variant: 'destructive' });
    }
  };

  // Função para visualizar progresso do usuário
  const handleViewProgress = async (userId: string, userName: string) => {
    try {
      // Buscar progresso do usuário com informações dos cursos
      const { data: progress, error } = await supabase
        .from('progresso_usuario')
        .select(`
          *,
          cursos (
            id,
            nome,
            categoria
          )
        `)
        .eq('usuario_id', userId)
        .order('data_atualizacao', { ascending: false });

      if (error) {
        toast({ title: 'Erro ao carregar progresso', description: error.message, variant: 'destructive' });
        return;
      }

      setSelectedUserProgress({
        userId,
        userName,
        progress: progress || []
      });
    } catch (error) {
      toast({ title: 'Erro ao carregar progresso', description: 'Tente novamente.', variant: 'destructive' });
    }
  };

  return (
    <ERALayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        {/* Hero Section com gradiente */}
        <div className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md" style={{background: 'linear-gradient(90deg, #000000 0%, #4A4A4A 40%, #34C759 100%)'}}>
          <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                    <span className="text-xs lg:text-sm font-medium text-white/90">Plataforma de Ensino</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 text-white">
                    Usuários
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 max-w-2xl">
                    Gerencie usuários e permissões da plataforma
                  </p>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Gestão completa</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Controle de acesso</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <UserCheck className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>Status dos usuários</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-white">{userStats.total}</p>
                      <p className="text-xs md:text-sm text-white/90">+{userStats.novosEstaSemana} novos esta semana</p>
                    </div>
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm md:text-lg font-semibold text-white mt-2">Total de Usuários</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-white">{userStats.ativos}</p>
                      <p className="text-xs md:text-sm text-white/90">{userStats.total > 0 ? Math.round((userStats.ativos / userStats.total) * 100) : 0}% do total</p>
                    </div>
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <UserCheck className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm md:text-lg font-semibold text-white mt-2">Usuários Ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-white">{userStats.administradores}</p>
                      <p className="text-xs md:text-sm text-white/90">{userStats.total > 0 ? Math.round((userStats.administradores / userStats.total) * 100) : 0}% do total</p>
                    </div>
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <Shield className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm md:text-lg font-semibold text-white mt-2">Administradores</p>
                </CardContent>
              </Card>
            </div>

            {/* Barra de Busca + Botão */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, login ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                />
                <Button 
                  variant="outline"
                  onClick={handleSearch}
                  className="px-3 h-10 lg:h-12 border-2 border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-700 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Buscar
                </Button>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 lg:h-12 border-2 border-gray-200 hover:border-green-500 text-gray-700 hover:text-green-700 rounded-lg transition-all duration-300 hover:scale-105">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportUsers('csv')}>
                      Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportUsers('json')}>
                      Exportar JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  onClick={() => setShowNewUserForm(!showNewUserForm)}
                  className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedUsers.length} usuário(s) selecionado(s)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('activate')}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        Ativar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('deactivate')}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                      >
                        Desativar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-700 border-red-300 hover:bg-red-50"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulário de Novo Usuário */}
            {showNewUserForm && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                  <CardTitle className="text-white font-bold">Novo Usuário</CardTitle>
                  <p className="text-sm text-white/90 font-medium">Preencha os dados do usuário</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={newUser.nome}
                        onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                        className="h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <select
                        id="tipo"
                        value={newUser.tipo}
                        onChange={(e) => setNewUser({ ...newUser, tipo: e.target.value })}
                        className="flex h-10 lg:h-12 w-full rounded-lg lg:rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-background px-3 py-2 text-sm lg:text-base transition-all duration-300"
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Admin">Administrador</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={newUser.status}
                        onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                        className="flex h-10 lg:h-12 w-full rounded-lg lg:rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-background px-3 py-2 text-sm lg:text-base transition-all duration-300"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleNewUserSubmit}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      Criar Usuário
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowNewUserForm(false)}
                      className="border-2 border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-700 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabela de Usuários */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                              <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                <CardTitle className="flex items-center gap-3 text-white font-bold text-xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <span>Lista de Usuários</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead 
                          className="font-medium text-era-black cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSort('nome')}
                        >
                          <div className="flex items-center gap-1">
                            Nome
                            {sortField === 'nome' && (
                              <span className="text-era-green">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-era-black cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-1">
                            Email
                            {sortField === 'email' && (
                              <span className="text-era-green">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-era-black cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSort('ultimo_login')}
                        >
                          <div className="flex items-center gap-1">
                            Último Login
                            {sortField === 'ultimo_login' && (
                              <span className="text-era-green">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-era-black cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSort('tipo_usuario')}
                        >
                          <div className="flex items-center gap-1">
                            Tipo
                            {sortField === 'tipo_usuario' && (
                              <span className="text-era-green">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-medium text-era-black cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSort('data_criacao')}
                        >
                          <div className="flex items-center gap-1">
                            Data Criação
                            {sortField === 'data_criacao' && (
                              <span className="text-era-green">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-medium text-era-black">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-gray-600">Carregando usuários...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                              <p className="text-sm">Tente ajustar os filtros de busca</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-era-black">{user.nome}</TableCell>
                            <TableCell className="text-era-gray-medium">{user.email}</TableCell>
                            <TableCell className="text-era-gray-medium">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-era-gray-medium" />
                                <span className={user.ultimo_login ? 'text-era-black' : 'text-era-gray-medium'}>
                                  {formatLastLogin(user.ultimo_login)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.tipo_usuario === 'admin' 
                                  ? 'bg-era-green/20 text-era-green border border-era-green/30' 
                                  : user.tipo_usuario === 'admin_master'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-era-gray-light text-era-gray-medium border border-era-gray-medium/30'
                              }`}>
                                {user.tipo_usuario === 'admin' ? 'Admin' : 
                                 user.tipo_usuario === 'admin_master' ? 'Admin Master' : 
                                 user.tipo_usuario === 'cliente' ? 'Cliente' : 
                                 user.tipo_usuario}
                              </span>
                            </TableCell>
                            <TableCell className="text-era-gray-medium">
                              {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {isMobile ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleViewCertificates(user.id, user.nome)}>
                                      <Award className="h-4 w-4 mr-2" />
                                      Ver Certificados
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewProgress(user.id, user.nome)}>
                                      <Activity className="h-4 w-4 mr-2" />
                                      Ver Progresso
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditUser(user as UserListItem)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={async () => {
                                        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
                                          try {
                                            const { error } = await supabase
                                              .from('usuarios')
                                              .delete()
                                              .eq('id', user.id);
                                            
                                            if (error) {
                                              toast({ title: 'Erro ao excluir usuário', description: error.message, variant: 'destructive' });
                                              return;
                                            }
                                            
                                            toast({ title: 'Usuário excluído com sucesso!' });
                                            fetchUsers();
                                          } catch (error) {
                                            console.error('Erro ao excluir usuário:', error);
                                            toast({ title: 'Erro ao excluir usuário', description: 'Erro interno do servidor', variant: 'destructive' });
                                          }
                                        }
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleViewCertificates(user.id, user.nome)}
                                    title="Ver Certificados"
                                    className="h-8 w-8 p-0 text-era-green hover:text-era-green/80"
                                  >
                                    <Award className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleViewProgress(user.id, user.nome)}
                                    title="Ver Progresso"
                                    className="h-8 w-8 p-0 text-era-gray-medium hover:text-era-black"
                                  >
                                    <Activity className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditUser(user as UserListItem)}
                                    title="Editar"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    title="Excluir"
                                    onClick={async () => {
                                      if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
                                        try {
                                          const { error } = await supabase
                                            .from('usuarios')
                                            .delete()
                                            .eq('id', user.id);
                                          
                                          if (error) {
                                            toast({ title: 'Erro ao excluir usuário', description: error.message, variant: 'destructive' });
                                            return;
                                          }
                                          
                                          toast({ title: 'Usuário excluído com sucesso!' });
                                          fetchUsers();
                                        } catch (error) {
                                          console.error('Erro ao excluir usuário:', error);
                                          toast({ title: 'Erro ao excluir usuário', description: 'Erro interno do servidor', variant: 'destructive' });
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-nome"
                  value={editingUser.nome}
                  onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tipo" className="text-right">
                  Tipo
                </Label>
                <select
                  id="edit-tipo"
                  value={editingUser.tipo_usuario}
                  onChange={(e) => setEditingUser({ ...editingUser, tipo_usuario: e.target.value as Database['public']['Enums']['user_type'] })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                  <option value="admin_master">Administrador Master</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <select
                  id="edit-status"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as Database['public']['Enums']['status_type'] })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
              
              {/* Seção de Alteração de Senha */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-4 text-gray-700">Alterar Senha</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-password" className="text-right">
                      Nova Senha
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirm-password" className="text-right">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangeUserPassword}
                      disabled={changingPassword || !newPassword || newPassword !== confirmPassword}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditModal(false);
              setNewPassword('');
              setConfirmPassword('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Certificados */}
      <Dialog open={showCertificatesModal} onOpenChange={setShowCertificatesModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-era-black">
              <Award className="h-5 w-5 text-era-green" />
              Certificados do Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUserCertificates.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-era-gray-medium" />
                <p className="text-lg font-medium text-era-black">Nenhum certificado encontrado</p>
                <p className="text-sm text-era-gray-medium">Este usuário ainda não possui certificados emitidos</p>
              </div>
            ) : (
              selectedUserCertificates.map((certificate, index) => (
                <Card key={index} className="border border-era-gray-light bg-white/90">
                  <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
                                      <CardTitle className="text-era-black font-bold">
                    {certificate.cursos?.nome || certificate.categoria || 'Curso'}
                  </CardTitle>
                  <CardDescription className="text-era-gray-medium">
                    Certificado #{certificate.numero_certificado || index + 1}
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-era-black">Data de Emissão:</span>
                        <p className="text-era-gray-medium">
                          {new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-era-black">Status:</span>
                        <p className={`${
                          certificate.status === 'ativo' 
                            ? 'text-era-green' 
                            : 'text-era-gray-medium'
                        }`}>
                          {certificate.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                      {certificate.nota_final && (
                        <div>
                          <span className="font-medium text-era-black">Nota:</span>
                          <p className="text-era-gray-medium">{certificate.nota_final}/100</p>
                        </div>
                      )}
                      {certificate.data_criacao && (
                        <div>
                          <span className="font-medium text-era-black">Data de Criação:</span>
                          <p className="text-era-gray-medium">
                            {new Date(certificate.data_criacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCertificatesModal(false)}
              className="border-era-gray-medium text-era-gray-medium hover:bg-era-gray-light"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Progresso */}
      <Dialog open={!!selectedUserProgress} onOpenChange={() => setSelectedUserProgress(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-era-black">
              <Activity className="h-5 w-5 text-era-gray-medium" />
              Progresso do Usuário
            </DialogTitle>
          </DialogHeader>
          {selectedUserProgress && (
            <div className="space-y-4">
              <div className="bg-era-gray-light/50 p-4 rounded-lg">
                <h3 className="font-bold text-era-black mb-2">
                  {selectedUserProgress.userName}
                </h3>
                <p className="text-sm text-era-gray-medium">
                  ID: {selectedUserProgress.userId}
                </p>
              </div>
              
              {selectedUserProgress.progress.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-era-gray-medium" />
                  <p className="text-lg font-medium text-era-black">Nenhum progresso registrado</p>
                  <p className="text-sm text-era-gray-medium">Este usuário ainda não iniciou nenhum curso</p>
                </div>
              ) : (
                selectedUserProgress.progress.map((item, index) => (
                  <Card key={index} className="border border-era-gray-light bg-white/90">
                    <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
                                          <CardTitle className="text-era-black font-bold">
                      {item.cursos?.nome || 'Curso'}
                    </CardTitle>
                    <CardDescription className="text-era-gray-medium">
                      Progresso: {item.percentual_concluido || 0}%
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-era-black">Progresso Geral:</span>
                          <span className="text-sm text-era-gray-medium">{item.percentual_concluido || 0}%</span>
                        </div>
                        <div className="w-full bg-era-gray-light rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentual_concluido || 0}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-era-black">Status:</span>
                            <p className="text-era-gray-medium">{item.status || 'Não iniciado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-era-black">Tempo Assistido:</span>
                            <p className="text-era-gray-medium">{item.tempo_total_assistido || 0} min</p>
                          </div>
                          <div>
                            <span className="font-medium text-era-black">Data de Início:</span>
                            <p className="text-era-gray-medium">
                              {item.data_inicio 
                                ? new Date(item.data_inicio).toLocaleDateString('pt-BR')
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-era-black">Última Atualização:</span>
                            <p className="text-era-gray-medium">
                              {new Date(item.data_atualizacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedUserProgress(null)}
              className="border-era-gray-medium text-era-gray-medium hover:bg-era-gray-light"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ERALayout>
  );
};

export default Usuarios;
