import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuiz } from '@/hooks/useQuiz';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Award } from 'lucide-react';

interface CourseQuizModalProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (passed: boolean, score: number) => void;
}

export function CourseQuizModal({
  courseId,
  courseName,
  isOpen,
  onClose,
  onQuizComplete
}: CourseQuizModalProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseCategory, setCourseCategory] = useState<string | undefined>(undefined);

  // Buscar a categoria do curso
  useEffect(() => {
    const fetchCourseCategory = async () => {
      if (!courseId) return;
      
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select('categoria')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error('Erro ao buscar categoria do curso:', error);
          return;
        }

        setCourseCategory(data?.categoria);
      } catch (error) {
        console.error('Erro ao buscar categoria do curso:', error);
      }
    };

    fetchCourseCategory();
  }, [courseId]);

  const {
    quizConfig,
    loading: questionsLoading,
    error: questionsError,
    generateCertificate
  } = useQuiz(userProfile?.id, courseCategory);

  const totalQuestions = quizConfig?.perguntas?.length || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const currentQuestionData = quizConfig?.perguntas?.[currentQuestion];

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinishQuiz = async () => {
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Atenção",
        description: "Você precisa responder todas as perguntas para finalizar o quiz.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Calcular nota
      let acertos = 0;
      const totalPerguntas = quizConfig?.perguntas?.length || 0;
      
      quizConfig?.perguntas?.forEach((pergunta, index) => {
        const respostaSelecionada = answers[index];
        if (respostaSelecionada === pergunta.opcoes[pergunta.resposta_correta]) {
          acertos++;
        }
      });

      const score = totalPerguntas > 0 ? Math.round((acertos / totalPerguntas) * 100) : 0;
      const passed = score >= (quizConfig?.nota_minima || 70);

      setScore(score);
      setQuizCompleted(true);

      if (passed) {
        // Gerar certificado
        const certificateResult = await generateCertificate(score);
        
        if (certificateResult?.error) {
          console.error('Erro ao gerar certificado:', certificateResult.error);
        }

        toast({
          title: "Parabéns! 🎉",
          description: `Você foi aprovado com ${score}%! Seu certificado foi gerado.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Continue estudando",
          description: `Sua nota foi ${score}%. Tente novamente!`,
          variant: "destructive"
        });
      }

      onQuizComplete(passed, score);
    } catch (error) {
      console.error('Erro ao finalizar quiz:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!quizCompleted) {
      const hasAnsweredQuestions = Object.keys(answers).length > 0;
      
      if (hasAnsweredQuestions) {
        if (confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
          onClose();
        }
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setQuizCompleted(false);
  };

  // Se não há categoria ou está carregando, mostrar loading
  if (!courseCategory || questionsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carregando Quiz...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perguntas do quiz...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Se há erro, mostrar mensagem
  if (questionsError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Erro ao Carregar Quiz</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Não foi possível carregar o quiz para este curso.
            </p>
            <p className="text-sm text-gray-500">
              Verifique se existe um quiz configurado para a categoria "{courseCategory}".
            </p>
            <Button onClick={handleClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Se não há quiz configurado
  if (!quizConfig || !quizConfig.perguntas || quizConfig.perguntas.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Não Disponível</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Não há quiz configurado para este curso.
            </p>
            <p className="text-sm text-gray-500">
              Categoria: {courseCategory}
            </p>
            <Button onClick={handleClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-era-green" />
            Quiz: {courseName}
          </DialogTitle>
        </DialogHeader>

        {!quizCompleted ? (
          <div className="space-y-6">
            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{answeredQuestions}/{totalQuestions} perguntas respondidas</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Pergunta atual */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Pergunta {currentQuestion + 1} de {totalQuestions}
                    </span>
                    {answers[currentQuestion] && (
                      <CheckCircle className="h-5 w-5 text-era-green" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold">
                    {currentQuestionData?.pergunta}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestionData?.opcoes.map((opcao, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(opcao)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          answers[currentQuestion] === opcao
                            ? 'border-era-green bg-era-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navegação */}
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {currentQuestion < totalQuestions - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion]}
                  >
                    Próxima
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={answeredQuestions < totalQuestions || loading}
                    className="bg-era-green hover:bg-era-green/90 text-era-black"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Quiz'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {score >= (quizConfig?.nota_minima || 70) ? (
                <CheckCircle className="h-16 w-16 text-era-green" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">
                {score >= (quizConfig?.nota_minima || 70) ? 'Parabéns!' : 'Continue Estudando'}
              </h3>
              <p className="text-gray-600 mb-4">
                Sua nota foi: <span className="font-bold text-lg">{score}%</span>
              </p>
              <p className="text-sm text-gray-500">
                Nota mínima para aprovação: {quizConfig?.nota_minima || 70}%
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                Tentar Novamente
              </Button>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 