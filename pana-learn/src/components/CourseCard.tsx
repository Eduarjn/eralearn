
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Play, Info } from 'lucide-react';
import { Course } from '@/hooks/useCourses';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  onStartCourse?: (courseId: string) => void;
}

export function CourseCard({ course, onStartCourse }: CourseCardProps) {
  const categoryColor = course.categorias?.cor || '#A435F0';
  const [showTooltip, setShowTooltip] = useState(false);
  const isMock = course.id?.startsWith('mock-');
  const navigate = useNavigate();

  // Debug logs para verificar o curso
  console.log('🎯 CourseCard renderizado:', {
    id: course.id,
    nome: course.nome,
    categoria: course.categoria,
    isMock: isMock,
    hasOnStartCourse: !!onStartCourse
  });

  const handleStart = () => {
    console.log('🎯 CourseCard - handleStart chamado');
    console.log('📋 Dados do curso:', {
      id: course.id,
      nome: course.nome,
      categoria: course.categoria,
      isMock: isMock
    });

    if (isMock) {
      console.log('⚠️ Curso mock, não executando ação');
      return;
    }

    if (onStartCourse) {
      console.log('✅ Chamando onStartCourse com ID:', course.id);
      onStartCourse(course.id);
    } else {
      console.log('✅ Navegando diretamente para:', `/curso/${course.id}`);
      navigate(`/curso/${course.id}`);
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
      <CardHeader className="pb-3 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white font-bold line-clamp-2">
              {course.nome}
            </CardTitle>
            <CardDescription className="mt-2 text-white/90 font-medium line-clamp-3">
              {course.descricao || 'Curso de treinamento profissional'}
            </CardDescription>
          </div>
          {/* Removido badge 'Iniciante' e ícone de telefone */}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-era-gray-medium">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Múltiplos módulos</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>2-3 horas</span>
            </div>
          </div>
        </div>
        <div className="relative group">
          <Button
            className="w-full font-bold transition-all duration-300 rounded-xl py-3 text-base flex items-center justify-center bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl"
            onClick={handleStart}
            disabled={isMock}
            onMouseEnter={() => isMock && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            tabIndex={isMock ? -1 : 0}
            aria-disabled={isMock}
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Curso
          </Button>
          {isMock && showTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap flex items-center gap-1 animate-fade-in">
              <Info className="h-3 w-3 mr-1" />
              Curso em breve
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
