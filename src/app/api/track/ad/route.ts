import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId, slotKey, eventType, path, visitorId } = body as Record<string, unknown>;

    if (
      typeof adId !== "string" || !adId ||
      typeof slotKey !== "string" || !slotKey ||
      (eventType !== "impression" && eventType !== "click")
    ) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "track-ad", { maxAttempts: 120, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: ad } = await client.from("ads").select("id, slot_key").eq("id", adId).eq("active", true).single();
    if (!ad || ad.slot_key !== slotKey) {
      return NextResponse.json({ success: true }); // silently drop — don't help probing for valid ad ids
    }

    const { error } = await client.from("ad_events").insert({
      ad_slot_key: slotKey,
      ad_id: adId,
      event_type: eventType,
      path: typeof path === "string" ? path.slice(0, 500) : null,
      visitor_id: typeof visitorId === "string" ? visitorId.slice(0, 100) : null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Track ad error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
