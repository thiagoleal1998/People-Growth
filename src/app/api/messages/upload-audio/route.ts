import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicAudio } from "@/lib/supabase/storage";

// Voice messages recorded in the browser (MessagesClient's mic button).
// Gated to any logged-in user (admin or columnist) — both sides of a
// conversation can send one.
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const { url, error } = await uploadPublicAudio(formData.get("file"), "messages");

  if (error || !url) {
    return NextResponse.json({ error: error ?? "Falha no upload." }, { status: 400 });
  }

  return NextResponse.json({ url });
}
