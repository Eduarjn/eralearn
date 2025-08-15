import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Certificate {
  id: string;
  usuario_id: string;
  categoria: string;
  categoria_nome: string;
  quiz_id: string;
  nota: number;
  data_conclusao: string;
  certificado_url?: string;
  qr_code_url?: string;
  numero_certificado: string;
  status: 'ativo' | 'revogado' | 'expirado';
  data_emissao: string;
  data_criacao: string;
  data_atualizacao: string;
}

interface CertificateStats {
  total: number;
  ativos: number;
  estaSemana: number;
  porCategoria: Record<string, number>;
}

export function useCertificates(userId?: string) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    ativos: 0,
    estaSemana: 0,
    porCategoria: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar certificados do usuário
  const fetchCertificates = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('certificados')
        .select('*')
        .eq('usuario_id', userId)
        .order('data_emissao', { ascending: false });

      if (error) throw error;

      setCertificates(data || []);

      // Calcular estatísticas
      const total = data?.length || 0;
      const ativos = data?.filter(c => c.status === 'ativo').length || 0;
      
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      const estaSemana = data?.filter(c => 
        new Date(c.data_emissao) > umaSemanaAtras
      ).length || 0;

      const porCategoria: Record<string, number> = {};
      data?.forEach(cert => {
        porCategoria[cert.categoria] = (porCategoria[cert.categoria] || 0) + 1;
      });

      setStats({ total, ativos, estaSemana, porCategoria });
    } catch (err) {
      console.error('Erro ao buscar certificados:', err);
      setError('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Buscar todos os certificados (para admins)
  const fetchAllCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('certificados')
        .select(`
          *,
          usuarios(nome, email)
        `)
        .order('data_emissao', { ascending: false });

      if (error) throw error;

      setCertificates(data || []);
    } catch (err) {
      console.error('Erro ao buscar todos os certificados:', err);
      setError('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar certificado
  const generateCertificate = useCallback(async (
    userId: string,
    categoria: string,
    categoriaNome: string,
    quizId: string,
    nota: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('certificados')
        .insert({
          usuario_id: userId,
          categoria,
          categoria_nome: categoriaNome,
          quiz_id: quizId,
          nota,
          data_conclusao: new Date().toISOString(),
          numero_certificado: `CERT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          certificado_url: `https://example.com/certificados/${userId}/${quizId}.pdf`,
          qr_code_url: `https://example.com/qr/${userId}/${quizId}.png`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao gerar certificado:', err);
      throw new Error('Erro ao gerar certificado');
    }
  }, []);

  // Validar certificado por número
  const validateCertificate = useCallback(async (numeroCertificado: string) => {
    try {
      const { data, error } = await supabase
        .from('certificados')
        .select(`
          *,
          usuarios(nome, email)
        `)
        .eq('numero_certificado', numeroCertificado)
        .eq('status', 'ativo')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao validar certificado:', err);
      return null;
    }
  }, []);

  // Carregar certificados quando userId mudar
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    stats,
    loading,
    error,
    fetchCertificates,
    fetchAllCertificates,
    generateCertificate,
    validateCertificate
  };
} 