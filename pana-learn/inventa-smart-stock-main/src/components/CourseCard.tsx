
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Play } from 'lucide-react';
import { Course } from '@/hooks/useCourses';

interface CourseCardProps {
  course: Course;
  onStartCourse?: (courseId: string) => void;
}

export function CourseCard({ course, onStartCourse }: CourseCardProps) {
  const categoryColor = course.categorias?.cor || '#3B82F6';

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-era-dark-blue line-clamp-2">
              {course.nome}
            </CardTitle>
            <CardDescription className="mt-2 text-era-gray line-clamp-3">
              {course.descricao || 'Curso de treinamento profissional'}
            </CardDescription>
          </div>
          <Badge 
            className="ml-2 flex-shrink-0"
            style={{ 
              backgroundColor: categoryColor,
              color: 'white'
            }}
          >
            {course.categorias?.nome || course.categoria}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-era-gray">
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
        
        <Button 
          className="w-full era-lime-button font-medium"
          onClick={() => onStartCourse?.(course.id)}
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar Curso
        </Button>
      </CardContent>
    </Card>
  );
}
