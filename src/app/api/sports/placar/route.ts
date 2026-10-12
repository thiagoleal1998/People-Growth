import { NextResponse } from "next/server";
import { getLiveFixtures, isAnyCompetitionLiveNow } from "@/lib/sports";

// The home widget polls this every minute; the real API is only ever asked
// from here. isAnyCompetitionLiveNow() is a free check (reads the same
// 3h-cached fixture schedule the dedicated page already fetches) — the
// actual live-scores call only happens while a match window is genuinely
// open. getLiveFixtures()'s own fetch caches the upstream call at
// LIVE_CACHE_SECONDS (sports.ts) regardless of this route's own header; this
// just matches that same value so the edge doesn't re-run this handler more
// often than the underlying data can change.
export async function GET() {
  const live = (await isAnyCompetitionLiveNow()) ? await getLiveFixtures() : [];
  return NextResponse.json(
    { live: live ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}
