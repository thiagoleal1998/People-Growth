import sharp from "sharp";
import { createAdminClient } from "./server";

const BUCKET = "site-assets";

// SVGs are vector (converting is pointless) and GIFs are usually animated
// (a naive webp conversion would silently drop the animation) — everything
// else gets converted to webp to keep the site light.
const SKIP_CONVERSION_TYPES = new Set(["image/svg+xml", "image/gif"]);

const MAX_BYTES = 1024 * 1024; // 1MB
const MAX_SKIP_CONVERSION_BYTES = 3 * 1024 * 1024; // SVG/GIF pass through as-is, so cap raw size instead

export async function uploadPublicImage(
  file: FormDataEntryValue | null,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  if (!(file instanceof File) || file.size === 0) return { url: null, error: null };

  if (SKIP_CONVERSION_TYPES.has(file.type) && file.size > MAX_SKIP_CONVERSION_BYTES) {
    return { url: null, error: "Arquivo muito grande (máximo 3MB para SVG/GIF)." };
  }

  const admin = await createAdminClient();

  let body: Buffer | File = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "png";
  let contentType = file.type || undefined;

  if (!SKIP_CONVERSION_TYPES.has(file.type)) {
    try {
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      let quality = 82;
      let converted = await sharp(inputBuffer).webp({ quality }).toBuffer();
      while (converted.length > MAX_BYTES && quality > 35) {
        quality -= 15;
        converted = await sharp(inputBuffer).webp({ quality }).toBuffer();
      }
      if (converted.length > MAX_BYTES) {
        // Still too big even at low quality — the image is probably huge in
        // pixel dimensions, so scale it down too instead of degrading further.
        converted = await sharp(inputBuffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 60 }).toBuffer();
      }
      if (converted.length > MAX_BYTES) {
        return { url: null, error: "Não foi possível reduzir a imagem para menos de 1MB. Tente uma imagem menor." };
      }
      body = converted;
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
