import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone_url: string;
  pontos: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  data_conquista: string;
  badge: Badge;
}

export function useUserBadges(userId?: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId)
      .order('data_conquista', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setBadges([]);
        } else {
          setBadges(data || []);
        }
        setLoading(false);
      });
  }, [userId]);

  return { badges, loading, error };
} 