import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getUserId } from '../lib/supabase';
import { ClothingItem, ClothingCategory } from '../types';
import { uploadImageToSupabase, deleteImageFromSupabase } from '../lib/storage';

export function useWardrobe(category: string = 'all') {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wardrobe', category],
    queryFn: async (): Promise<ClothingItem[]> => {
      const uid = await getUserId();
      if (!uid) return [];

      let query = supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ClothingItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: item } = await supabase
        .from('clothing_items')
        .select('image_url, clean_image_url')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('clothing_items').delete().eq('id', id);
      if (error) throw error;

      if (item?.image_url) {
        await deleteImageFromSupabase('wardrobe', item.image_url).catch(() => {});
      }
      if (item?.clean_image_url) {
        await deleteImageFromSupabase('wardrobe', item.clean_image_url).catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  return {
    items: data ?? [],
    isLoading,
    error,
    refetch,
    deleteItem: deleteMutation.mutateAsync,
  };
}

export interface NewClothingItem {
  name: string;
  category: ClothingCategory;
  color?: string | null;
  brand?: string | null;
  notes?: string | null;
  tags?: string[];
  localImageUri: string;
}

export async function createClothingItem(input: NewClothingItem): Promise<ClothingItem> {
  const uid = await getUserId();
  if (!uid) throw new Error('Not authenticated');

  const imageUrl = await uploadImageToSupabase(input.localImageUri, 'wardrobe', uid);

  const { data, error } = await supabase
    .from('clothing_items')
    .insert({
      user_id: uid,
      name: input.name || 'Untitled Item',
      category: input.category,
      color: input.color ?? null,
      brand: input.brand ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? [],
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClothingItem;
}

export async function updateClothingItem(
  id: string,
  patch: Partial<Omit<ClothingItem, 'id' | 'user_id' | 'created_at'>>
): Promise<ClothingItem> {
  const { data, error } = await supabase
    .from('clothing_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ClothingItem;
}

export function useClothingItem(id: string | undefined) {
  return useQuery({
    queryKey: ['clothing', id],
    enabled: !!id,
    queryFn: async (): Promise<ClothingItem | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ClothingItem;
    },
  });
}
