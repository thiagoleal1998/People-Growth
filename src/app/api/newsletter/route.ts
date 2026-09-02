import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, looksLikeBot } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, website, renderedAt } = body as Record<string, unknown>;

    if (looksLikeBot(website, renderedAt)) {
      return NextResponse.json({ success: true });
    }

    if (typeof email !== "string" || !email) {
      return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "newsletter", { maxAttempts: 5, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("newsletter_subs").upsert(
      { email, name: typeof name === "string" && name ? name : null, status: "active", source: "website" },
      { onConflict: "email" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
