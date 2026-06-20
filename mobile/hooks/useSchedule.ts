import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getUserId } from '../lib/supabase';
import { OutfitSchedule, ClothingItem, Outfit } from '../types';

export type ScheduleEntry = OutfitSchedule & {
  outfit: Outfit & { items: ClothingItem[] };
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function useSchedule(rangeStart: Date, rangeEnd: Date) {
  const queryClient = useQueryClient();

  const startKey = isoDate(rangeStart);
  const endKey = isoDate(rangeEnd);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schedule', startKey, endKey],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const uid = await getUserId();
      if (!uid) return [];

      const { data, error } = await supabase
        .from('outfit_schedule')
        .select(`
          *,
          outfits (
            *,
            outfit_items (
              clothing_items (*)
            )
          )
        `)
        .eq('user_id', uid)
        .gte('scheduled_date', startKey)
        .lte('scheduled_date', endKey)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        ...row,
        outfit: row.outfits
          ? {
              ...row.outfits,
              items: (row.outfits.outfit_items ?? [])
                .map((oi: any) => oi.clothing_items)
                .filter(Boolean),
            }
          : null,
      })) as ScheduleEntry[];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      outfit_id,
      scheduled_date,
    }: {
      outfit_id: string;
      scheduled_date: string;
    }) => {
      const uid = await getUserId();
      if (!uid) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outfit_schedule')
        .upsert(
          { user_id: uid, outfit_id, scheduled_date, is_worn: false },
          { onConflict: 'user_id,scheduled_date' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  const markWornMutation = useMutation({
    mutationFn: async ({ id, is_worn }: { id: string; is_worn: boolean }) => {
      const { error } = await supabase
        .from('outfit_schedule')
        .update({ is_worn })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('outfit_schedule').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return {
    entries: data ?? [],
    isLoading,
    error,
    refetch,
    assign: assignMutation.mutateAsync,
    markWorn: markWornMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
