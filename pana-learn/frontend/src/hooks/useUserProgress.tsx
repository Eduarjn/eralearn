import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface UserProgress {
    id: string
    usuario_id: string
    curso_id: string
    progresso: number
    concluido: boolean
    tempo_assistido: number
    created_at: string
    updated_at: string
    curso?: {
        id: string
        titulo: string
        descricao: string
    }
}

export const useUserProgress = (empresaId?: string, tipoUsuario?: string) => {
    return useQuery({
        queryKey: ["userProgress", empresaId, tipoUsuario],
        queryFn: async (): Promise<UserProgress[]> => {
            if (!empresaId) {
                return []
            }

            const { data, error } = await supabase
                .from("progresso_usuario")
                .select(`
          *,
          curso:cursos(
            id,
            titulo,
            descricao
          )
        `)
                .eq("empresa_id", empresaId)

            if (error) {
                console.error("Erro ao buscar progresso do usuário:", error)
                throw error
            }

            return data || []
        },
        enabled: !!empresaId,
    })
}
