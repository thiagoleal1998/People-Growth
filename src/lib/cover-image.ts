// Hosts known to serve temporary/signed URLs for AI-generated images —
// explicitly designed to expire (ChatGPT's own image attachments are
// typically gone within about an hour) rather than meant for permanent
// hosting. A stable external URL (a press kit photo, a wire service image)
// is NOT flagged here and works fine as a cover image directly — only
// these specific, known-ephemeral hosts are a real problem: by the time
// anyone opens the published article, or it gets shared, the link can
// already be dead. Confirmed by hand on a real article whose cover had
// quietly become unusable this way.
const EPHEMERAL_IMAGE_HOSTS = ["images.openai.com", "oaiusercontent.com"];

export function isEphemeralCoverImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  let hostname: string;
  try {
    hostname = new URL(trimmed).hostname;
  } catch {
    return false;
  }
  return EPHEMERAL_IMAGE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}
