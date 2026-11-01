import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

// A small (192x192), guaranteed-tiny PNG version of the site's favicon, for
// use as a Web Push notification icon — NOT the raw site_config.favicon_url
// directly. That file (whatever size an admin happened to upload — one
// observed case was ~190KB) made Chrome's showNotification() resolve
// without ever actually displaying anything, confirmed by hand; this route
// exists specifically to never let that regress, by always serving a small
// re-encoded copy regardless of what the source image's real size is.
const SIZE = 192;

export async function GET() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("site_config").select("value").eq("key", "favicon_url").maybeSingle();
  const faviconUrl = data?.value as string | undefined;
  if (!faviconUrl) return new Response(null, { status: 404 });

  const upstream = await fetch(faviconUrl, { next: { revalidate: 3600 } }).catch(() => null);
  if (!upstream || !upstream.ok) return new Response(null, { status: 404 });

  const inputBuffer = Buffer.from(await upstream.arrayBuffer());
  const output = await sharp(inputBuffer)
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return new Response(output, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
