import sharp from "sharp";
import { createAdminClient } from "./server";

const BUCKET = "site-assets";

// SVGs are vector (converting is pointless) and GIFs are usually animated
// (a naive webp conversion would silently drop the animation) — everything
// else gets converted to webp to keep the site light.
const SKIP_CONVERSION_TYPES = new Set(["image/svg+xml", "image/gif"]);

export async function uploadPublicImage(
  file: FormDataEntryValue | null,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  if (!(file instanceof File) || file.size === 0) return { url: null, error: null };

  const admin = await createAdminClient();

  let body: Buffer | File = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "png";
  let contentType = file.type || undefined;

  if (!SKIP_CONVERSION_TYPES.has(file.type)) {
    try {
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      body = await sharp(inputBuffer).webp({ quality: 82 }).toBuffer();
      ext = "webp";
      contentType = "image/webp";
    } catch (err) {
      console.error("Image conversion to webp failed, uploading original:", err);
    }
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, body, {
    cacheControl: "31536000",
    upsert: false,
    contentType,
  });

  if (error) {
    console.error("Image upload failed:", error.message);
    return { url: null, error: error.message };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
