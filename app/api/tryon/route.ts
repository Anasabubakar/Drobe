import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseServiceClient, uploadToStorage } from "@/lib/supabase";
import { generateTryOn } from "@/lib/fashn";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { garment_id, outfit_id } = body;

  const { data: profile } = await supabase
    .from("profiles")
    .select("portrait_url")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.portrait_url) {
    return NextResponse.json({ error: "No portrait" }, { status: 400 });
  }

  let garmentUrl: string | null = null;
  let garmentCategory = "top";

  if (garment_id) {
    const { data: item } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("id", garment_id)
      .eq("user_id", user.id)
      .single();

    if (!item) {
      return NextResponse.json({ error: "No item" }, { status: 404 });
    }
    garmentUrl = item.clean_image_url || item.image_url;
    garmentCategory = item.category;

  } else if (outfit_id) {
    const { data: outfitItems } = await supabase
      .from("outfit_items")
      .select("clothing_items(*)")
      .eq("outfit_id", outfit_id);

    if (!outfitItems || outfitItems.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const priorityOrder = ["dress", "top", "outerwear", "bottom"];
    const items = outfitItems
      .map((oi: any) => oi.clothing_items)
      .filter(Boolean);

    let primaryItem: any = null;
    for (const cat of priorityOrder) {
      primaryItem = items.find((i: any) => i.category === cat) || null;
      if (primaryItem) break;
    }

    if (!primaryItem) primaryItem = items[0];
    garmentUrl = primaryItem.clean_image_url || primaryItem.image_url;
    garmentCategory = primaryItem.category;
  }

  if (!garmentUrl) {
    return NextResponse.json({ error: "No garment" }, { status: 400 });
  }

  try {
    const previewUrl = await generateTryOn(
      profile.portrait_url,
      garmentUrl,
      garmentCategory
    );

    if (outfit_id && previewUrl) {
      const serviceClient = createSupabaseServiceClient();
      const res = await fetch(previewUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const storedUrl = await uploadToStorage(
        serviceClient,
        "tryon-output",
        `${user.id}/${outfit_id}-${Date.now()}.jpg`,
        buffer,
        "image/jpeg"
      );

      await supabase
        .from("outfits")
        .update({ ai_preview_url: storedUrl })
        .eq("id", outfit_id);

      return NextResponse.json({ preview_url: storedUrl, status: "completed" });
    }

    return NextResponse.json({ preview_url: previewUrl, status: "completed" });

  } catch (err) {
    return NextResponse.json({ error: "Try-on failed" }, { status: 500 });
  }
}
