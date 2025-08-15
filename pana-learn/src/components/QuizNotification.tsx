import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Award, Play } from 'lucide-react';
import { CourseQuizModal } from './CourseQuizModal';
import { useAuth } from '@/hooks/useAuth';
import { useQuiz } from '@/hooks/useQuiz';
import { useToast } from '@/hooks/use-toast';

interface QuizNotificationProps {
  courseId: string;
  courseName: string;
  isVisible: boolean;
  onClose: () => void;
  onQuizComplete: (passed: boolean, score: number) => void;
}

export function QuizNotification({
  courseId,
  courseName,
  isVisible,
  onClose,
  onQuizComplete
}: QuizNotificationProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { quizConfig } = useQuiz(userProfile?.id, courseId);

  const handleStartQuiz = () => {
    setShowQuizModal(true);
  };

  const handleCloseNotification = () => {
    setDismissed(true);
    onClose();
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    setShowQuizModal(false);
    onQuizComplete(passed, score);
    
    if (passed) {
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
  };

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <>
      {/* Notificação sutil */}
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
        <Card className="w-80 shadow-lg border-era-green/20 bg-gradient-to-r from-era-green/5 to-era-green/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-era-green" />
                <CardTitle className="text-sm font-semibold text-era-black">
                  Curso Concluído!
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseNotification}
                className="h-6 w-6 p-0 hover:bg-era-green/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-3">
              Parabéns! Você concluiu o curso <strong>{courseName}</strong>. 
              Que tal testar seus conhecimentos?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleStartQuiz}
                size="sm"
                className="flex-1 bg-era-green hover:bg-era-green/90 text-era-black"
              >
                <Play className="h-4 w-4 mr-1" />
                Apresentar Prova
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseNotification}
                className="text-gray-500"
              >
                Depois
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {quizConfig?.perguntas?.length || 0} perguntas
              </Badge>
              <Badge variant="outline" className="text-xs">
                Nota mínima: 70%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Quiz */}
      <CourseQuizModal
        courseId={courseId}
        courseName={courseName}
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onQuizComplete={handleQuizComplete}
      />
    </>
  );
} 