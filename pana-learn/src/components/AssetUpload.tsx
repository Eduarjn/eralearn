import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Video, X, Youtube, HardDrive, Link, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import { useCourses, useCourseModules } from '@/hooks/useCourses';
import { toast } from '@/hooks/use-toast';

interface AssetUploadProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCourseId?: string;
}

type AssetProvider = 'internal' | 'youtube';

export function AssetUpload({ onClose, onSuccess, preSelectedCourseId }: AssetUploadProps) {
  const { userProfile } = useAuth();
  const { createYouTubeAsset, createInternalAsset, extractYouTubeId } = useAssets();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState(preSelectedCourseId || '');
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(selectedCourseId);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AssetProvider>('youtube');

  const [assetData, setAssetData] = useState({
    title: '',
    description: '',
    duration_seconds: 0,
  });

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  // Internal
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (youtubeUrl) {
      const id = extractYouTubeId(youtubeUrl);
      setYoutubeId(id || '');
    }
  }, [youtubeUrl, extractYouTubeId]);

  const handleYouTubeSubmit = async () => {
    if (!youtubeUrl || !youtubeId) {
      toast({
        title: 'Erro',
        description: 'URL do YouTube inválida',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedCourseId) {
      toast({
        title: 'Erro',
        description: 'Selecione um curso',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const asset = await createYouTubeAsset(youtubeUrl, assetData.title);
      
      if (asset) {
        // Criar registro na tabela videos
        const { data, error } = await supabaseBrowser()
          .from('videos')
          .insert([{
            titulo: assetData.title || `Vídeo YouTube ${youtubeId}`,
            descricao: assetData.description,
            duracao: assetData.duration_seconds,
            curso_id: selectedCourseId,
            modulo_id: selectedModuleId || null,
            asset_id: asset.id,
            ativo: true
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Vídeo do YouTube adicionado com sucesso!'
        });

        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao adicionar vídeo do YouTube:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar vídeo do YouTube',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInternalSubmit = async () => {
    if (!videoFile) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo de vídeo',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedCourseId) {
      toast({
        title: 'Erro',
        description: 'Selecione um curso',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload do arquivo para o servidor
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('course_id', selectedCourseId);
      formData.append('module_id', selectedModuleId || '');

      const response = await fetch('/api/upload/internal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo');
      }

      const uploadResult = await response.json();
      setUploadProgress(100);

      // Criar asset
      const asset = await createInternalAsset(
        uploadResult.path,
        videoFile.type,
        videoFile.size,
        assetData.title || videoFile.name,
        assetData.duration_seconds
      );

      if (asset) {
        // Criar registro na tabela videos
        const { data, error } = await supabaseBrowser()
          .from('videos')
          .insert([{
            titulo: assetData.title || videoFile.name,
            descricao: assetData.description,
            duracao: assetData.duration_seconds,
            curso_id: selectedCourseId,
            modulo_id: selectedModuleId || null,
            asset_id: asset.id,
            ativo: true
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Vídeo interno adicionado com sucesso!'
        });

        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload do vídeo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer upload do vídeo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = () => {
    if (activeProvider === 'youtube') {
      handleYouTubeSubmit();
    } else {
      handleInternalSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Adicionar Vídeo
              </CardTitle>
              <CardDescription>
                Adicione vídeos do YouTube ou faça upload de arquivos
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeProvider} onValueChange={(value) => setActiveProvider(value as AssetProvider)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Arquivo Local
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">URL do YouTube</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  {youtubeId && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ ID detectado: {youtubeId}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Vídeos do YouTube</p>
                      <p>• O vídeo será reproduzido com controles do YouTube</p>
                      <p>• Parâmetros reduzirão o branding (logo discreto)</p>
                      <p>• Não há custo de armazenamento</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="internal" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-file">Arquivo de Vídeo</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  {videoFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Arquivo selecionado: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Label>Progresso do Upload</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{uploadProgress}%</p>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HardDrive className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Vídeos Internos</p>
                      <p>• Controle total sobre reprodução e qualidade</p>
                      <p>• Sem branding externo</p>
                      <p>• Suporte a HLS e streaming otimizado</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Informações comuns */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Vídeo</Label>
              <Input
                id="title"
                placeholder="Digite o título do vídeo"
                value={assetData.title}
                onChange={(e) => setAssetData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do vídeo (opcional)"
                value={assetData.description}
                onChange={(e) => setAssetData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Duração em segundos (opcional)"
                value={assetData.duration_seconds}
                onChange={(e) => setAssetData(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Seleção de curso e módulo */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Curso</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourseId && (
              <div>
                <Label htmlFor="module">Módulo (opcional)</Label>
                <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem módulo</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.nome_modulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={uploading || !selectedCourseId || (activeProvider === 'youtube' && !youtubeId) || (activeProvider === 'internal' && !videoFile)}
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  {activeProvider === 'youtube' ? 'Adicionando...' : 'Fazendo Upload...'}
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}









