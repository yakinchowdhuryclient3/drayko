import { createClient } from "@/lib/supabase/client";

type Bucket = "product-images" | "category-images" | "slides" | "size-guides";

// ============ UPLOAD IMAGE ============
export async function uploadImage(
  file: File,
  bucket: Bucket,
  folder: string = ""
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${random}.${ext}`;

    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { url: null, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Upload exception:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// ============ DELETE IMAGE ============
export async function deleteImage(
  url: string,
  bucket: Bucket
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();

    const urlParts = url.split(`/${bucket}/`);
    if (urlParts.length < 2) {
      return { success: false, error: "Invalid URL format" };
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Delete exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

// ============ VALIDATE IMAGE ============
export function validateImage(file: File): {
  valid: boolean;
  error: string | null;
} {
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, WebP, GIF allowed",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File size must be under 5MB",
    };
  }

  return { valid: true, error: null };
}