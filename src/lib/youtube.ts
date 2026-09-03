/**
 * Extracts the 11-character video ID from any common YouTube URL format
 * (watch, youtu.be, live, shorts, or an already-built /embed/ URL).
 */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname;
  if (!/(^|\.)youtube\.com$/.test(host) && !/(^|\.)youtu\.be$/.test(host)) {
    return null;
  }

  if (host.includes("youtu.be")) {
    return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  }
  if (parsed.pathname === "/watch") {
    return parsed.searchParams.get("v");
  }
  if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/shorts/")) {
    return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
  }
  return null;
}

/**
 * Converts common YouTube URL formats (watch, youtu.be, live, shorts) into an
 * embeddable /embed/ URL. YouTube refuses to render "watch" pages inside an
 * iframe, so pasting a regular share link otherwise renders a blank/broken box.
 */
export function toYouTubeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/\/embed\//.test(trimmed)) return trimmed;

  const videoId = extractYouTubeId(trimmed);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
}

/**
 * hqdefault.jpg exists for every YouTube video (unlike maxresdefault, which
 * is missing for older/low-res uploads and 404s instead of falling back).
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url.trim());
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

/**
 * Adds autoplay params to an embed URL. Browsers only allow autoplay when
 * the video starts muted — the viewer can unmute from the player's own
 * controls, same as UOL's "ao vivo" box.
 */
export function withAutoplay(embedUrl: string): string {
  if (!embedUrl) return embedUrl;
  try {
    const url = new URL(embedUrl);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("mute", "1");
    url.searchParams.set("playsinline", "1");
    return url.toString();
  } catch {
    return embedUrl;
  }
}
