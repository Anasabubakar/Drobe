import type { ClothingItem, AISuggestResponse } from "@/types";

export const MOCK_ITEMS: ClothingItem[] = [
  {
    id: "mock-1",
    user_id: "mock-user",
    name: "Black Graphic Tee",
    category: "top",
    color: "black",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500",
    clean_image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500",
    tags: ["casual", "summer"],
    brand: "unknown",
    notes: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    user_id: "mock-user",
    name: "Blue Denim Jeans",
    category: "bottom",
    color: "blue",
    image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=500",
    clean_image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=500",
    tags: ["casual", "denim"],
    brand: "unknown",
    notes: null,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_SUGGESTIONS: AISuggestResponse = {
  outfits: [
    {
      name: "Casual Weekend",
      occasion: "casual",
      reasoning: "This combination is comfortable and timeless.",
      items: ["mock-1", "mock-2"],
    },
  ],
};

export const MOCK_ANALYSIS = {
  category: "top",
  color: "black",
  tags: ["casual"],
  suggested_name: "Mock Clothing Item",
};

export const MOCK_BATCH_ANALYSIS = {
  detected_count: 2,
  items: [
    { description: "Mock Top", category: "top", color: "black" },
    { description: "Mock Bottom", category: "bottom", color: "blue" },
  ],
};
