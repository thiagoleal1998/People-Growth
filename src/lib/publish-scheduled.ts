import { createAdminClient } from "@/lib/supabase/server";

// Called from the public layout on every visit — there's no cron job in this
// project, so a scheduled article actually goes live the first time anyone
// hits a public page after its scheduled_for time has passed. Admin approval
// already happened before status became "scheduled" (see approveAndSchedule
// in admin/artigos/actions.ts), so this only ever flips already-approved rows.
export async function publishDueScheduledArticles() {
  const supabase = await createAdminClient();
  await supabase
    .from("articles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ status: "published", published_at: new Date().toISOString() } as any)
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString());
}
