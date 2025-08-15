import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuizQuestion {
  id: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
  explicacao?: string;
  ordem: number;
}

interface QuizConfig {
  id: string;
  titulo: string;
  descricao?: string;
  categoria_id: string;
  nota_minima: number;
  perguntas: QuizQuestion[];
  mensagem_sucesso: string;
  mensagem_reprova: string;
}

interface CertificateData {
  id: string;
  usuario_id: string;
  curso_id: string;
  categoria_nome: string;
  nota: number;
  data_conclusao: string;
  certificado_url?: string;
  qr_code_url?: string;
}

export function useQuiz(userId: string | undefined, categoriaId: string | undefined) {
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  // Carregar configuração do quiz
  const loadQuizConfig = useCallback(async () => {
    if (!categoriaId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          titulo, 
          descricao,
          nota_minima,
          quiz_perguntas(
            id, 
            pergunta, 
            opcoes, 
            resposta_correta, 
            explicacao, 
            ordem
          )
        `)
        .eq('categoria', categoriaId)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Ordenar perguntas por ordem
        const sortedPerguntas = data.quiz_perguntas?.sort((a, b) => a.ordem - b.ordem) || [];
        setQuizConfig({
          id: data.id,
          titulo: data.titulo,
          descricao: data.descricao,
          categoria_id: categoriaId,
          nota_minima: data.nota_minima,
          perguntas: sortedPerguntas.map(p => ({
            id: p.id,
            pergunta: p.pergunta,
            opcoes: p.opcoes,
            resposta_correta: p.resposta_correta,
            explicacao: p.explicacao,
            ordem: p.ordem
          })),
          mensagem_sucesso: 'Parabéns! Você foi aprovado no quiz!',
          mensagem_reprova: 'Continue estudando e tente novamente!'
        });
      }
    } catch (err) {
      console.error('Erro ao carregar quiz config:', err);
      setError('Erro ao carregar configuração do quiz');
    } finally {
      setLoading(false);
    }
  }, [categoriaId]);

  // Verificar se o curso foi concluído
  const checkCourseCompletion = useCallback(async () => {
    if (!userId || !categoriaId) return;

    try {
      // Buscar todos os vídeos da categoria
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, modulo_id')
        .eq('categoria', categoriaId);

      if (videosError) throw videosError;

      if (!videos || videos.length === 0) {
        setIsCourseCompleted(false);
        return;
      }

      // Buscar progresso dos vídeos
      const videoIds = videos.map(v => v.id);
      // Verificar se todos os vídeos do curso foram concluídos
      const { data: progressData, error: progressError } = await supabase
        .from('video_progress')
        .select('video_id, concluido')
        .eq('user_id', userId)
        .in('video_id', videoIds);

      if (progressError) throw progressError;

      // Verificar se todos os vídeos foram concluídos
      const completedVideos = progressData?.filter(p => p.concluido) || [];
      const allCompleted = videos.length > 0 && completedVideos.length === videos.length;

      setIsCourseCompleted(allCompleted);

      // Se concluído, verificar se já existe certificado
      if (allCompleted) {
        await checkExistingCertificate();
      }
    } catch (err) {
      console.error('Erro ao verificar conclusão do curso:', err);
      setError('Erro ao verificar conclusão do curso');
    }
  }, [userId, categoriaId]);

  // Verificar certificado existente
  const checkExistingCertificate = useCallback(async () => {
    if (!userId || !categoriaId) return;

    try {
      const { data, error } = await supabase
        .from('certificados')
        .select('*')
        .eq('usuario_id', userId)
        .eq('categoria_id', categoriaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCertificate(data || null);
    } catch (err) {
      console.error('Erro ao verificar certificado:', err);
    }
  }, [userId, categoriaId]);

  // Gerar certificado
  const generateCertificate = useCallback(async (nota: number) => {
    if (!userId || !categoriaId || !quizConfig) return null;

    try {
      // Buscar informações da categoria
      const { data: categoria, error: catError } = await supabase
        .from('categorias')
        .select('nome')
        .eq('id', categoriaId)
        .single();

      if (catError) throw catError;

      // Criar certificado
      const certificateData = {
        usuario_id: userId,
        categoria_id: categoriaId,
        categoria_nome: categoria.nome,
        nota: nota,
        data_conclusao: new Date().toISOString(),
        certificado_url: null, // Será gerado pelo backend
        qr_code_url: null // Será gerado pelo backend
      };

      const { data, error } = await supabase
        .from('certificados')
        .insert(certificateData)
        .select()
        .single();

      if (error) throw error;

      setCertificate(data);
      return data;
    } catch (err) {
      console.error('Erro ao gerar certificado:', err);
      throw new Error('Erro ao gerar certificado');
    }
  }, [userId, categoriaId, quizConfig]);

  // Buscar quiz específico do curso
  const fetchCourseQuiz = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar a categoria do curso
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('categoria')
        .eq('id', courseId)
        .single();

      if (cursoError) {
        throw cursoError;
      }

      if (!cursoData?.categoria) {
        throw new Error('Categoria do curso não encontrada');
      }

      // Buscar quiz pela categoria
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          titulo, 
          descricao,
          nota_minima,
          quiz_perguntas(
            id, 
            pergunta, 
            opcoes, 
            resposta_correta, 
            explicacao, 
            ordem
          )
        `)
        .eq('categoria', cursoData.categoria)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (quiz) {
        // Ordenar perguntas por ordem
        const sortedPerguntas = quiz.quiz_perguntas?.sort((a, b) => a.ordem - b.ordem) || [];
        return {
          ...quiz,
          quiz_perguntas: sortedPerguntas
        };
      }

      return null;
    } catch (err) {
      console.error('Erro ao buscar quiz do curso:', err);
      setError('Erro ao carregar quiz do curso');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar respostas do quiz
  const saveQuizAnswers = useCallback(async (quizId: string, answers: Record<string, number>, nota: number) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('progresso_quiz')
        .insert({
          usuario_id: userId,
          quiz_id: quizId,
          respostas: answers,
          nota: nota,
          data_conclusao: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao salvar respostas do quiz:', err);
      throw new Error('Erro ao salvar respostas do quiz');
    }
  }, [userId]);

  // Carregar dados iniciais
  useEffect(() => {
    loadQuizConfig();
  }, [loadQuizConfig]);

  useEffect(() => {
    checkCourseCompletion();
  }, [checkCourseCompletion]);

  return {
    quizConfig,
    loading,
    error,
    isCourseCompleted,
    certificate,
    generateCertificate,
    checkCourseCompletion,
    fetchCourseQuiz,
    saveQuizAnswers
  };
} 