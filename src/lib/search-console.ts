// Live Google Search Console data (organic search clicks/impressions/CTR/
// position — none of which exists anywhere else in this codebase; the
// "Visão geral" tab's own numbers are all internal page_views/ad_events,
// a completely different thing from Google's own search traffic). Reads a
// service account's credentials from env vars rather than a stored secret
// in the database, same reasoning as any other third-party API key here.
//
// Needs three env vars, none of which this file (or anyone but whoever
// sets them in Vercel/`.env.local`) ever needs to see as plaintext here:
//   GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL  — the service account's email
//   GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY   — its private key (the full PEM
//     block from the downloaded JSON key; literal "\n" sequences are
//     unescaped below, since most places that store env vars flatten
//     real newlines into that)
//   GOOGLE_SEARCH_CONSOLE_SITE_URL      — the property exactly as it's
//     registered in Search Console: either "https://grupofestina.com.br/"
//     (URL-prefix property) or "sc-domain:grupofestina.com.br" (domain
//     property) — whichever one is actually verified there.
// Until all three are set this just reports itself as unconfigured
// instead of failing — the admin page renders a "not set up yet" message
// rather than crashing.
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

function getClient(): JWT | null {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (!email || !key) return null;
  return new JWT({ email, key: key.replace(/\\n/g, "\n"), scopes: SCOPES });
}

export type SearchConsoleRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

// `status` is a real discriminant (a string literal, not a plain
// `error?: string` whose emptiness TypeScript can't rule out) specifically
// so the admin page's `searchConsole.status === "ok"` check narrows away
// the other two branches completely — an `error: string` field alone left
// a theoretical empty-string case the type checker wouldn't dismiss.
export type SearchConsoleSummary =
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      dateRange: { startDate: string; endDate: string };
      totals: { clicks: number; impressions: number; ctr: number; position: number };
      topQueries: SearchConsoleRow[];
      topPages: SearchConsoleRow[];
    };

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Default window when the caller has no period of its own in mind —
// matches Search Console's own default report range.
const DEFAULT_DAYS = 28;

export async function getSearchConsoleSummary(range?: { startDate: Date; endDate: Date }): Promise<SearchConsoleSummary> {
  const client = getClient();
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  if (!client || !siteUrl) return { status: "unconfigured" };

  // Search Console's own data has a ~2-3 day processing lag — asking for
  // "today" (or whatever the caller's requested end date is, if it's more
  // recent than that) always comes back empty/partial, reading as a bug
  // rather than normal latency, so the window's end is always clamped back
  // a few days regardless of what was asked for.
  const maxEndDate = new Date();
  maxEndDate.setDate(maxEndDate.getDate() - 3);
  const endDate = range && range.endDate < maxEndDate ? range.endDate : maxEndDate;
  const startDate = range ? range.startDate : new Date(endDate.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);

  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  async function query(body: Record<string, unknown>): Promise<{ rows?: SearchConsoleRow[] }> {
    const { token } = await client!.getAccessToken();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: fmt(startDate), endDate: fmt(endDate), ...body }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Search Console API respondeu ${res.status}: ${detail.slice(0, 200)}`);
    }
    return res.json();
  }

  try {
    const [totalsRes, queriesRes, pagesRes] = await Promise.all([
      query({ dimensions: [] }),
      query({ dimensions: ["query"], rowLimit: 10 }),
      query({ dimensions: ["page"], rowLimit: 10 }),
    ]);
    const totalsRow = totalsRes.rows?.[0];
    return {
      status: "ok",
      dateRange: { startDate: fmt(startDate), endDate: fmt(endDate) },
      totals: totalsRow
        ? { clicks: totalsRow.clicks, impressions: totalsRow.impressions, ctr: totalsRow.ctr, position: totalsRow.position }
        : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topQueries: queriesRes.rows ?? [],
      topPages: pagesRes.rows ?? [],
    };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : String(err) };
  }
}
