import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicImage, uploadPublicFile } from "@/lib/supabase/storage";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Attachments on a Tarefas card — gated to any logged-in user (admin or
// equipe can both attach to a card they can see; actions.ts/RLS enforce
// which task they're allowed to attach it to).
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const isImage = file instanceof File && file.type.startsWith("image/");

  const { url, error } = isImage
    ? await uploadPublicImage(file, "tasks")
    : await uploadPublicFile(file, "tasks", { maxBytes: MAX_ATTACHMENT_BYTES });

  if (error || !url) {
    return NextResponse.json({ error: error ?? "Falha no upload." }, { status: 400 });
  }

  return NextResponse.json({ url });
}
