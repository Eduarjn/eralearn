import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuiz } from '@/hooks/useQuiz';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Award, BookOpen } from 'lucide-react';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    quizConfig, 
    isLoading, 
    error, 
    isQuizAvailable, 
    userProgress, 
    certificate, 
    submitQuiz,
    checkQuizAvailability 
  } = useQuiz(user?.id, courseId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<{ nota: number; aprovado: boolean } | null>(null);

  // Verificar disponibilidade quando modal abre
  useEffect(() => {
    if (isOpen && user?.id && courseId) {
      checkQuizAvailability();
    }
  }, [isOpen, user?.id, courseId, checkQuizAvailability]);

  // Resetar estado quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(false);
      setQuizResult(null);
    }
  }, [isOpen]);

  // Se usuário já completou o quiz, mostrar resultados
  useEffect(() => {
    if (userProgress && !showResults) {
      setShowResults(true);
      setQuizResult({
        nota: userProgress.nota,
        aprovado: userProgress.aprovado
      });
    }
  }, [userProgress, showResults]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizConfig?.perguntas.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizConfig) return;

    setIsSubmitting(true);
    try {
      const result = await submitQuiz(answers);
      if (result) {
        setQuizResult(result);
        setShowResults(true);
        onQuizComplete(result.aprovado, result.nota);
        
        toast({
          title: result.aprovado ? "Parabéns!" : "Continue estudando",
          description: result.aprovado 
            ? "Você foi aprovado no quiz e recebeu seu certificado!" 
            : "Você precisa de pelo menos 70% para ser aprovado.",
          variant: result.aprovado ? "default" : "destructive"
        });
      }
    } catch (err) {
      console.error('Erro ao submeter quiz:', err);
      toast({
        title: "Erro",
        description: "Erro ao submeter respostas do quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quizConfig?.perguntas[currentQuestionIndex];
  const totalQuestions = quizConfig?.perguntas.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const allQuestionsAnswered = totalQuestions > 0 && 
    Object.keys(answers).length === totalQuestions;

  // Se quiz não está disponível
  if (!isQuizAvailable && !isLoading && !error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quiz não disponível
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Para acessar o quiz, você precisa concluir todos os vídeos do curso primeiro.
            </p>
            <Button onClick={onClose}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Se já tem certificado
  if (certificate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Certificado já emitido
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mb-4">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Parabéns!</p>
              <p className="text-sm text-muted-foreground">
                Você já concluiu este curso e possui um certificado.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Nota:</strong> {certificate.nota}%
              </p>
              <p className="text-sm text-muted-foreground">
                Concluído em: {new Date(certificate.data_conclusao).toLocaleDateString()}
              </p>
            </div>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Se já completou o quiz mas não foi aprovado
  if (userProgress && !userProgress.aprovado) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Quiz não aprovado
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mb-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <p className="font-semibold">Continue estudando</p>
              <p className="text-sm text-muted-foreground">
                Sua nota: {userProgress.nota}% (mínimo: 70%)
              </p>
            </div>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Carregando quiz...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Erro
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mostrar resultados
  if (showResults && quizResult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {quizResult.aprovado ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {quizResult.aprovado ? "Quiz Aprovado!" : "Quiz não aprovado"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mb-4">
              {quizResult.aprovado ? (
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              )}
              <p className="font-semibold">
                {quizResult.aprovado ? "Parabéns!" : "Continue estudando"}
              </p>
              <p className="text-sm text-muted-foreground">
                Sua nota: {quizResult.nota}%
              </p>
            </div>
            {quizResult.aprovado && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm">
                  Seu certificado foi gerado automaticamente!
                </p>
              </div>
            )}
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Quiz não encontrado
  if (!quizConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quiz não encontrado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar o quiz para este curso.
            </p>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Interface do quiz
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quizConfig.titulo}</DialogTitle>
          {quizConfig.descricao && (
            <p className="text-sm text-muted-foreground">{quizConfig.descricao}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Questão atual */}
          {currentQuestion && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">{currentQuestion.pergunta}</h3>
                
                <div className="space-y-3">
                  {currentQuestion.opcoes.map((opcao, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers[currentQuestion.id] === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navegação */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Quiz"}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion?.id]}
              >
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 