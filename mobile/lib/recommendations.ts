import { ClothingItem, ClothingCategory, OccasionType } from '../types';

export interface OutfitSuggestion {
  name: string;
  occasion: OccasionType;
  items: ClothingItem[];
  reasoning: string;
}

const SLOTS: ClothingCategory[][] = [
  ['top'],
  ['bottom'],
  ['shoes'],
];

const COMPLEMENTARY: Record<string, string[]> = {
  black: ['white', 'grey', 'beige', 'red', 'pink'],
  white: ['black', 'navy', 'blue', 'red'],
  navy: ['white', 'beige', 'pink'],
  beige: ['black', 'navy', 'brown', 'white'],
  grey: ['black', 'white', 'pink', 'navy'],
  brown: ['beige', 'white', 'green'],
  red: ['black', 'white', 'navy'],
  pink: ['black', 'grey', 'white', 'navy'],
  green: ['beige', 'brown', 'white'],
  blue: ['white', 'beige', 'navy'],
};

function colorScore(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  return COMPLEMENTARY[a]?.includes(b) ? 2 : 0;
}

function tagScore(item: ClothingItem, occasion: OccasionType): number {
  if (!item.tags?.length) return 0;
  return item.tags.includes(occasion) ? 2 : 0;
}

function pickBest(
  candidates: ClothingItem[],
  occasion: OccasionType,
  lastWornMap: Map<string, number>,
  paired: ClothingItem[],
  rng: () => number
): ClothingItem | null {
  if (candidates.length === 0) return null;

  const scored = candidates.map(item => {
    const lastWornDays = lastWornMap.get(item.id) ?? 999;
    const recencyPenalty = lastWornDays < 3 ? -3 : lastWornDays > 14 ? 2 : 0;
    const occasionScore = tagScore(item, occasion);
    const harmony =
      paired.reduce((sum, p) => sum + colorScore(item.color, p.color), 0) /
      Math.max(paired.length, 1);
    const jitter = rng() * 0.5;
    return { item, score: recencyPenalty + occasionScore + harmony + jitter };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? null;
}

export function suggestOutfits(
  wardrobe: ClothingItem[],
  occasion: OccasionType,
  options?: { count?: number; lastWornMap?: Map<string, number>; dressMode?: boolean }
): OutfitSuggestion[] {
  const { count = 3, lastWornMap = new Map(), dressMode = false } = options ?? {};
  const rng = mulberry32(Date.now() & 0xffff);

  const suggestions: OutfitSuggestion[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count * 4 && suggestions.length < count; i++) {
    const items: ClothingItem[] = [];

    if (dressMode) {
      const dresses = wardrobe.filter(w => w.category === 'dress');
      const dress = pickBest(dresses, occasion, lastWornMap, [], rng);
      if (dress) items.push(dress);
    } else {
      for (const slot of SLOTS) {
        const candidates = wardrobe.filter(w => slot.includes(w.category));
        const picked = pickBest(candidates, occasion, lastWornMap, items, rng);
        if (picked) items.push(picked);
      }
    }

    // Outerwear if cold seasons or formal/work
    if (occasion === 'work' || occasion === 'formal') {
      const outer = wardrobe.filter(w => w.category === 'outerwear');
      const picked = pickBest(outer, occasion, lastWornMap, items, rng);
      if (picked && rng() > 0.4) items.push(picked);
    }

    if (items.length < (dressMode ? 1 : 2)) continue;

    const key = items
      .map(i => i.id)
      .sort()
      .join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    suggestions.push({
      name: occasionToName(occasion, items),
      occasion,
      items,
      reasoning: buildReasoning(items, occasion),
    });
  }

  return suggestions;
}

function occasionToName(occasion: OccasionType, items: ClothingItem[]): string {
  const colorWord = items.find(i => i.color)?.color;
  const labels: Record<OccasionType, string> = {
    casual: 'Easy Day',
    work: 'Workday Sharp',
    formal: 'Evening Edit',
    gym: 'Active Set',
    date: 'Night Out',
    other: 'Curated Look',
  };
  const base = labels[occasion] ?? 'Look';
  return colorWord ? `${capitalize(colorWord)} ${base}` : base;
}

function buildReasoning(items: ClothingItem[], occasion: OccasionType): string {
  const colors = Array.from(new Set(items.map(i => i.color).filter(Boolean)));
  const palette = colors.length > 1 ? `${colors.join(' + ')} palette` : `${colors[0] ?? 'neutral'} tones`;
  return `Built for ${occasion}: ${palette}, ${items.length} pieces.`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function getLastWornDaysMap(
  worn: Array<{ scheduled_date: string; itemIds: string[] }>
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const today = new Date();
  for (const entry of worn) {
    const d = new Date(entry.scheduled_date);
    const days = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    for (const id of entry.itemIds) {
      const prev = map.get(id);
      if (prev === undefined || days < prev) map.set(id, days);
    }
  }
  return map;
}
