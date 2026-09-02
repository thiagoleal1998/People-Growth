"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { Article } from "@/types/database.types";

export async function upsertOwnArticle(id: string | null, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile?.author_id) {
    redirect("/autor?error=" + encodeURIComponent("Seu login ainda não está vinculado a um perfil de autor. Peça a um admin para vincular."));
  }

  const supabase = await createClient();
  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const requestedStatus = String(formData.get("status") ?? "draft");
  // Authors can only save as draft or submit for review — never publish directly.
  const status: Article["status"] = requestedStatus === "pending" ? "pending" : "draft";
  const format = (String(formData.get("format") ?? "opiniao")) as Article["format"];

  const payload = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    content_pt: String(formData.get("content_pt") ?? ""),
    content_en: String(formData.get("content_en") ?? "") || null,
    excerpt_pt: String(formData.get("excerpt_pt") ?? "") || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "") || null,
    cover_image: String(formData.get("cover_image") ?? "") || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    format,
    status,
    author_id: profile.author_id,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    await client.from("articles").update(payload).eq("id", id).eq("author_id", profile.author_id);
  } else {
    await client.from("articles").insert(payload);
  }

  revalidatePath("/autor");
  redirect("/autor?saved=1");
}

export async function deleteOwnArticle(id: string) {
  const profile = await getCurrentProfile();
  if (!profile?.author_id) return;

  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id).eq("author_id", profile.author_id);
  revalidatePath("/autor");
}
