// ============================================
// DROBE — Shared Types
// ============================================

export type ClothingCategory =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "accessory";

export type OccasionType =
  | "casual"
  | "work"
  | "formal"
  | "gym"
  | "date"
  | "other";

export interface Profile {
  id: string;
  full_name: string | null;
  portrait_url: string | null;
  created_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  color: string | null;
  image_url: string;
  clean_image_url: string | null;  // bg-removed version
  tags: string[];
  brand: string | null;
  notes: string | null;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  occasion: OccasionType | null;
  ai_preview_url: string | null;  // virtual try-on result
  notes: string | null;
  is_ai_generated: boolean;
  created_at: string;
  // joined
  outfit_items?: OutfitItem[];
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothing_item_id: string;
  // joined
  clothing_items?: ClothingItem;
}

export interface OutfitSchedule {
  id: string;
  user_id: string;
  outfit_id: string;
  scheduled_date: string; // ISO date "YYYY-MM-DD"
  is_worn: boolean;
  created_at: string;
  // joined
  outfits?: Outfit;
}

// ---- API Request/Response shapes ----

export interface BatchUploadResponse {
  segments: {
    index: number;
    image_url: string;          // stored in Supabase
    clean_image_url: string;    // bg-removed, stored in Supabase
    detected_category: ClothingCategory | null;
    detected_color: string | null;
  }[];
  total: number;
}

export interface AISuggestResponse {
  outfits: {
    name: string;
    occasion: OccasionType;
    reasoning: string;
    items: string[];  // array of clothing_item IDs
  }[];
}

export interface TryOnResponse {
  preview_url: string;  // Fashn.ai result image URL
  job_id: string;
  status: "completed" | "processing" | "failed";
}
