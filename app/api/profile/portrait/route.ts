import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient, uploadToStorage } from "@/lib/supabase";
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

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const serviceClient = createSupabaseServiceClient();
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${user.id}/portrait-${Date.now()}-${file.name}`;
  const url = await uploadToStorage(
    serviceClient,
    "portraits",
    fileName,
    fileBuffer,
    file.type
  );

  const { error } = await supabase
    .from("profiles")
    .update({ portrait_url: url })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url });
}
