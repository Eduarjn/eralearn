import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['usuarios']['Row'];
type DomainUser = Database['public']['Tables']['domain_default_users']['Row'];

interface CreateUserData {
  nome: string;
  email: string;
  tipo_usuario: 'cliente' | 'admin' | 'admin_master';
  senha?: string;
}

interface UseDomainUsersReturn {
  users: User[];
  domainUsers: DomainUser[];
  loading: boolean;
  error: string | null;
  createUser: (domainId: string, userData: CreateUserData) => Promise<{ success: boolean; message: string; password?: string }>;
  fetchUsersByDomain: (domainId: string) => Promise<void>;
  setupDefaultUsers: (domainId: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

export function useDomainUsers(): UseDomainUsersReturn {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [domainUsers, setDomainUsers] = useState<DomainUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se é admin_master
  const isAdminMaster = userProfile?.tipo_usuario === 'admin_master';

  const fetchUsersByDomain = async (domainId: string) => {
    if (!isAdminMaster) {
      setError('Apenas admin_master pode gerenciar usuários por domínio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('domain_id', domainId)
        .order('nome');

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários do domínio:', err);
      setError('Erro ao carregar usuários do domínio');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (domainId: string, userData: CreateUserData): Promise<{ success: boolean; message: string; password?: string }> => {
    if (!isAdminMaster) {
      return { success: false, message: 'Apenas admin_master pode criar usuários' };
    }

    setLoading(true);
    setError(null);

    try {
      // Gerar senha se não fornecida
      const senha = userData.senha || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2);
      
      // Hash da senha
      const { data: hashData, error: hashError } = await supabase.rpc('crypt', {
        password: senha,
        salt: 'bf'
      });

      if (hashError) {
        throw new Error('Erro ao gerar hash da senha');
      }

      // Inserir usuário
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nome: userData.nome,
          email: userData.email,
          tipo_usuario: userData.tipo_usuario,
          status: 'ativo',
          domain_id: domainId,
          senha_hashed: hashData || senha // Fallback se RPC não funcionar
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // unique_violation
          throw new Error('Email já existe no sistema');
        }
        throw error;
      }

      // Atualizar lista de usuários
      await fetchUsersByDomain(domainId);

      return { 
        success: true, 
        message: `Usuário ${userData.nome} criado com sucesso!`, 
        password: senha 
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar usuário';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const setupDefaultUsers = async (domainId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdminMaster) {
      return { success: false, message: 'Apenas admin_master pode configurar usuários padrão' };
    }

    setLoading(true);
    setError(null);

    try {
      // Chamar função SQL para criar usuários padrão
      const { data, error } = await supabase.rpc('setup_domain_default_users', {
        domain_uuid: domainId
      });

      if (error) {
        throw error;
      }

      // Atualizar lista de usuários
      await fetchUsersByDomain(domainId);

      return { 
        success: true, 
        message: data || 'Usuários padrão configurados com sucesso!' 
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao configurar usuários padrão';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdminMaster) {
      return { success: false, message: 'Apenas admin_master pode deletar usuários' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Atualizar lista de usuários
      setUsers(prev => prev.filter(user => user.id !== userId));

      return { success: true, message: 'Usuário deletado com sucesso!' };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar usuário';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!isAdminMaster) {
      return { success: false, message: 'Apenas admin_master pode atualizar usuários' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Atualizar lista de usuários
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));

      return { success: true, message: 'Usuário atualizado com sucesso!' };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    domainUsers,
    loading,
    error,
    createUser,
    fetchUsersByDomain,
    setupDefaultUsers,
    deleteUser,
    updateUser
  };
} 