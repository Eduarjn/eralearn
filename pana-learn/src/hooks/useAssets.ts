import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export interface Asset {
  id: string;
  provider: 'internal' | 'youtube';
  youtube_id?: string;
  youtube_url?: string;
  bucket?: string;
  path?: string;
  mime?: string;
  size_bytes?: number;
  duration_seconds?: number;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoSource {
  kind: 'internal' | 'youtube';
  url: string;
  mime?: string;
  title?: string;
  id?: string;
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseBrowser()
        .from('assets')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAssetById = async (id: string): Promise<Asset | null> => {
    try {
      const { data, error } = await supabaseBrowser()
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Erro ao buscar asset:', err);
      return null;
    }
  };

  const getVideoSource = async (assetId: string): Promise<VideoSource | null> => {
    try {
      const response = await fetch(`/api/media?id=${assetId}`);
      if (!response.ok) {
        throw new Error('Falha ao obter fonte do vídeo');
      }
      
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Erro ao obter fonte do vídeo:', err);
      return null;
    }
  };

  const createAsset = async (assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabaseBrowser()
        .from('assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      setAssets(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Erro ao criar asset:', err);
      return null;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabaseBrowser()
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      setAssets(prev => prev.map(asset => asset.id === id ? data : asset));
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar asset:', err);
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabaseBrowser()
        .from('assets')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      
      // Remover da lista local
      setAssets(prev => prev.filter(asset => asset.id !== id));
      return true;
    } catch (err: any) {
      console.error('Erro ao deletar asset:', err);
      return false;
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const createYouTubeAsset = async (youtubeUrl: string, title?: string): Promise<Asset | null> => {
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      throw new Error('URL do YouTube inválida');
    }

    return createAsset({
      provider: 'youtube',
      youtube_id: youtubeId,
      youtube_url: youtubeUrl,
      title: title || `Vídeo YouTube ${youtubeId}`,
      ativo: true
    });
  };

  const createInternalAsset = async (
    path: string, 
    mime: string, 
    sizeBytes: number,
    title?: string,
    durationSeconds?: number
  ): Promise<Asset | null> => {
    return createAsset({
      provider: 'internal',
      path,
      mime,
      size_bytes: sizeBytes,
      duration_seconds: durationSeconds,
      title: title || `Vídeo ${path.split('/').pop()}`,
      ativo: true
    });
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    getAssetById,
    getVideoSource,
    createAsset,
    updateAsset,
    deleteAsset,
    createYouTubeAsset,
    createInternalAsset,
    extractYouTubeId
  };
}














