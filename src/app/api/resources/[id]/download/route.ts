import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, looksLikeBot } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { name, email, website, renderedAt } = body as Record<string, unknown>;

    if (looksLikeBot(website, renderedAt)) {
      return NextResponse.json({ error: "Não foi possível processar." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "resource-download", { maxAttempts: 20, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: resource } = await client
      .from("resources")
      .select("id, title_pt, file_url, lead_required, download_count, status")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (!resource || !resource.file_url) {
      return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    }

    if (resource.lead_required) {
      if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ error: "Nome e e-mail são obrigatórios para este recurso." }, { status: 400 });
      }
      await client.from("leads").insert({
        name: name.trim().slice(0, 120),
        email: email.trim().slice(0, 200),
        phone: null,
        message: null,
        service_interest: null,
        source: `Recurso: ${resource.title_pt}`,
        status: "new",
        notes: null,
      });
    }

    await client.from("resources").update({ download_count: resource.download_count + 1 }).eq("id", id);

    return NextResponse.json({ url: resource.file_url });
  } catch (err) {
    console.error("Resource download error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
