"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type InstitutionalPostInsert = Database["public"]["Tables"]["institutional_posts"]["Insert"];

export async function upsertInstitutionalPost(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const titlePt = String(formData.get("title_pt") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") === "published" ? "published" : "draft";

  const payload: Partial<InstitutionalPostInsert> = {
    title_pt: titlePt,
    title_en: String(formData.get("title_en") ?? "").trim() || null,
    slug: slugInput ? slugify(slugInput, { lower: true, strict: true }) : slugify(titlePt, { lower: true, strict: true }),
    excerpt_pt: String(formData.get("excerpt_pt") ?? "").trim() || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "").trim() || null,
    body_pt: String(formData.get("body_pt") ?? "").replace(/\r\n?/g, "\n"),
    body_en: String(formData.get("body_en") ?? "").replace(/\r\n?/g, "\n") || null,
    cover_image: String(formData.get("cover_image") ?? "").trim() || null,
    cover_image_caption: String(formData.get("cover_image_caption") ?? "").trim() || null,
    cover_image_credit: String(formData.get("cover_image_credit") ?? "").trim() || null,
    author_columnist_id: String(formData.get("author_columnist_id") ?? "").trim() || null,
    status,
  };

  const isNew = !id;
  if (id) {
    // A post only gets a published_at the first time it flips to
    // "published" — editing an already-published post afterward must not
    // bump its date back to "now", or it'd read as freshly posted every
    // time a typo gets fixed.
    const { data: existing } = await client.from("institutional_posts").select("status, published_at").eq("id", id).single();
    const justPublished = status === "published" && existing?.status !== "published" && !existing?.published_at;
    await client
      .from("institutional_posts")
      .update({ ...payload, ...(justPublished ? { published_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString() })
      .eq("id", id);
  } else {
    await client.from("institutional_posts").insert({
      ...payload,
      published_at: status === "published" ? new Date().toISOString() : null,
      created_by: actor?.id ?? null,
    });
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "post institucional", entityLabel: titlePt });
  }

  revalidatePath("/admin/institucional");
  revalidatePath("/institucional");
  redirect("/admin/institucional?saved=1");
}

export async function deleteInstitutionalPost(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("institutional_posts").select("title_pt").eq("id", id).single();
  await client.from("institutional_posts").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "post institucional", entityLabel: item?.title_pt ?? "" });
  }
  revalidatePath("/admin/institucional");
  revalidatePath("/institucional");
  redirect("/admin/institucional");
}
