import sharp from "sharp";

// Crops/resizes an already-uploaded cover image to the exact 1200x630 that
// social crawlers expect for a "large image" card, re-encoded small — unlike
// the raw cover image (arbitrary aspect ratio, up to 1MB), which several
// platforms' link-preview crawlers (WhatsApp in particular) are known to
// silently drop if the declared og:image dimensions don't match the real
// file or the file is too large. Only ever proxies our own Storage bucket
// (checked below) — this is a public, unauthenticated route, so fetching an
// arbitrary `src` would be an open SSRF proxy otherwise.
const ALLOWED_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 280 * 1024; // comfortably under the ~300KB soft limit reported for WhatsApp link previews

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src || !src.startsWith(ALLOWED_PREFIX)) {
    return new Response("Invalid src", { status: 400 });
  }

  const upstream = await fetch(src, { next: { revalidate: 31536000 } }).catch(() => null);
  if (!upstream || !upstream.ok) {
    return new Response("Source image not found", { status: 404 });
  }

  const inputBuffer = Buffer.from(await upstream.arrayBuffer());
  let quality = 80;
  let output = await sharp(inputBuffer).resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" }).webp({ quality }).toBuffer();
  while (output.length > MAX_BYTES && quality > 35) {
    quality -= 15;
    output = await sharp(inputBuffer).resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" }).webp({ quality }).toBuffer();
  }

  return new Response(output, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
