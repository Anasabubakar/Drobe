import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, uploadToStorage } from "@/lib/supabase";
import { removeBackground } from "@/lib/replicate";
import { analyzeBatchPhoto } from "@/lib/nvidia";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string }[] { return cookieStore.getAll() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const formData = await req.formData();
  const imageFile = formData.get("image") as File;
  const skipAI = formData.get("skipAI") === "true";

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const batchFileName = `${user.id}/batch/${Date.now()}-batch.jpg`;
  const batchImageUrl = await uploadToStorage(
    serviceClient, "wardrobe", batchFileName, imageBuffer, imageFile.type
  );

  const analysis = await analyzeBatchPhoto(batchImageUrl);

  if (analysis.detected_count === 0) {
    return NextResponse.json({
      error: "No clothing items detected in this photo. Try a clearer shot with better lighting.",
      segments: [],
    });
  }

  const cleanImageUrl = await removeBackground(batchImageUrl).catch(() => null);

  const segments = analysis.items.map((item, index) => ({
    index,
    source_image_url: batchImageUrl,
    clean_source_url: cleanImageUrl,
    detected_category: item.category,
    detected_color: item.color,
    suggested_name: item.description,
    cropped_url: null,
  }));

  return NextResponse.json({
    source_image_url: batchImageUrl,
    detected_count: analysis.detected_count,
    segments,
  });
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string }[] { return cookieStore.getAll() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const body = await req.json();
  const { confirmed_items } = body as {
    confirmed_items: {
      name: string;
      category: string;
      color: string;
      image_url: string;
      clean_image_url?: string;
    }[];
  };

  if (!confirmed_items || confirmed_items.length === 0) {
    return NextResponse.json({ error: "No items to confirm" }, { status: 400 });
  }

  const insertData = confirmed_items.map((item) => ({
    user_id: user.id,
    name: item.name,
    category: item.category,
    color: item.color,
    image_url: item.image_url,
    clean_image_url: item.clean_image_url || null,
    tags: [],
    brand: null,
  }));

  const { data, error } = await supabase
    .from("clothing_items")
    .insert(insertData)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    added: data.length,
    items: data,
  }, { status: 201 });
}
