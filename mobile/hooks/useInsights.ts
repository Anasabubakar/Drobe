import { useQuery } from '@tanstack/react-query';
import { supabase, getUserId } from '../lib/supabase';
import { ClothingItem } from '../types';

export interface WardrobeInsights {
  totalItems: number;
  totalOutfits: number;
  totalWorn: number;
  byCategory: Record<string, number>;
  mostWorn: Array<{ item: ClothingItem; wearCount: number }>;
  leastWorn: Array<{ item: ClothingItem; wearCount: number }>;
  unused: ClothingItem[];
  wearStreakDays: number;
}

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async (): Promise<WardrobeInsights> => {
      const uid = await getUserId();
      if (!uid) {
        return {
          totalItems: 0,
          totalOutfits: 0,
          totalWorn: 0,
          byCategory: {},
          mostWorn: [],
          leastWorn: [],
          unused: [],
          wearStreakDays: 0,
        };
      }

      const { data: items = [] } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', uid);

      const { count: outfitCount } = await supabase
        .from('outfits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid);

      const { data: wornDays = [] } = await supabase
        .from('outfit_schedule')
        .select('id, scheduled_date, outfit_id, outfits ( outfit_items ( clothing_item_id ) )')
        .eq('user_id', uid)
        .eq('is_worn', true)
        .order('scheduled_date', { ascending: false });

      // Wear count per clothing item
      const wearMap = new Map<string, number>();
      for (const day of wornDays as any[]) {
        const itemIds: string[] = (day.outfits?.outfit_items ?? []).map(
          (oi: any) => oi.clothing_item_id
        );
        for (const id of itemIds) wearMap.set(id, (wearMap.get(id) ?? 0) + 1);
      }

      const itemsList = (items ?? []) as ClothingItem[];
      const ranked = itemsList
        .map(item => ({ item, wearCount: wearMap.get(item.id) ?? 0 }))
        .sort((a, b) => b.wearCount - a.wearCount);

      const mostWorn = ranked.filter(r => r.wearCount > 0).slice(0, 6);
      const leastWorn = ranked
        .filter(r => r.wearCount > 0)
        .sort((a, b) => a.wearCount - b.wearCount)
        .slice(0, 6);
      const unused = ranked.filter(r => r.wearCount === 0).map(r => r.item);

      const byCategory: Record<string, number> = {};
      for (const item of itemsList) {
        byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
      }

      // Wear streak — consecutive days back from today with is_worn=true
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const wornSet = new Set(
        (wornDays as any[]).map(d => d.scheduled_date as string)
      );
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (wornSet.has(key)) streak++;
        else break;
      }

      return {
        totalItems: itemsList.length,
        totalOutfits: outfitCount ?? 0,
        totalWorn: (wornDays as any[]).length,
        byCategory,
        mostWorn,
        leastWorn,
        unused,
        wearStreakDays: streak,
      };
    },
  });
}
