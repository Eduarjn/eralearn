export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            avaliacoes: {
                Row: {
                    comentario: string | null
                    curso_id: string
                    data: string
                    id: string
                    nota: number | null
                    usuario_id: string
                }
                Insert: {
                    comentario?: string | null
                    curso_id: string
                    data?: string
                    id?: string
                    nota?: number | null
                    usuario_id: string
                }
                Update: {
                    comentario?: string | null
                    curso_id?: string
                    data?: string
                    id?: string
                    nota?: number | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "avaliacoes_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "avaliacoes_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            categorias: {
                Row: {
                    cor: string | null
                    data_atualizacao: string
                    data_criacao: string
                    descricao: string | null
                    id: string
                    nome: string
                }
                Insert: {
                    cor?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    id?: string
                    nome: string
                }
                Update: {
                    cor?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    id?: string
                    nome?: string
                }
                Relationships: []
            }
            certificados: {
                Row: {
                    curso_id: string
                    data_criacao: string
                    data_emissao: string
                    id: string
                    link_pdf_certificado: string | null
                    nota_final: number | null
                    numero_certificado: string | null
                    usuario_id: string
                }
                Insert: {
                    curso_id: string
                    data_criacao?: string
                    data_emissao?: string
                    id?: string
                    link_pdf_certificado?: string | null
                    nota_final?: number | null
                    numero_certificado?: string | null
                    usuario_id: string
                }
                Update: {
                    curso_id?: string
                    data_criacao?: string
                    data_emissao?: string
                    id?: string
                    link_pdf_certificado?: string | null
                    nota_final?: number | null
                    numero_certificado?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "certificados_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "certificados_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            cursos: {
                Row: {
                    categoria: string
                    categoria_id: string | null
                    data_atualizacao: string
                    data_criacao: string
                    data_fim: string | null
                    data_inicio: string | null
                    descricao: string | null
                    id: string
                    imagem_url: string | null
                    nome: string
                    ordem: number | null
                    status: Database["public"]["Enums"]["course_status"]
                    video_id: string | null
                }
                Insert: {
                    categoria: string
                    categoria_id?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    data_fim?: string | null
                    data_inicio?: string | null
                    descricao?: string | null
                    id?: string
                    imagem_url?: string | null
                    nome: string
                    ordem?: number | null
                    status?: Database["public"]["Enums"]["course_status"]
                    video_id?: string | null
                }
                Update: {
                    categoria?: string
                    categoria_id?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    data_fim?: string | null
                    data_inicio?: string | null
                    descricao?: string | null
                    id?: string
                    imagem_url?: string | null
                    nome?: string
                    ordem?: number | null
                    status?: Database["public"]["Enums"]["course_status"]
                    video_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "cursos_categoria_id_fkey"
                        columns: ["categoria_id"]
                        isOneToOne: false
                        referencedRelation: "categorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cursos_video_id_fkey"
                        columns: ["video_id"]
                        isOneToOne: false
                        referencedRelation: "videos"
                        referencedColumns: ["id"]
                    },
                ]
            }
            modulos: {
                Row: {
                    curso_id: string
                    data_atualizacao: string
                    data_criacao: string
                    descricao: string | null
                    duracao: number | null
                    id: string
                    link_video: string | null
                    nome_modulo: string
                    ordem: number | null
                    video_id: string | null
                }
                Insert: {
                    curso_id: string
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    duracao?: number | null
                    id?: string
                    link_video?: string | null
                    nome_modulo: string
                    ordem?: number | null
                    video_id?: string | null
                }
                Update: {
                    curso_id?: string
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    duracao?: number | null
                    id?: string
                    link_video?: string | null
                    nome_modulo?: string
                    ordem?: number | null
                    video_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "modulos_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "modulos_video_id_fkey"
                        columns: ["video_id"]
                        isOneToOne: false
                        referencedRelation: "videos"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                }
                Relationships: []
            }
            progresso_usuario: {
                Row: {
                    curso_id: string
                    data_atualizacao: string
                    data_conclusao: string | null
                    data_criacao: string
                    data_inicio: string | null
                    id: string
                    modulo_id: string | null
                    percentual_concluido: number | null
                    status: Database["public"]["Enums"]["progress_status"]
                    tempo_total_assistido: number | null
                    usuario_id: string
                }
                Insert: {
                    curso_id: string
                    data_atualizacao?: string
                    data_conclusao?: string | null
                    data_criacao?: string
                    data_inicio?: string | null
                    id?: string
                    modulo_id?: string | null
                    percentual_concluido?: number | null
                    status?: Database["public"]["Enums"]["progress_status"]
                    tempo_total_assistido?: number | null
                    usuario_id: string
                }
                Update: {
                    curso_id?: string
                    data_atualizacao?: string
                    data_conclusao?: string | null
                    data_criacao?: string
                    data_inicio?: string | null
                    id?: string
                    modulo_id?: string | null
                    percentual_concluido?: number | null
                    status?: Database["public"]["Enums"]["progress_status"]
                    tempo_total_assistido?: number | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "progresso_usuario_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "progresso_usuario_modulo_id_fkey"
                        columns: ["modulo_id"]
                        isOneToOne: false
                        referencedRelation: "modulos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "progresso_usuario_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            video_progress: {
                Row: {
                    id: string
                    user_id: string
                    video_id: string
                    curso_id: string
                    modulo_id: string | null
                    tempo_assistido: number | null
                    tempo_total: number | null
                    percentual_assistido: number | null
                    concluido: boolean
                    data_primeiro_acesso: string
                    data_ultimo_acesso: string
                    data_conclusao: string | null
                    data_criacao: string
                    data_atualizacao: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    video_id: string
                    curso_id: string
                    modulo_id?: string | null
                    tempo_assistido?: number | null
                    tempo_total?: number | null
                    percentual_assistido?: number | null
                    concluido?: boolean
                    data_primeiro_acesso?: string
                    data_ultimo_acesso?: string
                    data_conclusao?: string | null
                    data_criacao?: string
                    data_atualizacao?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    video_id?: string
                    curso_id?: string
                    modulo_id?: string | null
                    tempo_assistido?: number | null
                    tempo_total?: number | null
                    percentual_assistido?: number | null
                    concluido?: boolean
                    data_primeiro_acesso?: string
                    data_ultimo_acesso?: string
                    data_conclusao?: string | null
                    data_criacao?: string
                    data_atualizacao?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "video_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "video_progress_video_id_fkey"
                        columns: ["video_id"]
                        isOneToOne: false
                        referencedRelation: "videos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "video_progress_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "video_progress_modulo_id_fkey"
                        columns: ["modulo_id"]
                        isOneToOne: false
                        referencedRelation: "modulos"
                        referencedColumns: ["id"]
                    },
                ]
            }
            usuarios: {
                Row: {
                    created_at: string | null
                    data_atualizacao: string
                    data_criacao: string
                    email: string
                    id: string
                    matricula: string | null
                    nome: string
                    senha_hashed: string
                    status: Database["public"]["Enums"]["status_type"]
                    tipo_usuario: Database["public"]["Enums"]["user_type"]
                    user_id: string | null
                    domain_id: string | null
                    ultimo_login: string | null
                }
                Insert: {
                    created_at?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    email: string
                    id?: string
                    matricula?: string | null
                    nome: string
                    senha_hashed: string
                    status?: Database["public"]["Enums"]["status_type"]
                    tipo_usuario?: Database["public"]["Enums"]["user_type"]
                    user_id?: string | null
                    domain_id?: string | null
                    ultimo_login?: string | null
                }
                Update: {
                    created_at?: string | null
                    data_atualizacao?: string
                    data_criacao?: string
                    email?: string
                    id?: string
                    matricula?: string | null
                    nome?: string
                    senha_hashed?: string
                    status?: Database["public"]["Enums"]["status_type"]
                    tipo_usuario?: Database["public"]["Enums"]["user_type"]
                    user_id?: string | null
                    domain_id?: string | null
                    ultimo_login?: string | null
                }
                Relationships: []
            }
            videos: {
                Row: {
                    data_atualizacao: string
                    data_criacao: string
                    descricao: string | null
                    duracao: number | null
                    id: string
                    thumbnail_url: string | null
                    titulo: string
                    url_video: string | null
                    modulo_id: string | null
                    curso_id: string | null
                    categoria: string | null
                }
                Insert: {
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    duracao?: number | null
                    id?: string
                    thumbnail_url?: string | null
                    titulo: string
                    url_video?: string | null
                    modulo_id?: string | null
                    curso_id?: string | null
                    categoria?: string | null
                }
                Update: {
                    data_atualizacao?: string
                    data_criacao?: string
                    descricao?: string | null
                    duracao?: number | null
                    id?: string
                    thumbnail_url?: string | null
                    titulo?: string
                    url_video?: string | null
                    modulo_id?: string | null
                    curso_id?: string | null
                    categoria?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "videos_modulo_id_fkey"
                        columns: ["modulo_id"]
                        isOneToOne: false
                        referencedRelation: "modulos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "videos_curso_id_fkey"
                        columns: ["curso_id"]
                        isOneToOne: false
                        referencedRelation: "cursos"
                        referencedColumns: ["id"]
                    },
                ]
            }
            login_logs: {
                Row: {
                    id: string
                    usuario_id: string
                    email: string
                    ip_address: string | null
                    user_agent: string | null
                    success: boolean
                    error_message: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    email: string
                    ip_address?: string | null
                    user_agent?: string | null
                    success?: boolean
                    error_message?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    email?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    success?: boolean
                    error_message?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "login_logs_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            domains: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            domain_configs: {
                Row: {
                    id: string
                    domain_id: string
                    config_key: string
                    config_value: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    domain_id: string
                    config_key: string
                    config_value?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    domain_id?: string
                    config_key?: string
                    config_value?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            domain_default_users: {
                Row: {
                    id: string
                    domain_id: string
                    nome: string
                    email: string
                    tipo_usuario: "cliente" | "admin" | "admin_master"
                    senha_padrao: string
                    status: "ativo" | "inativo" | "pendente"
                    created_at: string
                }
                Insert: {
                    id?: string
                    domain_id: string
                    nome: string
                    email: string
                    tipo_usuario?: "cliente" | "admin" | "admin_master"
                    senha_padrao: string
                    status?: "ativo" | "inativo" | "pendente"
                    created_at?: string
                }
                Update: {
                    id?: string
                    domain_id?: string
                    nome?: string
                    email?: string
                    tipo_usuario?: "cliente" | "admin" | "admin_master"
                    senha_padrao?: string
                    status?: "ativo" | "inativo" | "pendente"
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            course_status: "ativo" | "inativo" | "em_breve"
            progress_status: "nao_iniciado" | "em_andamento" | "concluido"
            status_type: "ativo" | "inativo" | "pendente"
            user_type: "cliente" | "admin" | "admin_master"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
            | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
            Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
                Row: infer R
            }
            ? R
            : never
        : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
            Insert: infer I
        }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
                Insert: infer I
            }
            ? I
            : never
        : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
            Update: infer U
        }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
                Update: infer U
            }
            ? U
            : never
        : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
        ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
        : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
        ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
        : never

export const Constants = {
    public: {
        Enums: {
            course_status: ["ativo", "inativo", "em_breve"],
            progress_status: ["nao_iniciado", "em_andamento", "concluido"],
            status_type: ["ativo", "inativo", "pendente"],
            user_type: ["cliente", "admin", "admin_master"],
        },
    },
} as const
