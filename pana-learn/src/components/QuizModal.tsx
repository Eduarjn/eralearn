import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  pergunta: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso';
  alternativas: string[];
  resposta_correta: number;
  explicacao?: string;
}

interface QuizConfig {
  id: string;
  categoria_id: string;
  nota_minima: number;
  perguntas: QuizQuestion[];
  mensagem_sucesso: string;
  mensagem_reprova: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nota: number) => void;
  onFail: () => void;
  quizConfig: QuizConfig | null;
  categoriaNome: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFail,
  quizConfig,
  categoriaNome
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nota, setNota] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentQuestion = quizConfig?.perguntas[currentQuestionIndex];
  const totalQuestions = quizConfig?.perguntas.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setNota(0);
    }
  }, [isOpen]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateNota = () => {
    if (!quizConfig) return 0;
    
    let acertos = 0;
    quizConfig.perguntas.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.resposta_correta) {
        acertos++;
      }
    });
    
    return Math.round((acertos / totalQuestions) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (!quizConfig) return;
    
    setLoading(true);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const notaCalculada = calculateNota();
    setNota(notaCalculada);
    setIsSubmitted(true);
    setLoading(false);

    if (notaCalculada >= quizConfig.nota_minima) {
      toast({
        title: "Parabéns! 🎉",
        description: `Você obteve ${notaCalculada}% e foi aprovado no quiz!`,
        variant: "default"
      });
      setTimeout(() => onSuccess(notaCalculada), 2000);
    } else {
      toast({
        title: "Não foi dessa vez 😔",
        description: `Você obteve ${notaCalculada}%. A nota mínima é ${quizConfig.nota_minima}%.`,
        variant: "destructive"
      });
      setTimeout(() => onFail(), 2000);
    }
  };

  const isAnswerCorrect = (questionId: string, answerIndex: number) => {
    if (!isSubmitted || !quizConfig) return null;
    const question = quizConfig.perguntas.find(q => q.id === questionId);
    return question?.resposta_correta === answerIndex;
  };

  const isAnswerSelected = (questionId: string, answerIndex: number) => {
    return selectedAnswers[questionId] === answerIndex;
  };

  if (!quizConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz de Conclusão</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Quiz não configurado para esta categoria
            </p>
            <p className="text-gray-500 mt-2">
              Entre em contato com o administrador para configurar o quiz.
            </p>
            <Button onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Quiz de Conclusão - {categoriaNome}
          </DialogTitle>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-6">
            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
                <span>{Math.round(progress)}% completo</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Questão atual */}
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentQuestion.pergunta}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.alternativas.map((alternativa, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isAnswerSelected(currentQuestion.id, index)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isSubmitted}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isAnswerSelected(currentQuestion.id, index)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {isAnswerSelected(currentQuestion.id, index) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{alternativa}</span>
                      </div>
                    </button>
                  ))}
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
                Anterior
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion?.id || ''] === undefined}
                  >
                    Próxima
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < totalQuestions || loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Processando...' : 'Apresentar Prova'}
                  </Button>
                )}
              </div>
            </div>

            {/* Resumo das respostas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo das respostas:</h4>
              <div className="flex flex-wrap gap-2">
                {quizConfig.perguntas.map((_, index) => (
                  <Badge
                    key={index}
                    variant={selectedAnswers[quizConfig.perguntas[index].id] !== undefined ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Resultado do quiz */
          <div className="text-center space-y-6">
            {nota >= quizConfig.nota_minima ? (
              <div className="space-y-4">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold text-green-600">
                  Parabéns! Você foi aprovado! 🎉
                </h3>
                <div className="text-4xl font-bold text-green-600">
                  {nota}%
                </div>
                <p className="text-gray-600">
                  {quizConfig.mensagem_sucesso}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <h3 className="text-2xl font-bold text-red-600">
                  Não foi dessa vez 😔
                </h3>
                <div className="text-4xl font-bold text-red-600">
                  {nota}%
                </div>
                <p className="text-gray-600">
                  {quizConfig.mensagem_reprova}
                </p>
                <p className="text-sm text-gray-500">
                  Nota mínima necessária: {quizConfig.nota_minima}%
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
              {nota < quizConfig.nota_minima && (
                <Button
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setIsSubmitted(false);
                    setNota(0);
                  }}
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 