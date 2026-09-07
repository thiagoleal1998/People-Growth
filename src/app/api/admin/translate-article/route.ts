import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { translateArticleToEnglish } from "@/lib/translate";

// Used by both the admin and author article editors — any logged-in user
// with a profile can translate their own draft, same access level as
// uploading a content image (see /api/admin/upload-content-image).
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const title_pt = String(body?.title_pt ?? "");
  const excerpt_pt = String(body?.excerpt_pt ?? "");
  const summary_pt = String(body?.summary_pt ?? "");
  const content_pt = String(body?.content_pt ?? "");

  if (!title_pt.trim() && !content_pt.trim()) {
    return NextResponse.json({ error: "Preencha o título ou o conteúdo em português antes de traduzir." }, { status: 400 });
  }

  try {
    const result = await translateArticleToEnglish({ title_pt, excerpt_pt, summary_pt, content_pt });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao traduzir o artigo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
