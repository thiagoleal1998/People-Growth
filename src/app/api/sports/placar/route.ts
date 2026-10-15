import { NextResponse } from "next/server";
import { getLiveFixtures, isAnyCompetitionLiveNow, getBestStandings, withReliableCrests } from "@/lib/sports";

// The home widget polls this every minute; the real API is only ever asked
// from here. isAnyCompetitionLiveNow() is a free check (reads the same
// 3h-cached fixture schedule the dedicated page already fetches) — the
// actual live-scores call only happens while a match window is genuinely
// open. getLiveFixtures()'s own fetch caches the upstream call at
// LIVE_CACHE_SECONDS (sports.ts) regardless of this route's own header; this
// just matches that same value so the edge doesn't re-run this handler more
// often than the underlying data can change.
//
// withReliableCrests swaps API-Football's own crest urls (media.api-sports.io,
// confirmed live to fail DNS on at least one real network) for the scraped
// standings' equivalent (cdn.api-futebol.com.br) wherever a match exists —
// page.tsx already does this for the widget's initial server-rendered props,
// but this route is a separate client-side poll (SportsLiveWidget fetches it
// every 60s and overwrites that state) that was skipping the swap entirely,
// so correct crests from the first render would silently revert to broken
// ones shortly after load. Confirmed live: a Fluminense x Palmeiras
// Libertadores match showed real crests on load, then blank gradient
// placeholders within a minute.
export async function GET() {
  const isLive = await isAnyCompetitionLiveNow();
  if (!isLive) {
    return NextResponse.json({ live: [] }, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } });
  }
  const [liveFixtures, standings] = await Promise.all([getLiveFixtures(), getBestStandings("serie_a")]);
  const live = withReliableCrests(liveFixtures ?? [], standings);
  return NextResponse.json(
    { live },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}
