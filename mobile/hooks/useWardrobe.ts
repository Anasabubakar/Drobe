import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ClothingItem } from '../types';
import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export function useWardrobe(category: string = 'all') {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['wardrobe', category],
    queryFn: async () => {
      const { data } = await api.get(`/api/wardrobe?category=${category}`);
      return data.items as ClothingItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/wardrobe?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });

  return {
    items: data ?? [],
    isLoading,
    error,
    deleteItem: deleteMutation.mutateAsync,
  };
}

export async function uploadClothingItem(file: any) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post('/api/wardrobe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
