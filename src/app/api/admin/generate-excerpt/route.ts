import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { generateExcerptAndSummary } from "@/lib/summarize";
import { checkRateLimit } from "@/lib/rate-limit";

// Used by both the admin and columnist article editors — same access level as
// translate-article and upload-content-image. Rate-limited per logged-in
// user (not per IP — a shared office IP shouldn't throttle every editor
// together) since this calls a paid external AI API with no other cap.
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { limited } = await checkRateLimit(profile.id, "generate-excerpt", { maxAttempts: 30, windowMinutes: 60 });
  if (limited) {
    return NextResponse.json({ error: "Muitas gerações em pouco tempo — aguarde um pouco e tente de novo." }, { status: 429 });
  }

  const body = await req.json();
  const title_pt = String(body?.title_pt ?? "");
  const content_pt = String(body?.content_pt ?? "");

  if (!content_pt.trim()) {
    return NextResponse.json({ error: "Escreva o conteúdo em português antes de gerar a linha fina e o resumo." }, { status: 400 });
  }

  try {
    const result = await generateExcerptAndSummary({ title_pt, content_pt });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao gerar a linha fina e o resumo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
