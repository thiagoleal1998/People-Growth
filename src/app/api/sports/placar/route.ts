import { NextResponse } from "next/server";
import { getLiveFixtures, isAnyCompetitionLiveNow, getBestStandings, withReliableCrests } from "@/lib/sports";

// The home widget polls this every minute; the real API is only ever asked
// from here. isAnyCompetitionLiveNow() is a free check (reads the same
// 3h-cached fixture schedule the dedicated page already fetches) — the
// actual live-scores call only happens while a match window is genuinely
// open. getLiveFixtures()'s own fetch caches the upstream call at
// LIVE_CACHE_SECONDS (sports.ts) regardless of this route's own header, so
// the upstream API-Football quota is already protected there.
//
// This route used to ALSO set its own Cache-Control: s-maxage=600 on top of
// that — a second, independently-ticking 10min cache at the Vercel edge,
// never in sync with the first one. Confirmed live: on a page reload, the
// fresh SSR (reading straight from the inner Data Cache) briefly showed the
// correct score, then the client poll below landed on a stale edge-cached
// response from a different point in that other cache's own window and
// overwrote it with an old score. Removed — the inner cache already bounds
// how often the real API gets hit, so this one was pure downside.
//
// withReliableCrests swaps API-Football's own crest urls (media.api-sports.io,
// confirmed live to fail DNS on at least one real network) for the scraped
// standings' equivalent (cdn.api-futebol.com.br) wherever a match exists —
// page.tsx already does this for the widget's initial server-rendered props,
// but this route is a separate client-side poll (SportsLiveWidget fetches it
// every 60s and overwrites that state) that was skipping the swap entirely,
// so correct crests from the first render would silently revert to broken
// ones shortly after load.
export async function GET() {
  const isLive = await isAnyCompetitionLiveNow();
  if (!isLive) {
    return NextResponse.json({ live: [] });
  }
  const [liveFixtures, standings] = await Promise.all([getLiveFixtures(), getBestStandings("serie_a")]);
  const live = withReliableCrests(liveFixtures ?? [], standings);
  return NextResponse.json({ live });
}
