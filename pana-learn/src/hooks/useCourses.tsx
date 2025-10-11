import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface Course {
    id: string
    nome: string
    categoria: string
    descricao: string | null
    status: "ativo" | "inativo" | "em_breve"
    imagem_url: string | null
    categoria_id: string | null
    ordem: number | null
    categorias?: {
        nome: string
        cor: string
    }
}

export interface Module {
    id: string
    nome_modulo: string
    descricao: string | null
    duracao: number | null
    ordem: number | null
    curso_id: string
    link_video: string | null
}

export const useCourses = (empresaId?: string, tipoUsuario?: string) => {
    return useQuery({
        queryKey: ["courses", empresaId, tipoUsuario],
        queryFn: async () => {
            if (import.meta.env.DEV) {
                console.log("Fetching courses...")
            }
            try {
                // Consulta filtrando por empresa_id, exceto admin_master
                let query = supabase
                    .from("cursos")
                    .select(`*, categorias (nome, cor)`)
                    .eq("status", "ativo")
                    .order("ordem", { ascending: true })
                if (empresaId && tipoUsuario !== "admin_master") {
                    query = query.eq("empresa_id", empresaId)
                }
                const { data, error } = await query
                if (error) {
                    console.error("Error fetching courses:", error)
                    throw error
                }
                return (data || []) as Course[]
            } catch (error) {
                console.error("Unexpected error fetching courses:", error)
                throw error
            }
        },
        retry: 3,
        retryDelay: 1000,
    })
}

export const useCourseModules = (courseId: string) => {
    return useQuery({
        queryKey: ["course-modules", courseId],
        queryFn: async () => {
            if (import.meta.env.DEV) {
                console.log("Fetching modules for course:", courseId)
            }

            try {
                // Primeiro, verificar se o curso tem os módulos padrão
                const { data: currentModules, error: modulesError } = await supabase
                    .from("modulos")
                    .select("*")
                    .eq("curso_id", courseId)
                    .order("ordem", { ascending: true })

                if (modulesError) {
                    console.error("Error fetching modules:", modulesError)
                    throw modulesError
                }

                if (import.meta.env.DEV) {
                    console.log("Current modules found:", currentModules?.length || 0)
                }

                // Verificar se tem os módulos padrão
                const hasUsabilidade = currentModules?.some((m) => m.nome_modulo === "Usabilidade")
                const hasConfiguracao = currentModules?.some((m) => m.nome_modulo === "Configuração")
                const hasOldModules = currentModules?.some((m) => !["Usabilidade", "Configuração"].includes(m.nome_modulo))

                // Se não tem os módulos padrão ou tem módulos antigos, padronizar
                if (!hasUsabilidade || !hasConfiguracao || hasOldModules) {
                    if (import.meta.env.DEV) {
                        console.log("Standardizing modules for course:", courseId)
                    }

                    try {
                        // Buscar informações do curso
                        const { data: courseData, error: courseError } = await supabase
                            .from("cursos")
                            .select("id, nome, categoria")
                            .eq("id", courseId)
                            .single()

                        if (courseError || !courseData) {
                            console.error("Error fetching course:", courseError)
                            throw courseError
                        }

                        if (import.meta.env.DEV) {
                            console.log("Course information:", courseData)
                        }

                        // Tentar remover módulos antigos de forma mais segura
                        if (hasOldModules) {
                            if (import.meta.env.DEV) {
                                console.log("Removing old modules...")
                            }

                            // Remover apenas módulos que não são padrão
                            const { error: deleteError } = await supabase
                                .from("modulos")
                                .delete()
                                .eq("curso_id", courseId)
                                .not("nome_modulo", "in", `(${"Usabilidade"},${"Configuração"})`)

                            if (deleteError) {
                                console.error("Error removing old modules:", deleteError)
                                // Continuar mesmo com erro, não falhar completamente
                            } else if (import.meta.env.DEV) {
                                console.log("Old modules removed")
                            }
                        }

                        // Verificar se já tem os módulos padrão após limpeza
                        const { data: cleanedModules, error: checkError } = await supabase
                            .from("modulos")
                            .select("nome_modulo")
                            .eq("curso_id", courseId)

                        if (checkError) {
                            console.error("Error checking modules after cleanup:", checkError)
                        } else {
                            const hasUsabilidadeAfter = cleanedModules?.some((m) => m.nome_modulo === "Usabilidade")
                            const hasConfiguracaoAfter = cleanedModules?.some((m) => m.nome_modulo === "Configuração")

                            // Se ainda não tem os módulos padrão, criar
                            if (!hasUsabilidadeAfter || !hasConfiguracaoAfter) {
                                if (import.meta.env.DEV) {
                                    console.log("Creating standard modules...")
                                }

                                const modulesToInsert = []

                                if (!hasUsabilidadeAfter) {
                                    modulesToInsert.push({
                                        curso_id: courseId,
                                        nome_modulo: "Usabilidade",
                                        descricao: `Módulo focado na usabilidade e experiência do usuário do ${courseData.nome}`,
                                        ordem: 1,
                                        duracao: 0,
                                    })
                                }

                                if (!hasConfiguracaoAfter) {
                                    modulesToInsert.push({
                                        curso_id: courseId,
                                        nome_modulo: "Configuração",
                                        descricao: `Módulo focado na configuração e setup do ${courseData.nome}`,
                                        ordem: 2,
                                        duracao: 0,
                                    })
                                }

                                if (modulesToInsert.length > 0) {
                                    const { data: newModules, error: insertError } = await supabase
                                        .from("modulos")
                                        .insert(modulesToInsert)
                                        .select()

                                    if (insertError) {
                                        console.error("Error inserting standard modules:", insertError)
                                        throw insertError
                                    }

                                    if (import.meta.env.DEV) {
                                        console.log("Standard modules created:", newModules)
                                    }
                                }
                            }
                        }

                        // Buscar módulos finais
                        const { data: finalModules, error: finalError } = await supabase
                            .from("modulos")
                            .select("*")
                            .eq("curso_id", courseId)
                            .order("ordem", { ascending: true })

                        if (finalError) {
                            console.error("Error fetching final modules:", finalError)
                            throw finalError
                        }

                        if (import.meta.env.DEV) {
                            console.log("Final standardized modules:", finalModules)
                        }
                        return (finalModules || []) as Module[]
                    } catch (error) {
                        console.error("Error during standardization:", error)
                        // Retornar módulos atuais em caso de erro
                        return (currentModules || []) as Module[]
                    }
                } else {
                    if (import.meta.env.DEV) {
                        console.log("Modules already standardized")
                    }
                    return (currentModules || []) as Module[]
                }
            } catch (error) {
                console.error("Unexpected error fetching modules:", error)
                throw error
            }
        },
        enabled: !!courseId,
        retry: 2,
    })
}

