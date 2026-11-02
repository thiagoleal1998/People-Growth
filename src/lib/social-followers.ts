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
//     contain the follower count for a plain unauthenticated fetch (no
//     og:description, no ld+json, no edge_followed_by — the page carries a
//     "hide_ui_for_crawlers" flag) — it's only populated client-side, after
//     Instagram's own JS runs. A real headless browser (puppeteer-core +
//     @sparticuz/chromium, Vercel-compatible) rendering the public page —
//     same page a logged-out visitor sees, no spoofed internal API, no
//     anti-bot-bypass proxy — gets it fine (confirmed live). The official
//     Graph API (if the admin finishes Meta's setup) stays the preferred,
//     exact-number path when configured; this is the zero-setup fallback.
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
// format YouTube's own page shows a logged-out visitor (confirmed live,
// and consistently English regardless of request origin).
function parseAbbreviatedCount(text: string): number | null {
  const match = text.match(/^([\d,.]+)\s*([KMB])?/i);
  if (!match) return null;
  const num = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase() as "K" | "M" | "B"] ?? 1;
  return Math.round(num * mult);
}

// Instagram's forced-English Accept-Language header isn't reliably honored
// by a headless Chromium launched server-side the way it was in local
// browser testing — confirmed live: the deployed scraper got back "65
// seguidores" (pt-BR) even with the header set, because Instagram's
// client-side React app can also read the browser's own locale instead of
// just the request header. Rather than fight that, this parses both
// languages directly. pt-BR and en-US swap which punctuation mark is the
// decimal point vs. the thousands separator ("1.234" vs "1,234" for an
// exact count; "1,2 mil" vs "1.2K" once abbreviated) — handled by only
// ever reading separator-before-a-unit-word as a decimal point, and
// stripping every separator otherwise (an exact follower count is always
// a whole number, so any punctuation in it is a thousands grouping mark
// no matter which locale rendered it).
function parseSocialCount(text: string): number | null {
  const match = text
    .trim()
    .match(/^([\d.,]+)\s*(mil|milh(?:[aã]o|oes|ões)|mi|k|m|b)?$/i);
  if (!match) return null;
  const unit = match[2]?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") ?? "";
  const mult = unit === "k" ? 1e3 : unit === "m" || unit === "mi" ? 1e6 : unit === "b" ? 1e9 : unit === "mil" ? 1e3 : unit.startsWith("milh") ? 1e6 : 1;
  const digits = mult > 1 ? match[1].replace(/[.,]/, ".") : match[1].replace(/[.,]/g, "");
  const num = Number(digits);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * mult);
}

// YouTube serves (at least) two different channel page templates — which
// one a given channel gets seems to depend on the channel itself (newer/
// smaller channels got a redesigned header in testing here), not something
// this scraper controls, so both are tried:
//   - older template: subscriberCountText as a nested object on the main
//     channel page — {"accessibility":{"accessibilityData":{"label":"..."}},
//     "simpleText":"1.17M subscribers"}.
//   - newer template: the main page's header doesn't expose it at all, but
//     the channel's own /about tab still has it, as a flat string —
//     "subscriberCountText":"23 subscribers" (confirmed live on a small,
//     recently-renamed channel that had neither the old nested object NOR
//     any subscriber text on its main page).
const OLD_TEMPLATE_RE = /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"[^"]*"\}\},"simpleText":"([^"]+)"/;
const NEW_TEMPLATE_RE = /"subscriberCountText":"([^"]+)"/;

async function fetchAndParse(url: string): Promise<{ text: string } | { error: string }> {
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) return { error: `YouTube respondeu ${res.status}.` };
  const html = await res.text();
  const match = html.match(OLD_TEMPLATE_RE) ?? html.match(NEW_TEMPLATE_RE);
  if (!match) return { error: "not_found" };
  return { text: match[1] };
}

// Prefers the admin's own pasted profile_url when given (handles legacy
// /c/ and /user/ channel URLs, or just a handle guessed wrong) — only
// falls back to guessing a "/@handle" URL when no URL was provided.
async function scrapeYouTube(handle: string, profileUrl: string | null): Promise<FollowerFetchResult> {
  const baseUrl = (profileUrl || `https://www.youtube.com/${encodeURIComponent(handle.startsWith("@") ? handle : `@${handle}`)}`).replace(/\/+$/, "");

  let result = await fetchAndParse(baseUrl);
  if ("error" in result && result.error !== "not_found") return { ok: false, error: `${result.error} (${profileUrl ? "URL do perfil" : "handle"})` };
  if ("error" in result) {
    // Not on the main page — try the channel's /about tab, which some of
    // YouTube's newer page templates use instead (see comment above).
    result = await fetchAndParse(baseUrl.endsWith("/about") ? baseUrl : `${baseUrl}/about`);
  }
  if ("error" in result) return { ok: false, error: "Não encontrei o número de inscritos (tentei a página do canal e a aba Sobre) — confira o handle/URL." };

  const count = parseAbbreviatedCount(result.text);
  if (count == null) return { ok: false, error: `Não consegui interpretar "${result.text}".` };
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

// Headless Chromium via puppeteer-core + @sparticuz/chromium (the binary
// Vercel serverless functions can actually run) — imported dynamically so
// extracting/launching Chromium only happens for accounts that actually
// need it (a batch run with only YouTube/other accounts never pays this
// cost). The Accept-Language header is set as a best effort, but
// confirmed live NOT reliably honored by headless Chromium here — the
// deployed scraper still got "65 seguidores" (pt-BR) back — so the match
// below accepts either language instead of depending on it working.
const SOCIAL_COUNT_RE = /([\d.,]+\s*(?:mil|milh(?:[aã]o|oes|ões)|mi|[KMB])?)\s*(?:seguidores|followers)/i;

async function scrapeInstagram(handle: string, profileUrl: string | null): Promise<FollowerFetchResult> {
  const url = profileUrl || `https://www.instagram.com/${encodeURIComponent(handle)}/`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any;
  try {
    const [{ default: puppeteer }, { default: chromium }] = await Promise.all([import("puppeteer-core"), import("@sparticuz/chromium")]);
    browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(BROWSER_HEADERS["User-Agent"]);
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector("header", { timeout: 15000 }).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const bodyText: string = await page.evaluate(() => document.body.innerText);
    const match = bodyText.match(SOCIAL_COUNT_RE);
    if (!match) return { ok: false, error: "Não encontrei o número de seguidores na página — confira o handle/URL, ou o perfil pode estar privado." };
    const count = parseSocialCount(match[1]);
    if (count == null) return { ok: false, error: `Não consegui interpretar "${match[1]}".` };
    return { ok: true, count, source: "scrape" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser?.close().catch(() => {});
  }
}

async function fetchInstagram(account: SocialAccountForFetch): Promise<FollowerFetchResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = account.external_id || process.env.INSTAGRAM_USER_ID;
  if (token && token !== "your_instagram_access_token" && igUserId && igUserId !== "your_instagram_user_id") {
    const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(igUserId)}?fields=followers_count&access_token=${token}`);
    if (res.ok) {
      const json = (await res.json()) as { followers_count?: number };
      if (json.followers_count != null) return { ok: true, count: json.followers_count, source: "api" };
    }
    // Falls through to the browser scrape rather than failing outright —
    // same reasoning as YouTube's key fallback above.
  }
  return scrapeInstagram(account.handle, account.profile_url);
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
