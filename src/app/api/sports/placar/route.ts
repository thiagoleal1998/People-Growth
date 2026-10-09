import { NextResponse } from "next/server";
import { getLiveFixtures, isAnyCompetitionLiveNow } from "@/lib/sports";

// The home widget polls this every minute; the real API is only ever asked
// from here. isAnyCompetitionLiveNow() is a free check (reads the same
// 3h-cached fixture schedule the dedicated page already fetches) — the
// actual live-scores call only happens while a match window is genuinely
// open, which is what keeps this route's 3-minute upstream revalidate
// inside API-Football's free daily quota.
export async function GET() {
  const live = (await isAnyCompetitionLiveNow()) ? await getLiveFixtures() : [];
  return NextResponse.json(
    { live: live ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=180, stale-while-revalidate=180" } }
  );
}
