"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/supabase/storage";
import type { Article } from "@/types/database.types";

export async function upsertArticle(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const { url: coverImageUrl, error: imageError } = await uploadPublicImage(formData.get("cover_image_file"), "articles");

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = (String(formData.get("status") ?? "draft")) as Article["status"];
  const categoryId = String(formData.get("category_id") ?? "");
  const authorId = String(formData.get("author_id") ?? "");
  const format = (String(formData.get("format") ?? "noticia")) as Article["format"];

  const payload: Omit<Article, "id" | "created_at" | "updated_at" | "views"> = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    content_pt: String(formData.get("content_pt") ?? ""),
    content_en: String(formData.get("content_en") ?? "") || null,
    excerpt_pt: String(formData.get("excerpt_pt") ?? "") || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "") || null,
    summary_pt: String(formData.get("summary_pt") ?? "") || null,
    summary_en: String(formData.get("summary_en") ?? "") || null,
    cover_image: coverImageUrl || String(formData.get("current_cover_image") ?? "") || null,
    cover_image_caption: String(formData.get("cover_image_caption") ?? "") || null,
    cover_image_credit: String(formData.get("cover_image_credit") ?? "") || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    category_id: categoryId || null,
    format,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    author_id: authorId || null,
    read_time: null,
    seo_title_pt: String(formData.get("seo_title_pt") ?? "") || null,
    seo_title_en: String(formData.get("seo_title_en") ?? "") || null,
    seo_desc_pt: String(formData.get("seo_desc_pt") ?? "") || null,
    seo_desc_en: String(formData.get("seo_desc_en") ?? "") || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  let articleId = id;
  if (articleId) {
    // Only overwrite published_at when transitioning into "published"; keep existing otherwise.
    const { published_at: _publishedAt, ...updatePayload } = payload;
    const finalPayload = status === "published" ? payload : updatePayload;
    await client.from("articles").update(finalPayload).eq("id", articleId);
  } else {
    const { data } = await client.from("articles").insert(payload).select("id").single();
    articleId = data?.id ?? null;
  }

  revalidatePath("/admin/artigos");
  revalidatePath("/[locale]", "page");

  if (imageError && articleId) {
    redirect(`/admin/artigos/${articleId}?imageError=${encodeURIComponent(imageError)}`);
  }
  redirect("/admin/artigos?saved=1");
}

export async function publishArticle(id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/artigos");
  revalidatePath("/[locale]", "page");
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/artigos");
  revalidatePath("/[locale]", "page");
}
