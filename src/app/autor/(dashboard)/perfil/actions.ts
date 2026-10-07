"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicImage } from "@/lib/supabase/storage";

// Thrown rather than redirected — called directly from a small standalone form
// (ChangePasswordCard), not the big profile form, so a mistake here never
// discards whatever is mid-typed in the rest of the profile page.
export async function changeOwnPassword(newPassword: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sessão expirada. Atualize a página e entre novamente.");
  if (newPassword.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function updateOwnAuthorProfile(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile?.author_id) {
    redirect("/autor/perfil?error=" + encodeURIComponent("Seu login ainda não está vinculado a um perfil de autor."));
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { url: photoUrl, error: photoError } = await uploadPublicImage(formData.get("photo_file"), "authors");
  if (photoUrl) {
    await client.from("authors").update({ photo_url: photoUrl }).eq("id", profile.author_id!);
  }

  const payload = {
    gender: (String(formData.get("gender") ?? "masculino")) as "masculino" | "feminino",
    role_pt: String(formData.get("role_pt") ?? "") || null,
    role_en: String(formData.get("role_en") ?? "") || null,
    tagline_pt: String(formData.get("tagline_pt") ?? "").slice(0, 80) || null,
    tagline_en: String(formData.get("tagline_en") ?? "").slice(0, 80) || null,
    bio_pt: String(formData.get("bio_pt") ?? "") || null,
    bio_en: String(formData.get("bio_en") ?? "") || null,
    milestones_pt: String(formData.get("milestones_pt") ?? "") || null,
    milestones_en: String(formData.get("milestones_en") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    instagram_url: String(formData.get("instagram_url") ?? "") || null,
    whatsapp_url: String(formData.get("whatsapp_url") ?? "") || null,
  };

  await client.from("authors").update(payload).eq("id", profile.author_id);

  revalidatePath("/autor/perfil");
  revalidatePath("/[locale]/conteudo", "page");
  revalidatePath("/[locale]/sobre", "page");
  revalidatePath("/[locale]/sobre/[slug]", "page");
  revalidatePath("/[locale]", "page");
  redirect(`/autor/perfil?saved=1${photoError ? `&photoError=${encodeURIComponent(photoError)}` : ""}`);
}
