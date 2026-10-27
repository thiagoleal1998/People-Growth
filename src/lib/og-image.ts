// Routes a cover image through /api/og-image so social crawlers always get
// a real 1200x630 file under the size social platforms expect, instead of
// the raw cover image (arbitrary aspect ratio/size as uploaded by an author).
//
// Only our own Storage bucket gets proxied — the route itself only accepts
// that prefix too (see src/app/api/og-image/route.ts), so this is just
// avoiding a pointless 400 for the common case. An externally-hosted cover
// (the article editor's "...ou URL da imagem" field) is passed through
// as-is: resizing an arbitrary external URL server-side would make this an
// open SSRF proxy, since the route is public and unauthenticated.
const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

export function ogImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (!src.startsWith(STORAGE_PREFIX)) return src;
  return `/api/og-image?src=${encodeURIComponent(src)}`;
}
