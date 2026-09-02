import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, looksLikeBot } from "@/lib/rate-limit";
import type { Database } from "@/types/database.types";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message, website, renderedAt } = body as Record<string, unknown>;

    // Honeypot / too-fast submission — pretend it worked so bots don't adapt.
    if (looksLikeBot(website, renderedAt)) {
      return NextResponse.json({ success: true });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string" || !name || !email || !message) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "contact", { maxAttempts: 5, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();

    const payload: LeadInsert = {
      name,
      email,
      phone: typeof phone === "string" && phone ? phone : null,
      service_interest: typeof service === "string" && service ? service : null,
      message,
      source: "contact_form",
      status: "new",
      notes: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("leads").insert(payload);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
