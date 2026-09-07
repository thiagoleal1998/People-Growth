"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { uploadPublicImage } from "@/lib/supabase/storage";
import { logActivity, diffFields, ARTICLE_TRACKED_FIELDS } from "@/lib/activity-log";
import type { Article } from "@/types/database.types";

// Authors have no RLS permission to insert into `notifications` at all —
// only "Admins can create notifications for anyone" exists (migration 038)
// — so this has to run entirely on the service-role client, both to list
// who the admins are (user_profiles RLS also only allows reading your own
// row) and to write the rows.
async function notifyAdmins(notification: { title: string; body?: string; link: string }) {
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: admins } = await (admin as any).from("user_profiles").select("id").eq("role", "admin");
  if (!admins || admins.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from("notifications").insert(admins.map((a: { id: string }) => ({ user_id: a.id, ...notification })));
}

export async function upsertOwnArticle(id: string | null, formData: FormData) {
  try {
    await upsertOwnArticleInner(id, formData);
  } catch (err) {
    // Anything unexpected (a thrown exception, not just a Supabase {error})
    // used to bubble up as Next's generic "server error" page with no way
    // to tell what actually happened — surface it on the form instead.
    if (isRedirectError(err)) throw err; // redirect() itself throws — let it through
    const message = err instanceof Error ? err.message : String(err);
    console.error("upsertOwnArticle failed:", err);
    redirect(`/autor/artigos/${id ?? "novo"}?saveError=${encodeURIComponent(message)}`);
  }
}

function isRedirectError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && typeof (err as { digest?: unknown }).digest === "string" && (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
}

async function upsertOwnArticleInner(id: string | null, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile?.author_id) {
    redirect("/autor?error=" + encodeURIComponent("Seu login ainda não está vinculado a um perfil de autor. Peça a um admin para vincular."));
  }

  const supabase = await createClient();
  const { url: coverImageUrl, error: imageError } = await uploadPublicImage(formData.get("cover_image_file"), "articles");

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const intent = String(formData.get("intent") ?? "draft");
  const format = (String(formData.get("format") ?? "opiniao")) as Article["format"];
  const requestedScheduledFor = String(formData.get("scheduled_for") ?? "").trim() || null;

  // Status is never picked directly — it follows which of the three action
  // buttons was clicked. Authors can only ever reach draft/pending; only an
  // admin's approval can move an article to scheduled/published (see
  // approveAndSchedule/publishArticle in the admin actions).
  let status: Article["status"] = "draft";
  let scheduledFor = requestedScheduledFor;
  if (intent === "schedule") {
    if (!requestedScheduledFor) {
      throw new Error("Escolha uma data de publicação antes de agendar.");
    }
    status = "pending";
  } else if (intent === "send") {
    status = "pending";
    // No specific date requested — this is the "approve = publish right
    // away" path (see the admin list's "Aprovar" vs "Aprovar e agendar").
    scheduledFor = null;
  }
  // intent === "draft" (or anything else): stays draft, keeping whatever
  // date was already set so a draft-in-progress doesn't lose a planned date.

  const payload = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    // Normalize any "\r\n" that might still slip through — the markdown-lite
    // renderer's paragraph/list/quote splitting only recognizes plain "\n\n".
    content_pt: String(formData.get("content_pt") ?? "").replace(/\r\n?/g, "\n"),
    content_en: String(formData.get("content_en") ?? "").replace(/\r\n?/g, "\n") || null,
    excerpt_pt: String(formData.get("excerpt_pt") ?? "") || null,
    excerpt_en: String(formData.get("excerpt_en") ?? "") || null,
    summary_pt: String(formData.get("summary_pt") ?? "") || null,
    summary_en: String(formData.get("summary_en") ?? "") || null,
    cover_image: coverImageUrl || String(formData.get("cover_image_url") ?? "").trim() || String(formData.get("current_cover_image") ?? "") || null,
    cover_image_caption: String(formData.get("cover_image_caption") ?? "") || null,
    cover_image_credit: String(formData.get("cover_image_credit") ?? "") || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    seo_title_pt: String(formData.get("seo_title_pt") ?? "") || null,
    seo_desc_pt: String(formData.get("seo_desc_pt") ?? "") || null,
    format,
    status,
    scheduled_for: scheduledFor,
    author_id: profile.author_id,
    // Clear any standing "alterações solicitadas" note once the author
    // actually resubmits — leave it alone on a plain draft save (an
    // `undefined` value is dropped from the JSON body entirely, so the
    // column is left untouched rather than being overwritten with it).
    review_feedback: intent === "draft" ? undefined : null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  let articleId = id;
  const isNew = !articleId;
  let oldArticle: Article | null = null;
  let saveError: string | null = null;
  if (articleId) {
    const { data } = await client.from("articles").select("*").eq("id", articleId).single();
    oldArticle = data as Article | null;
    // .select() after update is required to actually prove a row was
    // written — RLS silently returns success with zero rows (no error at
    // all) when the policy blocks the write, which looks identical to a
    // real save unless you check that a row actually came back.
    const { data: updated, error } = await client.from("articles").update(payload).eq("id", articleId).eq("author_id", profile.author_id).select("id");
    if (error) saveError = error.message;
    else if (!updated || updated.length === 0) saveError = "A alteração não foi salva — este artigo pode não estar mais vinculado à sua conta.";
  } else {
    const { data, error } = await client.from("articles").insert(payload).select("id").single();
    if (error) saveError = error.message;
    articleId = data?.id ?? null;
  }

  // A failed write (e.g. a duplicate slug) must never look like a success —
  // this used to redirect to ?saved=1 unconditionally regardless of error.
  if (saveError) {
    redirect(`/autor/artigos/${articleId ?? "novo"}?saveError=${encodeURIComponent(saveError)}`);
  }

  await logActivity({
    userId: profile.id,
    userEmail: profile.email,
    action: isNew ? "create" : "update",
    entityType: "artigo",
    entityLabel: title_pt,
    details: diffFields(oldArticle, payload, ARTICLE_TRACKED_FIELDS),
  });

  // Only notify on the transition INTO pending — not every draft save, and
  // not again if it was already sitting in pending (e.g. re-saving without
  // changing the action taken).
  const wasPending = oldArticle?.status === "pending";
  if (status === "pending" && !wasPending) {
    const cameFromChangesRequested = Boolean(oldArticle?.review_feedback);
    await notifyAdmins({
      title: cameFromChangesRequested
        ? `"${title_pt}" foi revisado e reenviado para aprovação`
        : `"${title_pt}" foi enviado para aprovação`,
      link: `/admin/artigos/${articleId}/revisar`,
    });
  }

  revalidatePath("/autor");
  revalidatePath("/admin/artigos");

  if (imageError && articleId) {
    redirect(`/autor/artigos/${articleId}?imageError=${encodeURIComponent(imageError)}`);
  }
  // Stay on the article being edited instead of bouncing back to the list —
  // the person decides when they're done, not the save action.
  redirect(`/autor/artigos/${articleId}?saved=1`);
}

export async function deleteOwnArticle(id: string) {
  const profile = await getCurrentProfile();
  if (!profile?.author_id) return;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: article } = await client.from("articles").select("title_pt").eq("id", id).single();
  await client.from("articles").delete().eq("id", id).eq("author_id", profile.author_id);
  await logActivity({ userId: profile.id, userEmail: profile.email, action: "delete", entityType: "artigo", entityLabel: article?.title_pt });
  revalidatePath("/autor");
}
