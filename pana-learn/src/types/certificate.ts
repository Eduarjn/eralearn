export interface Certificate {
  id: string;
  usuario_id: string;
  curso_id?: string;
  categoria: string;
  quiz_id?: string;
  nota_final?: number;
  nota?: number;
  link_pdf_certificado?: string;
  numero_certificado: string;
  qr_code_url?: string;
  status: 'ativo' | 'revogado' | 'expirado';
  data_emissao: string;
  data_criacao: string;
  data_atualizacao: string;
  // Dados relacionados
  usuario_nome?: string;
  curso_nome?: string;
  quiz_titulo?: string;
  usuarios?: {
    nome: string;
    email: string;
  };
  cursos?: {
    nome: string;
    categoria: string;
  };
}
