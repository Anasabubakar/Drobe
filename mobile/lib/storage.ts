import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

export type UploadBucket = 'wardrobe' | 'portraits' | 'tryon-output';

export async function uploadImageToSupabase(
  uri: string,
  bucket: UploadBucket,
  userId: string,
  options?: { maxWidth?: number; quality?: number }
): Promise<string> {
  const { maxWidth = 1080, quality = 0.85 } = options ?? {};

  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(resized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Buffer.from(base64, 'base64');

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImageFromSupabase(
  bucket: UploadBucket,
  publicUrl: string
): Promise<void> {
  const match = publicUrl.match(new RegExp(`/${bucket}/(.+)$`));
  if (!match) return;
  await supabase.storage.from(bucket).remove([match[1]]);
}
