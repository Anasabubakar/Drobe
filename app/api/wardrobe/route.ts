import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, uploadToStorage } from "@/lib/supabase";
import { removeBackground } from "@/lib/replicate";
import { analyzeClothingImage } from "@/lib/nvidia";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const STATUS_BAD_REQUEST = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_NOT_FOUND = 404;
const STATUS_INTERNAL_SERVER_ERROR = 500;
const STATUS_CREATED = 201;

export async function GET(req: NextRequest) {
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: STATUS_UNAUTHORIZED });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let query = supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: STATUS_INTERNAL_SERVER_ERROR });

  return NextResponse.json({ items: data });
}

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: STATUS_UNAUTHORIZED });

  const serviceClient = createSupabaseServiceClient();
  const formData = await req.formData();
  const imageFile = formData.get("image") as File;
  const skipAI = formData.get("skipAI") === "true";

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: STATUS_BAD_REQUEST });
  }

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
  const imageUrl = await uploadToStorage(
    serviceClient, "wardrobe", fileName, imageBuffer, imageFile.type
  );

  const [bgRemovedUrl, aiAnalysis] = await Promise.all([
    removeBackground(imageUrl).catch(() => null),
    skipAI ? null : analyzeClothingImage(imageUrl).catch(() => null),
  ]);

  let cleanImageUrl: string | null = null;
  if (bgRemovedUrl) {
    try {
      const cleanRes = await fetch(bgRemovedUrl);
      const cleanBuffer = Buffer.from(await cleanRes.arrayBuffer());
      const cleanFileName = `${user.id}/${Date.now()}-clean-${imageFile.name}`;
      cleanImageUrl = await uploadToStorage(
        serviceClient, "wardrobe", cleanFileName, cleanBuffer, "image/png"
      );
    } catch {
      cleanImageUrl = null;
    }
  }

  const itemData = {
    user_id: user.id,
    name: (formData.get("name") as string) || (aiAnalysis?.suggested_name) || "Untitled Item",
    category: (formData.get("category") as string) || (aiAnalysis?.category) || "top",
    color: (formData.get("color") as string) || (aiAnalysis?.color) || null,
    image_url: imageUrl,
    clean_image_url: cleanImageUrl,
    tags: aiAnalysis?.tags || [],
    brand: (formData.get("brand") as string) || null,
  };

  const { data, error } = await supabase
    .from("clothing_items")
    .insert(itemData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: STATUS_INTERNAL_SERVER_ERROR });

  return NextResponse.json({ item: data }, { status: STATUS_CREATED });
}

export async function DELETE(req: NextRequest) {
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: STATUS_UNAUTHORIZED });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No ID provided" }, { status: STATUS_BAD_REQUEST });

  const { error } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: STATUS_INTERNAL_SERVER_ERROR });
  return NextResponse.json({ success: true });
}
