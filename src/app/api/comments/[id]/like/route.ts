import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "comment-like", { maxAttempts: 60, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: likes, error: rpcError } = await client.rpc("increment_comment_likes", { comment_id: id });
    if (rpcError) throw rpcError;
    if (likes == null) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ likes });
  } catch (err) {
    console.error("Comment like error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
