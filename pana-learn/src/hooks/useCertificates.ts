import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Certificate {
    id: string;
    curso_id: string;
    curso_nome: string;
    categoria: string;
    nota: number;
    data_conclusao: string;
    data_emissao: string;
    numero_certificado: string;
    status: string;
    certificado_url?: string;
    qr_code_url?: string;
}

interface CertificateValidation {
    valido: boolean;
    curso_nome: string;
    usuario_nome: string;
    data_emissao: string;
    nota: number;
    status: string;
}

export function useCertificates(userId: string | undefined) {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar certificados do usuário
    const fetchCertificates = useCallback(async () => {
        if (!userId) return;

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .rpc('buscar_certificados_usuario_dinamico', {
                    p_usuario_id: userId
                });

            if (fetchError) {
                console.error('Erro ao buscar certificados:', fetchError);
                setError('Erro ao carregar certificados');
                return;
            }

            setCertificates(data || []);
        } catch (err) {
            console.error('Erro ao buscar certificados:', err);
            setError('Erro ao carregar certificados');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Validar certificado por número
    const validateCertificate = useCallback(async (numeroCertificado: string): Promise<CertificateValidation | null> => {
        try {
            const { data, error: validationError } = await supabase
                .rpc('validar_certificado_dinamico', {
                    p_numero_certificado: numeroCertificado
                });

            if (validationError) {
                console.error('Erro ao validar certificado:', validationError);
                return null;
            }

            return data?.[0] || null;
        } catch (err) {
            console.error('Erro ao validar certificado:', err);
            return null;
        }
    }, []);

    // Gerar certificado (usado pelo sistema de quiz)
    const generateCertificate = useCallback(async (
        cursoId: string,
        quizId: string,
        nota: number
    ): Promise<string | null> => {
        if (!userId) return null;

        try {
            const { data: certificateId, error: generationError } = await supabase
                .rpc('gerar_certificado_dinamico', {
                    p_usuario_id: userId,
                    p_curso_id: cursoId,
                    p_quiz_id: quizId,
                    p_nota: nota
                });

            if (generationError) {
                console.error('Erro ao gerar certificado:', generationError);
                return null;
            }

            // Recarregar lista de certificados
            await fetchCertificates();

            return certificateId;
        } catch (err) {
            console.error('Erro ao gerar certificado:', err);
            return null;
        }
    }, [userId, fetchCertificates]);

    // Buscar certificado específico
    const getCertificate = useCallback(async (certificateId: string): Promise<Certificate | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('certificados')
                .select('*')
                .eq('id', certificateId)
                .single();

            if (fetchError) {
                console.error('Erro ao buscar certificado:', fetchError);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Erro ao buscar certificado:', err);
            return null;
        }
    }, []);

    // Buscar certificado por curso
    const getCertificateByCourse = useCallback(async (cursoId: string): Promise<Certificate | null> => {
        if (!userId) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from('certificados')
                .select('*')
                .eq('usuario_id', userId)
                .eq('curso_id', cursoId)
                .eq('status', 'ativo')
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Erro ao buscar certificado por curso:', fetchError);
                return null;
            }

            return data || null;
        } catch (err) {
            console.error('Erro ao buscar certificado por curso:', err);
            return null;
        }
    }, [userId]);

    // Verificar se usuário tem certificado para um curso
    const hasCertificateForCourse = useCallback(async (cursoId: string): Promise<boolean> => {
        const certificate = await getCertificateByCourse(cursoId);
        return certificate !== null;
    }, [getCertificateByCourse]);

    // Carregar certificados quando userId mudar
    useEffect(() => {
        if (userId) {
            fetchCertificates();
        }
    }, [userId, fetchCertificates]);

    // Realtime subscription para certificados
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`user-certificates-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'certificados',
                    filter: `usuario_id=eq.${userId}`
                },
                (payload) => {
                    console.log('📡 Realtime: Certificate update', payload);
                    // Recarregar certificados automaticamente
                    fetchCertificates();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchCertificates]);

    return {
        certificates,
        isLoading,
        error,
        fetchCertificates,
        validateCertificate,
        generateCertificate,
        getCertificate,
        getCertificateByCourse,
        hasCertificateForCourse
    };
}