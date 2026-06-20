import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getUserId } from '../lib/supabase';
import { Outfit, ClothingItem } from '../types';

export type OutfitWithItems = Outfit & { items: ClothingItem[] };

async function fetchOutfits(): Promise<OutfitWithItems[]> {
  const uid = await getUserId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      outfit_items (
        clothing_items (*)
      )
    `)
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((o: any) => ({
    ...o,
    items: (o.outfit_items ?? [])
      .map((oi: any) => oi.clothing_items)
      .filter(Boolean) as ClothingItem[],
  }));
}

export function useOutfits() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['outfits'],
    queryFn: fetchOutfits,
  });

  const saveMutation = useMutation({
    mutationFn: async (outfit: {
      name: string;
      occasion: string;
      item_ids: string[];
      notes?: string;
      is_ai_generated?: boolean;
    }) => {
      const uid = await getUserId();
      if (!uid) throw new Error('Not authenticated');

      const { data: outfitRow, error: insertErr } = await supabase
        .from('outfits')
        .insert({
          user_id: uid,
          name: outfit.name,
          occasion: outfit.occasion,
          notes: outfit.notes ?? null,
          is_ai_generated: outfit.is_ai_generated ?? false,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      if (outfit.item_ids.length > 0) {
        const rows = outfit.item_ids.map(id => ({
          outfit_id: outfitRow.id,
          clothing_item_id: id,
        }));
        const { error: linkErr } = await supabase.from('outfit_items').insert(rows);
        if (linkErr) throw linkErr;
      }

      return outfitRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('outfits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return {
    outfits: data ?? [],
    isLoading,
    error,
    refetch,
    saveOutfit: saveMutation.mutateAsync,
    deleteOutfit: deleteMutation.mutateAsync,
  };
}

export function useOutfit(id: string | undefined) {
  return useQuery({
    queryKey: ['outfit', id],
    enabled: !!id,
    queryFn: async (): Promise<OutfitWithItems | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            clothing_items (*)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        items: (data.outfit_items ?? [])
          .map((oi: any) => oi.clothing_items)
          .filter(Boolean),
      } as OutfitWithItems;
    },
  });
}
