"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicImage } from "@/lib/supabase/storage";
import { logActivity } from "@/lib/activity-log";
import type { Columnist } from "@/types/database.types";

export async function upsertColumnist(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const { url: uploadedPhotoUrl, error: photoError } = await uploadPublicImage(formData.get("photo_file"), "columnists");
  const name = String(formData.get("name") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();

  // terms_accepted_at/terms_declined_at are deliberately excluded — the
  // columnist answers that themselves from their own panel (TermsGate), this
  // form only ever shows it read-only (see TermsAcceptanceStatus below).
  const payload: Omit<Columnist, "id" | "created_at" | "updated_at" | "terms_accepted_at" | "terms_declined_at"> = {
    name,
    slug: slugInput || slugify(name, { lower: true, strict: true }),
    gender: (String(formData.get("gender") ?? "masculino")) as Columnist["gender"],
    role_pt: String(formData.get("role_pt") ?? "") || null,
    role_en: String(formData.get("role_en") ?? "") || null,
    tagline_pt: String(formData.get("tagline_pt") ?? "").slice(0, 80) || null,
    tagline_en: String(formData.get("tagline_en") ?? "").slice(0, 80) || null,
    bio_pt: String(formData.get("bio_pt") ?? "") || null,
    bio_en: String(formData.get("bio_en") ?? "") || null,
    milestones_pt: String(formData.get("milestones_pt") ?? "") || null,
    milestones_en: String(formData.get("milestones_en") ?? "") || null,
    photo_url: uploadedPhotoUrl || String(formData.get("photo_url") ?? "").trim() || String(formData.get("current_photo_url") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    instagram_url: String(formData.get("instagram_url") ?? "") || null,
    whatsapp_url: String(formData.get("whatsapp_url") ?? "") || null,
    website_url: String(formData.get("website_url") ?? "") || null,
    status: (String(formData.get("status") ?? "active")) as Columnist["status"],
    order: Number(formData.get("order") ?? 0),
    is_founder: formData.get("is_founder") === "on",
    org_chart_role: String(formData.get("org_chart_role") ?? "").trim() || null,
    org_chart_manager_id: String(formData.get("org_chart_manager_id") ?? "").trim() || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const isNew = !id;
  let articleId = id;
  if (id) {
    await client.from("columnists").update(payload).eq("id", id);
  } else {
    const { data } = await client.from("columnists").insert(payload).select("id").single();
    articleId = data?.id ?? null;
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "colunista", entityLabel: name });
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/empresa");
  revalidatePath("/colunista/empresa");
  revalidatePath("/[locale]/conteudo", "page");
  revalidatePath("/[locale]/sobre", "page");
  revalidatePath("/[locale]/sobre/[slug]", "page");
  revalidatePath("/[locale]", "page");

  if (photoError && articleId) {
    redirect(`/admin/colunistas/${articleId}?imageError=${encodeURIComponent(photoError)}`);
  }
  redirect("/admin/usuarios?tab=colunistas&saved=1");
}

export async function deleteColumnist(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: columnist } = await client.from("columnists").select("name").eq("id", id).single();
  await client.from("columnists").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "colunista", entityLabel: columnist?.name });
  }
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/empresa");
  revalidatePath("/colunista/empresa");
}
