import { createAdminClient } from "./server";

const BUCKET = "site-assets";

export async function uploadPublicImage(
  file: FormDataEntryValue | null,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  if (!(file instanceof File) || file.size === 0) return { url: null, error: null };

  const admin = await createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    console.error("Image upload failed:", error.message);
    return { url: null, error: error.message };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
