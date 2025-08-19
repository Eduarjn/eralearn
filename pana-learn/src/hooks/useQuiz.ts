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
  categoria: string;
  nota_minima: number;
  perguntas: QuizQuestion[];
  mensagem_sucesso: string;
  mensagem_reprova: string;
}

interface CertificateData {
  id: string;
  usuario_id: string;
  curso_id: string;
  curso_nome: string;
  nota: number;
  data_conclusao: string;
  certificado_url?: string;
  qr_code_url?: string;
}

export function useQuiz(userId: string | undefined, courseId: string | undefined) {
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  // Verificar se o quiz está disponível para o usuário
  const checkQuizAvailability = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Usar função do banco para verificar se quiz está liberado
      const { data: quizData, error: quizError } = await supabase
        .rpc('liberar_quiz_curso', {
          p_usuario_id: userId,
          p_curso_id: courseId
        });

      if (quizError) {
        console.error('Erro ao verificar disponibilidade do quiz:', quizError);
        setError('Erro ao verificar disponibilidade do quiz');
        return;
      }

      if (quizData) {
        // Quiz está liberado, buscar configuração
        await loadQuizConfig(quizData);
        setIsQuizAvailable(true);
      } else {
        // Quiz não está liberado ainda
        setIsQuizAvailable(false);
      }
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      setError('Erro ao verificar disponibilidade do quiz');
    } finally {
      setIsLoading(false);
    }
  }, [userId, courseId]);

  // Carregar configuração do quiz
  const loadQuizConfig = useCallback(async (quizId: string) => {
    try {
      // Buscar dados do quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // Buscar perguntas do quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_perguntas')
        .select('*')
        .eq('quiz_id', quizId)
        .order('ordem');

      if (questionsError) throw questionsError;

      // Buscar progresso do usuário (se existir) - SEM .single()
      let progressData = null;
      try {
        const { data: progressResult, error: progressError } = await supabase
          .from('progresso_quiz')
          .select('*')
          .eq('usuario_id', userId)
          .eq('quiz_id', quizId)
          .maybeSingle(); // Usar maybeSingle em vez de single

        if (progressError) {
          console.error('Erro ao buscar progresso:', progressError);
        } else {
          progressData = progressResult;
        }
      } catch (progressErr) {
        console.error('Erro ao buscar progresso do quiz:', progressErr);
      }

      // Buscar certificado (se existir) - SEM .single()
      let certData = null;
      try {
        const { data: certResult, error: certError } = await supabase
          .from('certificados')
          .select('*')
          .eq('usuario_id', userId)
          .eq('curso_id', courseId)
          .maybeSingle(); // Usar maybeSingle em vez de single

        if (certError) {
          console.error('Erro ao buscar certificado:', certError);
        } else {
          certData = certResult;
        }
      } catch (certErr) {
        console.error('Erro ao buscar certificado:', certErr);
      }

      // Montar configuração do quiz
      const config: QuizConfig = {
        id: quizData.id,
        titulo: quizData.titulo,
        descricao: quizData.descricao,
        categoria: quizData.categoria,
        nota_minima: quizData.nota_minima,
        perguntas: questionsData.map(q => ({
          id: q.id,
          pergunta: q.pergunta,
          opcoes: q.opcoes,
          resposta_correta: q.resposta_correta,
          explicacao: q.explicacao,
          ordem: q.ordem
        })),
        mensagem_sucesso: 'Parabéns! Você concluiu o curso com sucesso!',
        mensagem_reprova: 'Continue estudando e tente novamente.'
      };

      setQuizConfig(config);
      setUserProgress(progressData);
      setCertificate(certData);

    } catch (err) {
      console.error('Erro ao carregar quiz:', err);
      setError('Erro ao carregar configuração do quiz');
    }
  }, [userId, courseId]);

  // Submeter respostas do quiz
  const submitQuiz = useCallback(async (respostas: Record<string, number>) => {
    if (!userId || !quizConfig) return;

    try {
      setIsLoading(true);
      setError(null);

      // Calcular nota
      let acertos = 0;
      const totalPerguntas = quizConfig.perguntas.length;

      quizConfig.perguntas.forEach(pergunta => {
        const respostaUsuario = respostas[pergunta.id];
        if (respostaUsuario === pergunta.resposta_correta) {
          acertos++;
        }
      });

      const nota = Math.round((acertos / totalPerguntas) * 100);
      const aprovado = nota >= quizConfig.nota_minima;

      // Salvar progresso do quiz
      const { error: progressError } = await supabase
        .from('progresso_quiz')
        .upsert({
          usuario_id: userId,
          quiz_id: quizConfig.id,
          respostas: respostas,
          nota: nota,
          aprovado: aprovado,
          data_conclusao: new Date().toISOString()
        });

      if (progressError) throw progressError;

      // Se aprovado, gerar certificado
      if (aprovado && courseId) {
        const { data: certId, error: certError } = await supabase
          .rpc('gerar_certificado_curso', {
            p_usuario_id: userId,
            p_curso_id: courseId,
            p_quiz_id: quizConfig.id,
            p_nota: nota
          });

        if (certError) {
          console.error('Erro ao gerar certificado:', certError);
        } else {
          // Buscar certificado gerado
          const { data: certData, error: certError } = await supabase
            .from('certificados')
            .select('*')
            .eq('id', certId)
            .maybeSingle();

          if (certError) {
            console.error('Erro ao buscar certificado gerado:', certError);
          } else {
            setCertificate(certData);
          }
        }
      }

      // Atualizar progresso local
      setUserProgress({
        usuario_id: userId,
        quiz_id: quizConfig.id,
        respostas: respostas,
        nota: nota,
        aprovado: aprovado,
        data_conclusao: new Date().toISOString()
      });

      return { nota, aprovado };

    } catch (err) {
      console.error('Erro ao submeter quiz:', err);
      setError('Erro ao submeter respostas do quiz');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, quizConfig, courseId]);

  // Verificar disponibilidade periodicamente
  useEffect(() => {
    if (userId && courseId) {
      checkQuizAvailability();
      
      // Verificar a cada 30 segundos
      const interval = setInterval(checkQuizAvailability, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, courseId, checkQuizAvailability]);

  return {
    quizConfig,
    isLoading,
    error,
    isQuizAvailable,
    userProgress,
    certificate,
    submitQuiz,
    checkQuizAvailability
  };
} 