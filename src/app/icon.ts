import { createClient } from "@/lib/supabase/server";

// Next's `favicon` file convention only supports a static .ico file, but
// ours is admin-configurable (site_config.favicon_url, uploaded via
// Configurações) — so this uses the `icon` route-handler convention instead,
// which Next auto-wires into the <head>'s <link rel="icon"> tag for us.
// Doing this also fixes a real bug: that tag previously pointed straight at
// the Supabase Storage URL (a different domain from grupofestina.com.br),
// and Google only reliably shows a site's favicon in search results when
// it's served same-domain — this proxies the configured image through our
// own domain instead.
export const contentType = "image/png";

export default async function Icon() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("site_config")
    .select("value")
    .eq("key", "favicon_url")
    .maybeSingle();

  const faviconUrl = data?.value as string | undefined;
  if (!faviconUrl) {
    return new Response(null, { status: 404 });
  }

  const upstream = await fetch(faviconUrl, { next: { revalidate: 3600 } });
  if (!upstream.ok) {
    return new Response(null, { status: 404 });
  }

  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
