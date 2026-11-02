// Per-platform follower-count fetchers behind one interface — the cron
// route and the admin "Buscar agora" action never need to know which
// platforms actually work. Never throws: every failure (missing
// credentials, network error, unexpected response shape) becomes
// { ok: false, error }, so a bad platform never crashes the batch.
//
// Tested directly (plain Node fetch, browser User-Agent, 2026-11-02) before
// writing any of this, rather than assuming:
//   - YouTube: the public channel page's HTML DOES include the subscriber
//     count with no login/key needed — but only as YouTube's own rounded
//     display text ("1.17M subscribers"), never the exact number. Scraping
//     is the zero-setup default below; YOUTUBE_API_KEY (optional) upgrades
//     this to the exact figure via the official Data API.
//   - Instagram: confirmed the public profile page's raw HTML does NOT
//     contain the follower count at all for a plain unauthenticated fetch
//     (verified: no og:description, no ld+json, no edge_followed_by — the
//     page literally carries a "hide_ui_for_crawlers" flag). It only shows
//     up once a browser runs Instagram's own JS. There's no honest "just
//     scrape it" option here short of running a full headless browser,
//     which isn't worth the weight/fragility for one number — the Graph
//     API (if the admin finishes Meta's setup) or manual entry are the
//     real options.
//   - TikTok: the very first request already gets a bot-check interstitial
//     page instead of the profile — blocked before any content loads.
//   - X: an unauthenticated profile request is refused outright (402).
// TikTok/X are deliberately not fought past that point (this is read-only
// monitoring of one company's own accounts, not worth building anti-bot
// evasion for) — they always fall back to the admin's manual entry field.

export type FollowerFetchResult = { ok: true; count: number; source: "api" | "scrape" } | { ok: false; error: string };

export type SocialAccountForFetch = {
  platform: "instagram" | "youtube" | "tiktok" | "x" | "linkedin" | "whatsapp";
  handle: string;
  external_id: string | null;
  profile_url: string | null;
};

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

// "1.17M subscribers" / "30.5K subscribers" / "523 subscribers" — the exact
// format YouTube's own page shows a logged-out visitor (confirmed live).
function parseAbbreviatedCount(text: string): number | null {
  const match = text.match(/^([\d,.]+)\s*([KMB])?/i);
  if (!match) return null;
  const num = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase() as "K" | "M" | "B"] ?? 1;
  return Math.round(num * mult);
}

// Prefers the admin's own pasted profile_url when given (handles legacy
// /c/ and /user/ channel URLs, or just a handle guessed wrong) — only
// falls back to guessing a "/@handle" URL when no URL was provided.
async function scrapeYouTube(handle: string, profileUrl: string | null): Promise<FollowerFetchResult> {
  const url = profileUrl || `https://www.youtube.com/${encodeURIComponent(handle.startsWith("@") ? handle : `@${handle}`)}`;
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) return { ok: false, error: `YouTube respondeu ${res.status} ao abrir ${profileUrl ? "a URL do perfil" : "o canal pelo handle"} — confira.` };
  const html = await res.text();
  const match = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"[^"]*"\}\},"simpleText":"([^"]+)"/);
  if (!match) return { ok: false, error: "Não encontrei o número de inscritos na página do canal — handle errado ou o YouTube mudou a página." };
  const count = parseAbbreviatedCount(match[1]);
  if (count == null) return { ok: false, error: `Não consegui interpretar "${match[1]}".` };
  return { ok: true, count, source: "scrape" };
}

async function fetchYouTube(account: SocialAccountForFetch): Promise<FollowerFetchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey && apiKey !== "your_youtube_api_key") {
    // Channel ID (external_id) if the admin gave one — otherwise the API
    // can look the channel up directly by its @handle (forHandle), no need
    // to dig up the internal ID first.
    const lookupParam = account.external_id
      ? `id=${encodeURIComponent(account.external_id)}`
      : `forHandle=${encodeURIComponent(account.handle.startsWith("@") ? account.handle : `@${account.handle}`)}`;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&${lookupParam}&key=${apiKey}`);
    if (res.ok) {
      const json = (await res.json()) as { items?: { statistics?: { subscriberCount?: string } }[] };
      const raw = json.items?.[0]?.statistics?.subscriberCount;
      if (raw) return { ok: true, count: Number(raw), source: "api" };
    }
    // Falls through to the scrape below rather than failing outright — a
    // bad/over-quota key shouldn't lose the reading entirely when the
    // free scrape path can still get an approximate one.
  }
  return scrapeYouTube(account.handle, account.profile_url);
}

async function fetchInstagram(account: SocialAccountForFetch): Promise<FollowerFetchResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = account.external_id || process.env.INSTAGRAM_USER_ID;
  if (!token || token === "your_instagram_access_token" || !igUserId || igUserId === "your_instagram_user_id") {
    return { ok: false, error: "Credenciais do Instagram ainda não configuradas." };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(igUserId)}?fields=followers_count&access_token=${token}`);
  if (!res.ok) return { ok: false, error: `Instagram Graph API respondeu ${res.status}.` };
  const json = (await res.json()) as { followers_count?: number };
  if (json.followers_count == null) return { ok: false, error: "Resposta sem followers_count." };
  return { ok: true, count: json.followers_count, source: "api" };
}

async function fetchTikTok(): Promise<FollowerFetchResult> {
  return { ok: false, error: "TikTok bloqueia a leitura automática do perfil (verificação antibot) — use a entrada manual." };
}

async function fetchX(): Promise<FollowerFetchResult> {
  return { ok: false, error: "X/Twitter recusa a leitura sem login (e a API exige plano pago) — use a entrada manual." };
}

async function fetchLinkedIn(): Promise<FollowerFetchResult> {
  return { ok: false, error: "LinkedIn exige um app aprovado pela própria LinkedIn pra ler seguidores de página — use a entrada manual." };
}

async function fetchWhatsApp(): Promise<FollowerFetchResult> {
  return { ok: false, error: "Canal do WhatsApp não tem API pública de inscritos — use a entrada manual." };
}

const FETCHERS: Record<SocialAccountForFetch["platform"], (account: SocialAccountForFetch) => Promise<FollowerFetchResult>> = {
  youtube: fetchYouTube,
  instagram: fetchInstagram,
  tiktok: fetchTikTok,
  x: fetchX,
  linkedin: fetchLinkedIn,
  whatsapp: fetchWhatsApp,
};

export async function fetchFollowerCount(account: SocialAccountForFetch): Promise<FollowerFetchResult> {
  try {
    return await FETCHERS[account.platform](account);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Shared by the daily cron (src/app/api/cron/social-followers/route.ts)
// and the admin's "Buscar agora" action (relatorios/actions.ts) — fetches
// one account and persists the outcome. A success never gets recorded as
// a failure and vice versa: success inserts a snapshot and clears the
// account's error flag; failure only updates last_fetch_attempted_at/
// last_fetch_error, never writes a bogus snapshot row.
export async function fetchAndRecordAccount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  account: { id: string } & SocialAccountForFetch
): Promise<FollowerFetchResult> {
  const result = await fetchFollowerCount(account);
  const now = new Date().toISOString();
  if (result.ok) {
    await client.from("social_follower_snapshots").insert({ account_id: account.id, follower_count: result.count, source: result.source });
    await client.from("social_accounts").update({ last_fetch_attempted_at: now, last_fetch_error: null }).eq("id", account.id);
  } else {
    await client.from("social_accounts").update({ last_fetch_attempted_at: now, last_fetch_error: result.error }).eq("id", account.id);
  }
  return result;
}
