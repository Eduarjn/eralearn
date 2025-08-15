
import { ERALayout } from '@/components/ERALayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, UserPlus, Edit } from 'lucide-react';
import { useState } from 'react';

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    login: '',
    tipo: 'Cliente',
    status: 'Ativo'
  });

  const [users] = useState([
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@empresa.com',
      login: 'joao.silva',
      tipo: 'Administrador',
      status: 'Ativo',
      dataCadastro: '2024-01-15',
      ultimoAcesso: '2024-06-18'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@empresa.com',
      login: 'maria.santos',
      tipo: 'Cliente',
      status: 'Ativo',
      dataCadastro: '2024-01-10',
      ultimoAcesso: '2024-06-17'
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@empresa.com',
      login: 'pedro.costa',
      tipo: 'Cliente',
      status: 'Inativo',
      dataCadastro: '2024-02-01',
      ultimoAcesso: '2024-05-20'
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewUserSubmit = () => {
    console.log('Novo usuário:', newUser);
    setShowNewUserForm(false);
    setNewUser({ nome: '', email: '', login: '', tipo: 'Cliente', status: 'Ativo' });
  };

  return (
    <ERALayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-era-dark-blue">Usuários</h1>
          <p className="text-era-gray">Gerencie usuários e permissões do sistema</p>
        </div>

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-era-dark-blue">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Usuários
              </span>
              <Button 
                className="era-lime-button"
                onClick={() => setShowNewUserForm(!showNewUserForm)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-era-gray" />
              <Input
                placeholder="Buscar por nome, login ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* New User Form */}
        {showNewUserForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-era-dark-blue">
                <UserPlus className="h-5 w-5" />
                Cadastrar Novo Usuário
              </CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar um novo usuário no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="Digite o nome completo"
                    value={newUser.nome}
                    onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    placeholder="nome.sobrenome"
                    value={newUser.login}
                    onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Usuário</Label>
                  <select
                    id="tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newUser.tipo}
                    onChange={(e) => setNewUser({ ...newUser, tipo: e.target.value })}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="era-lime-button" onClick={handleNewUserSubmit}>
                  Cadastrar Usuário
                </Button>
                <Button variant="outline" onClick={() => setShowNewUserForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-era-dark-blue">Usuários Cadastrados ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.login}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.tipo === 'Administrador' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.tipo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{user.dataCadastro}</TableCell>
                      <TableCell>{user.ultimoAcesso}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERALayout>
  );
};

export default Usuarios;
