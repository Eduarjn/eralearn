import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUploadVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  async function upload(file: File, path?: string) {
    setLoading(true);
    setError(null);
    const filePath = path || `videos/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("training-videos").upload(filePath, file, { upsert: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const { data: publicData } = supabase.storage.from("training-videos").getPublicUrl(filePath);
    setResult({ url: publicData.publicUrl, name: file.name });
    setLoading(false);
  }

  return { upload, result, loading, error };
} 