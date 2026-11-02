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

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // a few minutes of voice at typical webm/opus bitrates

// Identifies the container from its actual bytes rather than trusting the
// client-declared File.type — a spoofed Content-Type (e.g. a real
// text/html payload sent as "audio/webm") would otherwise get stored and
// served from this bucket's public, trusted URL with that lying header,
// which browser MIME-sniffing could render as HTML on a direct visit.
function sniffAudioContentType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "audio/webm"; // EBML/Matroska
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return "audio/ogg"; // "OggS"
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) return "audio/wav"; // RIFF....WAVE
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return "audio/mp4"; // ISO base media "ftyp"
  return null;
}

// Browser-recorded voice messages (MessagesClient's mic button) — no
// conversion, just uploaded as the browser's MediaRecorder produced them
// (webm/opus in Chrome/Edge, mp4/aac in Safari).
export async function uploadPublicAudio(
  file: FormDataEntryValue | null,
  folder: string
): Promise<{ url: string | null; error: string | null }> {
  if (!(file instanceof File) || file.size === 0) return { url: null, error: null };
  if (file.size > MAX_AUDIO_BYTES) return { url: null, error: "Áudio muito grande (máximo 10MB)." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = sniffAudioContentType(buffer);
  if (!detectedType) return { url: null, error: "Arquivo não reconhecido como áudio válido." };

  const admin = await createAdminClient();
  const extByType: Record<string, string> = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mp4": "mp4" };
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extByType[detectedType]}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    cacheControl: "31536000",
    upsert: false,
    contentType: detectedType,
  });

  if (error) {
    console.error("Audio upload failed:", error.message);
    return { url: null, error: error.message };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
