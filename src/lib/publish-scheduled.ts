import { createAdminClient } from "@/lib/supabase/server";

// Called from the public layout on every visit — there's no cron job in this
// project, so a scheduled article actually goes live the first time anyone
// hits a public page after its scheduled_for time has passed. Admin approval
// already happened before status became "scheduled" (see approveAndSchedule
// in admin/artigos/actions.ts), so this only ever flips already-approved rows.
// The publish date is only set on the first publication: an article that was
// already live before (edited, then approved and scheduled again) keeps its date.
//
// A scheduled-but-not-yet-live article can still carry a non-null
// published_at here — not from a legitimate prior publish, but from
// upsertArticleInner's own "preserve the original date across an edit"
// logic, which deliberately never clears published_at once set (so that
// unpublishing a live article to fix something, then republishing, keeps its
// original date). That stickiness turns into a real bug if an article was
// ever published by mistake for even a few seconds and corrected back to
// draft/pending/scheduled within the same session: published_at is left
// behind pointing at that accidental moment, and once the real scheduled
// time arrives this function would otherwise keep that stale date — making
// the article look days older than it is and sort as if it were already
// "old news" in every publish-date-ordered list (confirmed live: an article
// written and scheduled for today instead carried a stamp from when it was
// momentarily mis-published two days earlier).
//
// A published_at that PREDATES this article's own scheduled_for can never
// be a legitimate prior publish — you can't have gone live before the
// future date you're scheduling it for — so that specific case is treated
// as the leftover of exactly this bug and overwritten with the real,
// current go-live moment instead of trusted.
export async function publishDueScheduledArticles() {
  const supabase = await createAdminClient();
  const now = new Date().toISOString();
  const articles = () => supabase.from("articles") as any;

  // Never published before — the normal case.
  await articles().update({ status: "published", published_at: now }).eq("status", "scheduled").is("published_at", null).lte("scheduled_for", now);

  // Already carries a published_at. Comparing it against this row's own
  // scheduled_for needs a per-row check (the query builder can't compare
  // two columns against each other), so these are fetched and split in code
  // rather than filtered in the query itself.
  const { data: dueWithDate } = await articles()
    .select("id, published_at, scheduled_for")
    .eq("status", "scheduled")
    .not("published_at", "is", null)
    .lte("scheduled_for", now);
  for (const row of (dueWithDate ?? []) as { id: string; published_at: string; scheduled_for: string }[]) {
    // published_at >= scheduled_for is a coherent prior publish (the article
    // really was live before, at or after its own schedule date) — keep it.
    // published_at < scheduled_for can't be real — nothing can have gone
    // live before the future date it's now scheduled for — so it's treated
    // as this exact bug's leftover and replaced with the real go-live time.
    const isStale = new Date(row.published_at).getTime() < new Date(row.scheduled_for).getTime();
    await articles().update(isStale ? { status: "published", published_at: now } : { status: "published" }).eq("id", row.id);
  }
}
