import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoOrderManager } from '@/components/VideoOrderManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Video, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Curso {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
}

export default function GerenciarOrdemVideos() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile || userProfile.tipo_usuario !== 'admin') {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (cursoId) {
      loadCurso();
    }
  }, [cursoId, userProfile, navigate]);

  const loadCurso = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cursos')
        .select('id, nome, categoria, descricao')
        .eq('id', cursoId)
        .single();

      if (error) {
        console.error('Erro ao carregar curso:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o curso",
          variant: "destructive"
        });
        return;
      }

      setCurso(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = () => {
    toast({
      title: "Ordem Atualizada",
      description: "A ordem dos vídeos foi atualizada com sucesso!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Carregando...</span>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-4">O curso solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/admin/cursos')}>
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-600" />
              Gerenciar Ordem dos Vídeos
            </h1>
            <p className="text-gray-600 mt-1">
              Reorganize a sequência de vídeos do curso
            </p>
          </div>
        </div>
      </div>

      {/* Informações do Curso */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            {curso.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <p className="text-gray-900">{curso.categoria}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <p className="text-gray-900">{curso.descricao || 'Sem descrição'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciador de Ordem */}
      <VideoOrderManager 
        cursoId={cursoId!}
        onOrderChange={handleOrderChange}
      />

      {/* Instruções */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
              <p>Arraste os vídeos para reordená-los na sequência desejada</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
              <p>Clique em "Salvar Ordem" para aplicar as mudanças</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
              <p>Use "Resetar" para voltar à ordem por data de criação</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">!</span>
              <p>As mudanças afetam todos os usuários que assistem ao curso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
