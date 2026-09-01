/**
 * Converts common YouTube URL formats (watch, youtu.be, live, shorts) into an
 * embeddable /embed/ URL. YouTube refuses to render "watch" pages inside an
 * iframe, so pasting a regular share link otherwise renders a blank/broken box.
 */
export function toYouTubeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  let host: string;
  try {
    host = new URL(trimmed).hostname;
  } catch {
    return trimmed;
  }

  if (!/(^|\.)youtube\.com$/.test(host) && !/(^|\.)youtu\.be$/.test(host)) {
    return trimmed;
  }

  if (/\/embed\//.test(trimmed)) return trimmed;

  let videoId: string | null = null;
  try {
    const parsed = new URL(trimmed);
    if (host.includes("youtu.be")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null;
    }
  } catch {
    return trimmed;
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
}