export const useUserProgress = () => {
    return useQuery({
        queryKey: ["user-progress"],
        queryFn: async () => {
            if (import.meta.env.DEV) {
                console.log("Fetching user progress...")
            }

            try {
                const { data, error } = await supabase.from("progresso_usuario").select(`
            *,
            cursos (
              nome,
              categoria
            )
          `)

                if (error) {
                    console.error("Error fetching progress:", error)
                    throw error
                }

                if (import.meta.env.DEV) {
                    console.log("Progress found:", data?.length || 0)
                }
                return data || []
            } catch (error) {
                console.error("Unexpected error fetching progress:", error)
                throw error
            }
        },
        retry: 2,
    })
}

// Hook para testar conectividade com tabelas
export const useTestConnection = () => {
    return useQuery({
        queryKey: ["test-connection"],
        queryFn: async () => {
            if (import.meta.env.DEV) {
                console.log("Testing table connectivity...")
            }

            const results = {
                cursos: 0,
                categorias: 0,
                modulos: 0,
                usuarios: 0,
                progresso_usuario: 0,
                certificados: 0,
                avaliacoes: 0,
                videos: 0,
            }

            try {
                // Testar cada tabela
                const tableNames = [
                    "cursos",
                    "categorias",
                    "modulos",
                    "usuarios",
                    "progresso_usuario",
                    "certificados",
                    "avaliacoes",
                    "videos",
                ] as const

                for (const tableName of tableNames) {
                    try {
                        const { data, error } = await supabase.from(tableName).select("id", { count: "exact" }).limit(1)

                        if (error) {
                            console.error(`Error in table ${tableName}:`, error)
                        } else {
                            results[tableName] = data?.length || 0
                            if (import.meta.env.DEV) {
                                console.log(`Table ${tableName}: ${data?.length || 0} records`)
                            }
                        }
                    } catch (err) {
                        console.error(`Unexpected error in table ${tableName}:`, err)
                    }
                }

                if (import.meta.env.DEV) {
                    console.log("Connectivity test result:", results)
                }
                return results
            } catch (error) {
                console.error("General error in connectivity test:", error)
                throw error
            }
        },
        retry: 1,
    })
}
