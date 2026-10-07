import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorSidebar } from "@/components/autor/AuthorSidebar";

export default async function AuthorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, profile] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").single(),
    getCurrentProfile(),
  ]);
  const logoUrl = configData?.value as string | undefined;

  if (profile?.id) {
    const admin = await createAdminClient();
    await (admin as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .from("user_profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", profile.id);
  }

  let pendingComments = 0;
  if (profile?.author_id) {
    const { data: ownArticles } = await client.from("articles").select("id").eq("author_id", profile.author_id);
    const articleIds = ((ownArticles ?? []) as { id: string }[]).map((a) => a.id);
    if (articleIds.length > 0) {
      const { count } = await client
        .from("comments")
        .select("id", { count: "exact", head: true })
        .in("article_id", articleIds)
        .eq("status", "pending");
      pendingComments = count ?? 0;
    }
  }

  // Unread = every announcement minus the ones this person already has a read
  // receipt for — a rough count rather than a NOT EXISTS join, same trade-off
  // as the rest of this file's counts.
  let unreadAnnouncements = 0;
  if (profile?.id) {
    const { count: totalCount } = await client.from("announcements").select("id", { count: "exact", head: true });
    const { count: readCount } = await client.from("announcement_reads").select("announcement_id", { count: "exact", head: true }).eq("user_id", profile.id);
    unreadAnnouncements = Math.max(0, (totalCount ?? 0) - (readCount ?? 0));
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AuthorSidebar logoUrl={logoUrl} pendingComments={pendingComments} unreadAnnouncements={unreadAnnouncements} />
      <main className="admin-scroll" style={{ flex: 1, padding: "2rem", overflowY: "auto", height: "100%" }}>{children}</main>
    </div>
  );
}
