"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database.types";

export async function upsertArticle(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = (String(formData.get("status") ?? "draft")) as Article["status"];
  const categoryId = String(formData.get("category_id") ?? "");

  const payload: Omit<Article, "id" | "created_at" | "updated_at" | "views"> = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    content_pt: String(formData.get("content_pt") ?? ""),
    content_en: String(formData.get("content_en") ?? "") || null,
    excerpt_pt: String(formData.get("excerpt_pt") ?? "") || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "") || null,
    cover_image: String(formData.get("cover_image") ?? "") || null,
    category_id: categoryId || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    author_id: null,
    read_time: null,
    seo_title_pt: String(formData.get("seo_title_pt") ?? "") || null,
    seo_title_en: String(formData.get("seo_title_en") ?? "") || null,
    seo_desc_pt: String(formData.get("seo_desc_pt") ?? "") || null,
    seo_desc_en: String(formData.get("seo_desc_en") ?? "") || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    // Only overwrite published_at when transitioning into "published"; keep existing otherwise.
    const { published_at: _publishedAt, ...updatePayload } = payload;
    const finalPayload = status === "published" ? payload : updatePayload;
    await client.from("articles").update(finalPayload).eq("id", id);
  } else {
    await client.from("articles").insert(payload);
  }

  revalidatePath("/admin/artigos");
  redirect("/admin/artigos");
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/artigos");
}
