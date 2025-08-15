import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface UsersFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  onNewUserClick: () => void;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  onNewUserClick
}) => (
  <div className="mb-2">
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 flex-1">
        <Search className="h-4 w-4 text-era-gray" />
        <Input
          placeholder="Buscar por nome, login ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <select
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={selectedRole}
        onChange={e => setSelectedRole(e.target.value)}
      >
        <option value="">Todos os tipos</option>
        <option value="admin">Administrador</option>
        <option value="cliente">Cliente</option>
        <option value="admin_master">Admin Master</option>
      </select>
      <select
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={selectedStatus}
        onChange={e => setSelectedStatus(e.target.value)}
      >
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <Button 
        className="era-green-button"
        onClick={onNewUserClick}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </div>
  </div>
);

export default UsersFilters; 