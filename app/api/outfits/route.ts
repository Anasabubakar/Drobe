// app/api/outfits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/outfits — list user's outfits
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("outfits")
    .select(`
      *,
      outfit_items (
        clothing_item_id,
        clothing_items (
          id,
          name,
          image_url,
          clean_image_url,
          category,
          color
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const outfits = data.map((outfit: any) => ({
    ...outfit,
    items: outfit.outfit_items.map((oi: any) => oi.clothing_items),
  }));

  const cleanedOutfits = outfits.map(({ outfit_items, ...rest }) => rest);

  return NextResponse.json({ outfits: cleanedOutfits });
}

// POST /api/outfits — create a new outfit
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
  const body = await req.json();
  const { name, occasion, item_ids } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data: outfit, error: outfitError } = await serviceClient
    .from("outfits")
    .insert({
      user_id: user.id,
      name,
      occasion,
    })
    .select()
    .single();

  if (outfitError) return NextResponse.json({ error: outfitError.message }, { status: 500 });

  if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
    const outfitItems = item_ids.map((itemId: string) => ({
      outfit_id: outfit.id,
      clothing_item_id: itemId,
    }));

    const { error: itemsError } = await serviceClient
      .from("outfit_items")
      .insert(outfitItems);

    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ outfit }, { status: 201 });
}

// DELETE /api/outfits?id=xxx
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
