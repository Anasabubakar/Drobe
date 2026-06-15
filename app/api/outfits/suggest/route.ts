// app/api/outfits/suggest/route.ts
// AI suggests outfit combos from the user's wardrobe
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { suggestOutfits } from "@/lib/nvidia";
import type { OccasionType } from "@/types";

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

  const body = await req.json();
  const occasion: OccasionType | undefined = body.occasion;
  const count: number = body.count || 3;

  // Fetch user's wardrobe
  const { data: wardrobeItems, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", user.id)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!wardrobeItems || wardrobeItems.length < 2) {
    return NextResponse.json({
      error: "Add at least 2 items to your wardrobe to get AI suggestions.",
    }, { status: 400 });
  }

  const suggestions = await suggestOutfits(wardrobeItems, occasion, count);

  return NextResponse.json(suggestions);
}
