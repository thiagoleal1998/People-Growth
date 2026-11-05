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
  const params = new URL(request.url).searchParams;
  const src = params.get("src");
  if (!src || !src.startsWith(ALLOWED_PREFIX)) {
    return new Response("Invalid src", { status: 400 });
  }

  // "cover" (the default) is right for a real cover photo — zoom/crop to
  // fill the frame. A logo is the opposite: usually a wide, mostly-empty
  // wordmark meant for a dark navbar, so "cover" blows it up into an
  // illegible white-on-white crop. "contain" fits the whole logo on a
  // solid background instead, for callers that pass one (e.g. the
  // homepage's og:image fallback when no banner is configured).
  const fit: "cover" | "contain" = params.get("fit") === "contain" ? "contain" : "cover";
  const bgParam = params.get("bg");
  const background = /^[0-9a-fA-F]{6}$/.test(bgParam ?? "") ? `#${bgParam}` : "#0d1b2a";

  const upstream = await fetch(src, { next: { revalidate: 31536000 } }).catch(() => null);
  if (!upstream || !upstream.ok) {
    return new Response("Source image not found", { status: 404 });
  }

  const inputBuffer = Buffer.from(await upstream.arrayBuffer());
  const resizeOpts = fit === "contain" ? { fit, background } : { fit, position: "attention" as const };
  // Only "contain" needs the flatten — it's the one case with real
  // letterboxed space to fill. Leave "cover" (real cover photos) exactly
  // as before: any transparency in the source still passes through as-is.
  const render = () => {
    const img = sharp(inputBuffer).resize(WIDTH, HEIGHT, resizeOpts);
    return (fit === "contain" ? img.flatten({ background }) : img).webp({ quality }).toBuffer();
  };
  let quality = 80;
  let output = await render();
  while (output.length > MAX_BYTES && quality > 35) {
    quality -= 15;
    output = await render();
  }

  return new Response(output, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
