export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      usuarios: {
        Row: {
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
        }
        Insert: {
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
        }
        Update: {
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
        }
        Relationships: []
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
      user_type: "cliente" | "admin"
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
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
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
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
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
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
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
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
      user_type: ["cliente", "admin"],
    },
  },
} as const
