
import { ERALayout } from '@/components/ERALayout';
import { CourseCard } from '@/components/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Treinamentos = () => {
  const { data: courses = [], isLoading, error } = useCourses();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isAdmin = userProfile?.tipo_usuario === 'admin';

  // Filtrar cursos
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Obter categorias únicas
  const categories = Array.from(new Set(courses.map(course => course.categoria)));

  const handleStartCourse = (courseId: string) => {
    console.log('Starting course:', courseId);
    // Aqui você implementaria a navegação para o curso
  };

  if (isLoading) {
    return (
      <ERALayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-lime"></div>
        </div>
      </ERALayout>
    );
  }

  if (error) {
    return (
      <ERALayout>
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar treinamentos. Tente novamente.</p>
        </div>
      </ERALayout>
    );
  }

  return (
    <ERALayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-era-dark-blue">Treinamentos</h1>
            <p className="text-era-gray">Explore nossos cursos de PABX e Omnichannel</p>
          </div>
          {isAdmin && (
            <Button className="era-lime-button font-medium px-6 py-2 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-era-gray h-4 w-4" />
            <Input
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cursos */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-era-gray">
              {courses.length === 0 
                ? 'Nenhum curso disponível no momento.' 
                : 'Nenhum curso encontrado com os filtros aplicados.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onStartCourse={handleStartCourse}
              />
            ))}
          </div>
        )}

        {/* Estatísticas */}
        <div className="bg-gradient-to-r from-era-dark-blue to-era-lime rounded-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{courses.length}</div>
              <p className="text-era-light-gray">Cursos Disponíveis</p>
            </div>
            <div>
              <div className="text-3xl font-bold">{categories.length}</div>
              <p className="text-era-light-gray">Categorias</p>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <p className="text-era-light-gray">Horas de Conteúdo</p>
            </div>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Treinamentos;
