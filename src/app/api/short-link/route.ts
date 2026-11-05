import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

// Only ever shortens our own canonical site URL — a public endpoint that
// minted short links to arbitrary targets would be an open URL-shortener
// (and redirect-laundering tool) for anyone who found it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grupofestina.com.br";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body as Record<string, unknown>;

    if (typeof url !== "string" || !url.startsWith(SITE_URL)) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "short-link", { maxAttempts: 60, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: existing } = await client
      .from("short_links")
      .select("code")
      .eq("target_url", url)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ code: existing.code });
    }

    // Collisions are astronomically unlikely at this code length, but a
    // handful of retries costs nothing and makes this correct regardless.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomCode();
      const { error } = await client.from("short_links").insert({ code, target_url: url });
      if (!error) return NextResponse.json({ code });
      if (error.code !== "23505") throw error; // anything but a PK collision is a real failure
    }

    return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 500 });
  } catch (err) {
    console.error("Short link creation error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
