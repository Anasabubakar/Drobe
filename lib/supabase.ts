// lib/supabase.ts
// Two clients: one for Client Components, one for Server (API routes)

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// ---- Browser client (use in Client Components) ----
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ---- Server client with service role (use in API routes only) ----
// This bypasses RLS — only use server-side where you trust the context
export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ---- Upload a file to Supabase Storage, return public URL ----
export async function uploadToStorage(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  bucket: string,
  path: string,
  file: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ---- Fetch image from URL and return as Buffer ----
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
