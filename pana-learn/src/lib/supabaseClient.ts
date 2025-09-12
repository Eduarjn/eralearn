import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig as getConfig } from '@/config/supabase';

// Obter configuração com fallback
const config = getConfig();
const storageProvider = config.storageProvider;
const mode = config.appMode;
const isLocal = mode === 'local';
const isStandalone = mode === 'standalone';

// Variáveis para export
let supabase: any;
let getSupabaseConfig: () => any;
let isSupabaseLocal: () => boolean;
let isSupabaseCloud: () => boolean;

if (isStandalone) {
  // ========================================
  // MODO STANDALONE (100% LOCAL)
  // ========================================
  console.log('🏠 Modo STANDALONE ativado - usando backend local');
  
  // Cliente standalone
  class StandaloneClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string = 'http://localhost:3001') {
      this.baseUrl = baseUrl;
      this.loadToken();
    }

    private loadToken() {
      this.token = localStorage.getItem('era_auth_token');
    }

    private saveToken(token: string) {
      this.token = token;
      localStorage.setItem('era_auth_token', token);
    }

    private clearToken() {
      this.token = null;
      localStorage.removeItem('era_auth_token');
    }

    private getHeaders() {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      return headers;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
      try {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
          headers: this.getHeaders(),
          ...options,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return { data, error: null };
      } catch (error) {
        console.error('Erro na requisição:', error);
        return { data: null, error: (error as Error).message };
      }
    }

    auth = {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const result = await this.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (result.data?.session?.access_token) {
          this.saveToken(result.data.session.access_token);
        }

        return {
          data: {
            user: result.data?.user || null,
            session: result.data?.session || null,
          },
          error: result.error,
        };
      },

      signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
        const nome = options?.data?.nome || email.split('@')[0];
        const tipo_usuario = options?.data?.tipo_usuario || 'cliente';
        const domain_id = options?.data?.domain_id;

        const result = await this.request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, nome, tipo_usuario, domain_id }),
        });

        return {
          data: {
            user: result.data?.user || null,
            session: null,
          },
          error: result.error,
        };
      },

      signOut: async () => {
        const result = await this.request('/api/auth/logout', {
          method: 'POST',
        });

        this.clearToken();

        return { error: result.error };
      },

      getSession: async () => {
        if (!this.token) {
          return { data: { session: null }, error: null };
        }

        const result = await this.request('/api/auth/session');

        if (result.error) {
          this.clearToken();
          return { data: { session: null }, error: result.error };
        }

        return {
          data: { session: result.data?.session || null },
          error: null,
        };
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        const checkSession = async () => {
          const { data } = await this.auth.getSession();
          callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
        };

        checkSession();

        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
    };

    from(table: string) {
      return {
        select: (columns: string = '*') => ({
          eq: async (column: string, value: any) => {
            const result = await this.request(`/api/${table}?${column}=${encodeURIComponent(value)}&select=${columns}`);
            return result;
          },

          neq: async (column: string, value: any) => {
            const result = await this.request(`/api/${table}?${column}=neq.${encodeURIComponent(value)}&select=${columns}`);
            return result;
          },

          in: async (column: string, values: any[]) => {
            const result = await this.request(`/api/${table}?${column}=in.(${values.map(v => encodeURIComponent(v)).join(',')})&select=${columns}`);
            return result;
          },

          order: (column: string, options?: { ascending?: boolean }) => ({
            limit: async (count: number) => {
              const order = options?.ascending === false ? 'desc' : 'asc';
              const result = await this.request(`/api/${table}?select=${columns}&order=${column}.${order}&limit=${count}`);
              return result;
            },
          }),

          limit: async (count: number) => {
            const result = await this.request(`/api/${table}?select=${columns}&limit=${count}`);
            return result;
          },

          single: async () => {
            const result = await this.request(`/api/${table}?select=${columns}&limit=1`);
            return {
              data: result.data?.[0] || null,
              error: result.error,
            };
          },
        }),

        insert: async (data: any) => {
          const result = await this.request(`/api/${table}`, {
            method: 'POST',
            body: JSON.stringify(data),
          });
          return result;
        },

        update: (data: any) => ({
          eq: async (column: string, value: any) => {
            const result = await this.request(`/api/${table}/${value}`, {
              method: 'PUT',
              body: JSON.stringify(data),
            });
            return result;
          },
        }),

        delete: () => ({
          eq: async (column: string, value: any) => {
            const result = await this.request(`/api/${table}/${value}`, {
              method: 'DELETE',
            });
            return result;
          },
        }),
      };
    }

    async rpc(functionName: string, params: any = {}) {
      const result = await this.request('/api/rpc', {
        method: 'POST',
        body: JSON.stringify({ function: functionName, params }),
      });
      return result;
    }

    storage = {
      from: (bucket: string) => ({
        upload: async (path: string, file: File | Blob) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          formData.append('bucket', bucket);

          const response = await fetch(`${this.baseUrl}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': this.token ? `Bearer ${this.token}` : '',
            },
            body: formData,
          });

          const data = await response.json();

          return {
            data: response.ok ? data : null,
            error: response.ok ? null : data.error,
          };
        },

        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `${this.baseUrl}/uploads/${bucket}/${path}`,
          },
        }),

        download: async (path: string) => {
          const response = await fetch(`${this.baseUrl}/uploads/${bucket}/${path}`, {
            headers: this.getHeaders(),
          });

          return {
            data: response.ok ? await response.blob() : null,
            error: response.ok ? null : 'Erro ao fazer download',
          };
        },

        list: async (folder?: string) => {
          const result = await this.request(`/api/upload/${bucket}/list${folder ? `?folder=${folder}` : ''}`);
          return result;
        },

        remove: async (paths: string[]) => {
          const result = await this.request(`/api/upload/${bucket}`, {
            method: 'DELETE',
            body: JSON.stringify({ paths }),
          });
          return result;
        },
      }),

      listBuckets: async () => {
        const result = await this.request('/api/upload/buckets');
        return result;
      },
    };
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const standaloneClient = new StandaloneClient(API_URL);

  supabase = standaloneClient;
  getSupabaseConfig = () => ({ mode: 'standalone', isLocal: true, url: API_URL, storageProvider });
  isSupabaseLocal = () => true;
  isSupabaseCloud = () => false;

} else if (isLocal) {
  // ========================================
  // MODO LOCAL (SIMULAÇÃO EM MEMÓRIA)
  // ========================================
  console.log('🏠 Modo LOCAL ativado - usando simulação em memória');
  
  // Simulação do Supabase para desenvolvimento local
  const localData = {
    branding_config: [{
      id: '1',
      logo_url: '/logotipoeralearn.png',
      sub_logo_url: '/era-sub-logo.png',
      favicon_url: '/favicon.ico',
      background_url: '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
      primary_color: '#CCFF00',
      secondary_color: '#232323',
      company_name: 'ERA Learn Local',
      company_slogan: 'Smart Training - Local Mode',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }],
    usuarios: [{
      id: '1',
      email: 'admin@local.com',
      nome: 'Admin Local',
      tipo_usuario: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }],
    cursos: [{
      id: '1',
      titulo: 'Curso Local',
      descricao: 'Curso de exemplo em modo local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }],
    videos: [],
    video_progress: []
  };

  // Mock do cliente Supabase
  const mockSupabase = {
    from: (table: string) => ({
      select: (fields = '*') => ({
        eq: (column: string, value: any) => Promise.resolve({ data: (localData as any)[table]?.filter((item: any) => item[column] === value) || [], error: null }),
        single: () => Promise.resolve({ data: (localData as any)[table]?.[0] || null, error: null }),
        limit: (count: number) => Promise.resolve({ data: (localData as any)[table]?.slice(0, count) || [], error: null }),
        then: (resolve: any) => resolve({ data: (localData as any)[table] || [], error: null })
      }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          const item = (localData as any)[table]?.find((item: any) => item[column] === value);
          if (item) {
            Object.assign(item, { ...data, updated_at: new Date().toISOString() });
          }
          return Promise.resolve({ data: item, error: null });
        }
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    }),
    rpc: (functionName: string, params = {}) => {
      if (functionName === 'get_branding_config') {
        return Promise.resolve({ 
          data: { success: true, data: localData.branding_config[0] }, 
          error: null 
        });
      }
      if (functionName === 'update_branding_config') {
        Object.assign(localData.branding_config[0], params, { updated_at: new Date().toISOString() });
        return Promise.resolve({ 
          data: { success: true, message: 'Configuração atualizada com sucesso' }, 
          error: null 
        });
      }
      return Promise.resolve({ data: null, error: null });
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: (bucket: string) => ({
        list: () => Promise.resolve({ data: [], error: null }),
        upload: (path: string, file: any) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/storage/${bucket}/${path}` } }),
        download: (path: string) => Promise.resolve({ data: new Blob(), error: null })
      }),
      listBuckets: () => Promise.resolve({ data: [{ name: 'training-videos' }], error: null })
    }
  };

  supabase = mockSupabase;
  getSupabaseConfig = () => ({ mode: 'local', isLocal: true, url: 'local-simulation', storageProvider });
  isSupabaseLocal = () => true;
  isSupabaseCloud = () => false;

} else {
  // ========================================
  // MODO CLOUD (SUPABASE PADRÃO)
  // ========================================
  console.log('☁️ Modo SUPABASE ativado - usando Supabase Cloud');
  
  const url = config.url;
  const anonKey = config.anonKey;
  
  if (!url || !anonKey) {
    console.error('❌ Variáveis do Supabase não configuradas');
    console.error('URL:', url);
    console.error('AnonKey:', anonKey ? 'Definida' : 'Não definida');
    throw new Error('Supabase configuration missing');
  }
  
  console.log('🔧 Configuração Supabase:', {
    url: url,
    anonKeyLength: anonKey?.length || 0,
    storageProvider: storageProvider
  });

  supabase = createClient(url, anonKey, {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: import.meta.env.SUPABASE_DB_SCHEMA || 'public'
    }
  });

  getSupabaseConfig = () => ({ mode: 'cloud', isLocal: false, url, storageProvider });
  isSupabaseLocal = () => false;
  isSupabaseCloud = () => true;
}

export { supabase, getSupabaseConfig, isSupabaseLocal, isSupabaseCloud };
export default supabase;