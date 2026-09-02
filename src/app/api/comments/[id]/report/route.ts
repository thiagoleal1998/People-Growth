import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "comment-report", { maxAttempts: 20, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: current, error: fetchError } = await client
      .from("comments")
      .select("reports")
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    const { error: updateError } = await client
      .from("comments")
      .update({ reports: current.reports + 1 })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Comment report error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
