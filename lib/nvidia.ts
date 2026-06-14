// lib/nvidia.ts
// NVIDIA AI — outfit suggestions + clothing color/type analysis
import type { ClothingItem, OccasionType, AISuggestResponse } from "@/types";
import { fetchImageAsBuffer } from "./supabase";
import { MOCK_ITEMS, MOCK_SUGGESTIONS, MOCK_ANALYSIS, MOCK_BATCH_ANALYSIS } from "./mock";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const IS_MOCK_MODE = !NVIDIA_API_KEY || NVIDIA_API_KEY === "your-nvidia-api-key";

const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// ============================================
// OUTFIT SUGGESTIONS
// ============================================
export async function suggestOutfits(
  wardrobeItems: ClothingItem[],
  occasion?: OccasionType,
  count: number = 3
): Promise<AISuggestResponse> {
  if (IS_MOCK_MODE) {
    console.log("Using Mock Outfit Suggestions");
    return MOCK_SUGGESTIONS;
  }

  try {
    const wardrobeContext = wardrobeItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color || "unknown",
      tags: item.tags,
    }));

    const prompt = `You are a personal stylist. A user has the following clothes in their wardrobe:
${JSON.stringify(wardrobeContext, null, 2)}

Suggest ${count} outfit combinations${occasion ? ` suitable for a ${occasion} occasion` : ""}.

Rules:
- Each outfit should include 2-4 items that make sense together
- Only use item IDs from the list above
- Consider color harmony and category balance (usually top + bottom or a dress)
- Give each outfit a creative but concise name
- Provide a brief reasoning for why this outfit works

Respond ONLY with valid JSON in this exact format:
{
  "outfits": [
    {
      "name": "Creative Outfit Name",
      "occasion": "${occasion || "casual"}",
      "reasoning": "Short explanation of why this works",
      "items": ["clothing-item-id-1", "clothing-item-id-2"]
    }
  ]
}`;

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2.6",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 16384,
        temperature: 1.0,
        top_p: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    try {
      return JSON.parse(responseText) as AISuggestResponse;
    } catch (e) {
      console.error("Failed to parse NVIDIA response:", responseText);
      return MOCK_SUGGESTIONS;
    }
  } catch (error) {
    console.error("NVIDIA suggestOutfits failed:", error);
    return MOCK_SUGGESTIONS;
  }
}

// ============================================
// CLOTHING ANALYSIS — from image
// ============================================
export async function analyzeClothingImage(imageUrl: string): Promise<{
  category: string;
  color: string;
  tags: string[];
  suggested_name: string;
}> {
  if (IS_MOCK_MODE) {
    console.log("Using Mock Clothing Analysis");
    return MOCK_ANALYSIS;
  }

  try {
    const buffer = await fetchImageAsBuffer(imageUrl);
    const base64Data = buffer.toString('base64');
    const mimeType = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2.6",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this clothing item. Respond ONLY with JSON, no markdown:
{
  "category": "top|bottom|dress|outerwear|shoes|accessory",
  "color": "primary color name",
  "tags": ["tag1", "tag2", "tag3"],
  "suggested_name": "Descriptive item name"
}
For tags, use style descriptors like: casual, formal, summer, winter, streetwear, elegant, bold, neutral, etc.`
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Data}` }
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 1.0,
        top_p: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    try {
      return JSON.parse(responseText) as any;
    } catch (e) {
      console.error("Failed to parse NVIDIA response:", responseText);
      return MOCK_ANALYSIS;
    }
  } catch (error) {
    console.error("NVIDIA analyzeClothingImage failed:", error);
    return MOCK_ANALYSIS;
  }
}

// ============================================
// BATCH ANALYSIS — detect items in a dump photo
// ============================================
export async function analyzeBatchPhoto(imageUrl: string): Promise<{
  detected_count: number;
  items: { description: string; category: string; color: string }[];
}> {
  if (IS_MOCK_MODE) {
    console.log("Using Mock Batch Analysis");
    return MOCK_BATCH_ANALYSIS;
  }

  try {
    const buffer = await fetchImageAsBuffer(imageUrl);
    const base64Data = buffer.toString('base64');
    const mimeType = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2.6",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `This is a photo of multiple clothing items laid out. Identify every distinct clothing item visible.
Respond ONLY with JSON:
{
  "detected_count": 5,
  "items": [
    { "description": "Black graphic tee", "category": "top", "color": "black" },
    { "description": "Blue denim jeans", "category": "bottom", "color": "blue" }
  ]
}
Category must be one of: top, bottom, dress, outerwear, shoes, accessory`
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Data}` }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 1.0,
        top_p: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    try {
      return JSON.parse(responseText) as any;
    } catch (e) {
      console.error("Failed to parse NVIDIA response:", responseText);
      return MOCK_BATCH_ANALYSIS;
    }
  } catch (error) {
    console.error("NVIDIA analyzeBatchPhoto failed:", error);
    return MOCK_BATCH_ANALYSIS;
  }
}
