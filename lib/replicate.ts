// lib/replicate.ts
// Replicate API — clothing segmentation + background removal

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// ============================================
// BACKGROUND REMOVAL — single clothing item
// Model: cjwbw/rembg (fast, accurate for clothes)
// ============================================
export async function removeBackground(imageUrl: string): Promise<string> {
  const output = await replicate.run(
    "cjwbw/rembg:fb8af171cfa1616ddcf1242c851b9494bfb38b5cc4b5797b66b6bd68dd00c7",
    {
      input: {
        image: imageUrl,
        model: "u2netp",  // fast model, good for clothing
      },
    }
  );

  // output is a URL string or ReadableStream
  if (typeof output === "string") return output;
  // If it's a stream/object, convert to string
  return String(output);
}

// ============================================
// BATCH SEGMENTATION — multiple clothes in one photo
// Model: schannel/clothseg — fashion-specific segmentation
// Fallback: use manual approach with multiple crop suggestions
// ============================================
export async function segmentBatchClothing(imageUrl: string): Promise<{
  masks: string[];  // array of cropped clothing item image URLs
}> {
  try {
    // Primary: Use a segmentation model to detect individual items
    // SAM2 can segment all objects in an image
    const output = (await replicate.run(
      "meta/sam-2:fe5dcba7d0a74b7c3cf5bc9a7b6dcde82024fa8498e2f5e3fe0b11b6b8a5ab16",
      {
        input: {
          image: imageUrl,
          multimask_output: true,
          use_m2m: true,
          // points_per_side determines how many items it tries to segment
          points_per_side: 16,
        },
      }
    )) as { masks: string[] };

    return output;
  } catch {
    // Fallback: just return the original image so user can crop manually
    console.warn("SAM2 segmentation failed, returning original");
    return { masks: [imageUrl] };
  }
}

// ============================================
// CLOTHING DETECTION — identify what category an item is
// Uses CLIP-style model to classify the clothing
// ============================================
export async function detectClothingCategory(imageUrl: string): Promise<{
  category: string;
  color: string;
  confidence: number;
}> {
  const categories = [
    "t-shirt", "shirt", "blouse", "sweater", "hoodie",      // tops
    "pants", "jeans", "skirt", "shorts", "trousers",         // bottoms
    "dress", "jumpsuit",                                      // dresses
    "jacket", "coat", "blazer",                              // outerwear
    "shoes", "sneakers", "boots", "sandals", "heels",        // shoes
    "bag", "hat", "belt", "scarf", "jewelry",                // accessories
  ];

  try {
    const output = (await replicate.run(
      "openai/clip-vit-large-patch14:large",
      {
        input: {
          image: imageUrl,
          text_inputs: categories.map((c) => `a photo of a ${c}`),
        },
      }
    )) as { logits_per_image: number[][] };

    const scores = output.logits_per_image[0];
    const maxIdx = scores.indexOf(Math.max(...scores));
    const detected = categories[maxIdx];

    // Map specific category to our schema enum
    const categoryMap: Record<string, string> = {
      "t-shirt": "top", shirt: "top", blouse: "top", sweater: "top", hoodie: "top",
      pants: "bottom", jeans: "bottom", skirt: "bottom", shorts: "bottom", trousers: "bottom",
      dress: "dress", jumpsuit: "dress",
      jacket: "outerwear", coat: "outerwear", blazer: "outerwear",
      shoes: "shoes", sneakers: "shoes", boots: "shoes", sandals: "shoes", heels: "shoes",
      bag: "accessory", hat: "accessory", belt: "accessory", scarf: "accessory", jewelry: "accessory",
    };

    return {
      category: categoryMap[detected] || "top",
      color: "unknown",  // color detection done separately or via Claude vision
      confidence: Math.max(...scores),
    };
  } catch {
    return { category: "top", color: "unknown", confidence: 0 };
  }
}
