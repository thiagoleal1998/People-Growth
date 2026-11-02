// Per-platform follower-count fetchers behind one interface — the cron
// route and the admin "Buscar agora" action never need to know which
// platforms actually work. Never throws: every failure (missing
// credentials, network error, unexpected response shape) becomes
// { ok: false, error }, so a bad platform never crashes the batch.
//
// Only YouTube has a simple, free, working path today. Instagram needs
// the admin to finish Meta's Business/Graph API setup (see migration 077's
// comment and the plan this was built from). TikTok and X have no viable
// automated path right now — deliberately not attempted via scraping
// (unlike src/lib/sports.ts's football scrape, these two actively fight
// scraping and would break silently) — they always fall back to the
// admin's manual entry field.

export type FollowerFetchResult = { ok: true; count: number; source: "api" | "scrape" } | { ok: false; error: string };

export type SocialAccountForFetch = {
  platform: "instagram" | "youtube" | "tiktok" | "x";
  handle: string;
  external_id: string | null;
};

async function fetchYouTube(account: SocialAccountForFetch): Promise<FollowerFetchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { ok: false, error: "YOUTUBE_API_KEY não configurada." };
  if (!account.external_id) return { ok: false, error: "Falta o Channel ID (ID externo) nesta conta." };

  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(account.external_id)}&key=${apiKey}`);
  if (!res.ok) return { ok: false, error: `YouTube API respondeu ${res.status}.` };
  const json = (await res.json()) as { items?: { statistics?: { subscriberCount?: string } }[] };
  const raw = json.items?.[0]?.statistics?.subscriberCount;
  if (!raw) return { ok: false, error: "Canal não encontrado ou sem estatística pública." };
  return { ok: true, count: Number(raw), source: "api" };
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
  return { ok: false, error: "Sem integração automática disponível para TikTok — use a entrada manual." };
}

async function fetchX(): Promise<FollowerFetchResult> {
  return { ok: false, error: "A API do X/Twitter exige plano pago — use a entrada manual." };
}

const FETCHERS: Record<SocialAccountForFetch["platform"], (account: SocialAccountForFetch) => Promise<FollowerFetchResult>> = {
  youtube: fetchYouTube,
  instagram: fetchInstagram,
  tiktok: fetchTikTok,
  x: fetchX,
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
