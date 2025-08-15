
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  status: 'ativo' | 'inativo' | 'em_breve';
  imagem_url: string | null;
  categoria_id: string | null;
  ordem: number | null;
  categorias?: {
    nome: string;
    cor: string;
  };
}

export interface Module {
  id: string;
  nome_modulo: string;
  descricao: string | null;
  duracao: number | null;
  ordem: number | null;
  curso_id: string;
  link_video: string | null;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('🔍 Buscando cursos...');
      
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select(`
            *,
            categorias (
              nome,
              cor
            )
          `)
          .eq('status', 'ativo')
          .order('ordem', { ascending: true });

        if (error) {
          console.error('❌ Erro ao buscar cursos:', error);
          throw error;
        }

        console.log('✅ Cursos encontrados:', data?.length || 0);
        console.log('📋 Dados dos cursos:', data);
        
        return (data || []) as Course[];
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar cursos:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCourseModules = (courseId: string) => {
  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      console.log('🔍 Buscando módulos para o curso:', courseId);
      
      try {
        const { data, error } = await supabase
          .from('modulos')
          .select('*')
          .eq('curso_id', courseId)
          .order('ordem', { ascending: true });

        if (error) {
          console.error('❌ Erro ao buscar módulos:', error);
          throw error;
        }

        console.log('✅ Módulos encontrados:', data?.length || 0);
        return (data || []) as Module[];
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar módulos:', error);
        throw error;
      }
    },
    enabled: !!courseId,
    retry: 2,
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      console.log('🔍 Buscando progresso do usuário...');
      
      try {
        const { data, error } = await supabase
          .from('progresso_usuario')
          .select(`
            *,
            cursos (
              nome,
              categoria
            )
          `);

        if (error) {
          console.error('❌ Erro ao buscar progresso:', error);
          throw error;
        }

        console.log('✅ Progresso encontrado:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar progresso:', error);
        throw error;
      }
    },
    retry: 2,
  });
};

// Hook para testar conectividade com tabelas
export const useTestConnection = () => {
  return useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      console.log('🔧 Testando conectividade com as tabelas...');
      
      const results = {
        cursos: 0,
        categorias: 0,
        modulos: 0,
        usuarios: 0,
        progresso_usuario: 0,
        certificados: 0,
        avaliacoes: 0,
        videos: 0
      };

      try {
        // Testar cada tabela
        const tableNames = ['cursos', 'categorias', 'modulos', 'usuarios', 'progresso_usuario', 'certificados', 'avaliacoes', 'videos'] as const;
        
        for (const tableName of tableNames) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('id', { count: 'exact' })
              .limit(1);
            
            if (error) {
              console.error(`❌ Erro na tabela ${tableName}:`, error);
            } else {
              results[tableName] = data?.length || 0;
              console.log(`✅ Tabela ${tableName}: ${data?.length || 0} registros`);
            }
          } catch (err) {
            console.error(`❌ Erro inesperado na tabela ${tableName}:`, err);
          }
        }

        console.log('📊 Resultado do teste de conectividade:', results);
        return results;
      } catch (error) {
        console.error('❌ Erro geral no teste de conectividade:', error);
        throw error;
      }
    },
    retry: 1,
  });
};
