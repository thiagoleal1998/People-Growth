// Matches /api/og-image's own allowlist — a cover_image URL outside this
// prefix (an external link, a temporary AI-image-generation URL, etc.) gets
// rejected by that route, which means a shared link's WhatsApp/social
// preview won't show a photo at all. Used to warn an admin/author at the
// point they paste the URL, instead of the problem only surfacing once
// someone shares the published link and nothing shows up.
export function isExternalCoverImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;
  return !trimmed.startsWith(prefix);
}
