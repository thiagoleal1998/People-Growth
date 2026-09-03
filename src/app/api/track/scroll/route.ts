import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sent via navigator.sendBeacon on page-hide, so this has to tolerate a
// missing Content-Type header (beacons don't always set one reliably) and
// respond fast — the tab may already be closing.
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const body = JSON.parse(text) as Record<string, unknown>;
    const { id, scrollDepth } = body;

    if (typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "id inválido." }, { status: 400 });
    }
    if (typeof scrollDepth !== "number" || !Number.isFinite(scrollDepth)) {
      return NextResponse.json({ error: "scrollDepth inválido." }, { status: 400 });
    }
    const clamped = Math.max(0, Math.min(100, Math.round(scrollDepth)));

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "track-scroll", { maxAttempts: 120, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ success: true });
    }

    const admin = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("page_views").update({ scroll_depth: clamped }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Track scroll error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
