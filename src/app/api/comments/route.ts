import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, looksLikeBot } from "@/lib/rate-limit";
import type { Database } from "@/types/database.types";

type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, parentId, name, email, comment, website, renderedAt } = body as Record<string, unknown>;

    if (looksLikeBot(website, renderedAt)) {
      return NextResponse.json({ success: true });
    }

    if (
      typeof articleId !== "string" || !articleId ||
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof comment !== "string" || !comment.trim()
    ) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "comments", { maxAttempts: 10, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const supabase = await createAdminClient();

    const payload: CommentInsert = {
      article_id: articleId,
      parent_id: typeof parentId === "string" && parentId ? parentId : null,
      name: name.trim().slice(0, 120),
      email: email.trim().slice(0, 200),
      body: comment.trim().slice(0, 3000),
      status: "pending",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("comments").insert(payload);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Comment submission error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
