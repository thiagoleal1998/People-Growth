import { createAdminClient } from "@/lib/supabase/server";

// Called from the public layout on every visit — there's no cron job in this
// project, so a scheduled article actually goes live the first time anyone
// hits a public page after its scheduled_for time has passed. Admin approval
// already happened before status became "scheduled" (see approveAndSchedule
// in admin/artigos/actions.ts), so this only ever flips already-approved rows.
// The publish date is only set on the first publication: an article that was
// already live before (edited, then approved and scheduled again) keeps its date.
export async function publishDueScheduledArticles() {
  const supabase = await createAdminClient();
  const now = new Date().toISOString();
  const articles = () => supabase.from("articles") as any;
  await articles().update({ status: "published", published_at: now }).eq("status", "scheduled").is("published_at", null).lte("scheduled_for", now);
  await articles().update({ status: "published" }).eq("status", "scheduled").not("published_at", "is", null).lte("scheduled_for", now);
}
