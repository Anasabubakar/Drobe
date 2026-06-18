import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Outfit, ClothingItem } from '../types';
import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export type OutfitWithItems = Outfit & { items: ClothingItem[] };

export function useOutfits() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['outfits'],
    queryFn: async () => {
      const { data } = await api.get('/api/outfits');
      return data.outfits as OutfitWithItems[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (outfit: { name: string; occasion: string; item_ids: string[] }) => {
      const { data } = await api.post('/api/outfits', outfit);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/outfits?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  return {
    outfits: data ?? [],
    isLoading,
    error,
    saveOutfit: saveMutation.mutateAsync,
    deleteOutfit: deleteMutation.mutateAsync,
  };
}

export async function triggerTryOn(garmentId?: string, outfitId?: string) {
  const { data } = await api.post('/api/tryon', { garment_id: garmentId, outfit_id: outfitId });
  return data;
}
