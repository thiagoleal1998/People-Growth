import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicImage } from "@/lib/supabase/storage";

// Inline images inserted mid-article from the content editor's toolbar.
// Gated to admins/authors (not public) since every upload consumes storage.
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const { url, error } = await uploadPublicImage(formData.get("file"), "article-content");

  if (error || !url) {
    return NextResponse.json({ error: error ?? "Falha no upload." }, { status: 400 });
  }

  return NextResponse.json({ url });
}
