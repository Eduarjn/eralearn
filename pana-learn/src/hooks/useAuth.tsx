import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: 'admin' | 'admin_master' | 'cliente'; // Adicionado 'admin_master'
  status: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | { message: string } | null }>;
  signUp: (email: string, password: string, nome: string, tipo_usuario: 'admin' | 'cliente', senha_validacao: string) => Promise<{ error: Error | { message: string } | null }>;
  signOut: () => Promise<void>;
  createTestUsers: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | { message: string } | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | { message: string } | null }>;
  updateAvatar: (avatarUrl: string) => Promise<{ error: Error | { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState("cliente");
  const [senhaValidacao, setSenhaValidacao] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Usuários de teste
  const testUsers = [
    {
      id: 'test-admin-id',
      email: 'admin@eralearn.com',
      nome: 'Administrador ERA',
      tipo_usuario: 'admin' as const,
      senha: 'test123456',
      status: 'ativo'
    },
    {
      id: 'test-client-id',
      email: 'cliente@eralearn.com',
      nome: 'Cliente Teste',
      tipo_usuario: 'cliente' as const,
      senha: 'test123456',
      status: 'ativo'
    }
  ];

  const createTestUsers = async () => {
    console.log('👥 Usuários de teste disponíveis:');
    testUsers.forEach(user => {
      console.log(`✅ ${user.email} - Senha: ${user.senha}`);
    });
  };

  useEffect(() => {
    let mounted = true;
    console.log('🔄 Inicializando AuthProvider...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email);
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se não há sessão, verificar se há usuário de teste
        if (!session && !user) {
          console.log('🔐 Nenhuma sessão ativa, verificando usuários de teste...');
        }

        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const { data: profile, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              if (error) {
                const testUser = testUsers.find(u => u.email === session.user.email);
                if (testUser) {
                  setUserProfile({
                    id: testUser.id,
                    email: testUser.email,
                    nome: testUser.nome,
                    tipo_usuario: testUser.tipo_usuario,
                    status: testUser.status
                  });
                }
              } else {
                setUserProfile(profile);
              }
            } catch (err) {
              console.log('⚠️ Erro ao buscar perfil:', err);
            }
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted && !error) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Carregar perfil do usuário se houver sessão
          if (session?.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              if (!profileError && profile) {
                console.log('✅ Perfil carregado:', profile);
                setUserProfile(profile);
              } else {
                console.log('⚠️ Erro ao carregar perfil:', profileError);
                // Verificar se é um usuário de teste
                const testUser = testUsers.find(u => u.email === session.user.email);
                if (testUser) {
                  console.log('✅ Usando perfil de teste:', testUser);
                  setUserProfile({
                    id: testUser.id,
                    email: testUser.email,
                    nome: testUser.nome,
                    tipo_usuario: testUser.tipo_usuario,
                    status: testUser.status
                  });
                }
              }
            } catch (err) {
              console.log('⚠️ Erro ao buscar perfil:', err);
            }
          }
        }
        if (mounted) setLoading(false);
      } catch (error) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();
    createTestUsers();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Obter informações do navegador para o log
      const userAgent = navigator.userAgent;
      const ipAddress = null; // Em produção, você pode obter o IP do servidor
      
      // Login no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Registrar tentativa de login falhada
        try {
          const { data: userData } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();
          
          if (userData?.id) {
            await supabase
              .from('login_logs')
              .insert({
                usuario_id: userData.id,
                email: email,
                ip_address: ipAddress,
                user_agent: userAgent,
                success: false,
                error_message: error.message
              });
          }
        } catch (logError) {
          console.error('Erro ao registrar log de login falhado:', logError);
        }
        
        let errorMessage = 'Credenciais inválidas';
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada';
        }
        return { error: { message: errorMessage } };
      }
      
      // Login bem-sucedido - buscar perfil e registrar log
      if (data?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profile) {
          setUserProfile(profile);
          
          // Registrar log de login bem-sucedido
          try {
            await supabase
              .from('login_logs')
              .insert({
                usuario_id: data.user.id,
                email: email,
                ip_address: ipAddress,
                user_agent: userAgent,
                success: true,
                error_message: null
              });
          } catch (logError) {
            console.error('Erro ao registrar log de login:', logError);
          }
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Erro interno no sistema' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, tipo_usuario: 'admin' | 'cliente', senha_validacao: string) => {
    try {
      setLoading(true);
      if (!nome || nome.trim() === '') {
        return { error: { message: 'Nome é obrigatório' } };
      }
      if (password.length < 6) {
        return { error: { message: 'Senha deve ter pelo menos 6 caracteres' } };
      }
      const redirectUrl = `${window.location.origin}/`;
      
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: nome.trim(),
            tipo_usuario: tipo_usuario
          }
        }
      });
      
      if (error) {
        let errorMessage = 'Erro ao criar conta';
        if (error.message?.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = 'Email inválido';
        } else if (error.message?.includes('Password should be at least')) {
          errorMessage = 'Senha deve ter pelo menos 6 caracteres';
        }
        return { error: { message: errorMessage } };
      }
      
      // ✅ CORREÇÃO: Remover inserção manual redundante
      // O trigger handle_new_user deve criar automaticamente o registro na tabela usuarios
      // Se o trigger falhar, o erro será capturado pelo próprio Supabase Auth
      
      console.log('✅ Usuário criado no Auth, aguardando trigger handle_new_user...');
      return { error: null };
      
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error: { message: 'Erro interno no sistema' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUserProfile(null);
      setUser(null);
      setSession(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!userProfile?.id) {
        return { error: { message: 'Usuário não encontrado' } };
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userProfile.id);

      if (error) {
        return { error: { message: 'Erro ao atualizar perfil: ' + error.message } };
      }

      // Atualizar o estado local
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);

      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: { message: 'Erro interno ao atualizar perfil' } };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!userProfile?.email) {
        return { error: { message: 'Usuário não encontrado' } };
      }

      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: currentPassword
      });

      if (signInError) {
        return { error: { message: 'Senha atual incorreta' } };
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        return { error: { message: 'Erro ao alterar senha: ' + error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { error: { message: 'Erro interno ao alterar senha' } };
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      if (!userProfile?.id) {
        return { error: { message: 'Usuário não encontrado' } };
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ avatar_url: avatarUrl })
        .eq('id', userProfile.id);

      if (error) {
        return { error: { message: 'Erro ao atualizar avatar: ' + error.message } };
      }

      // Atualizar o estado local
      setUserProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);

      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      return { error: { message: 'Erro interno ao atualizar avatar' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    initialized,
    signIn,
    signUp,
    signOut,
    createTestUsers,
    updateProfile,
    updatePassword,
    updateAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}