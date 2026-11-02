import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

// Pinged every 60s by Analytics.tsx while a visitor's tab is visible, so
// LiveStatsWidget's "Visitantes no site agora" stays accurate for readers
// who stay on one page past the old 5-minute page_views-only window — see
// migration 076.
export async function POST(req: NextRequest) {
  try {
    const { visitorId } = (await req.json()) as Record<string, unknown>;
    if (typeof visitorId !== "string" || !visitorId) {
      return NextResponse.json({ error: "Campo obrigatório faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    // One ping/min expected — 30/hour gives headroom for clock drift/retries
    // without opening this up to abuse.
    const { limited } = await checkRateLimit(ip, "track-heartbeat", { maxAttempts: 30, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    await client.from("visitor_heartbeats").upsert({ visitor_id: visitorId.slice(0, 100), last_seen_at: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Track heartbeat error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
