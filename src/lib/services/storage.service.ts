import { supabase } from "@/lib/supabase/client";

export async function uploadFile(
  bucket: string,
  file: File,
  fileName: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) {
    console.error("uploadFile:", error);
    return null;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function uploadPrivateFile(
  bucket: string,
  file: File,
  fileName: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) {
    console.error("uploadPrivateFile:", error);
    return null;
  }

  return fileName;
}