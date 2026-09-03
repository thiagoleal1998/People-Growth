import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorSidebar } from "@/components/autor/AuthorSidebar";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AuthorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, profile] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").single(),
    getCurrentProfile(),
  ]);
  const logoUrl = configData?.value as string | undefined;

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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AuthorSidebar logoUrl={logoUrl} pendingComments={pendingComments} />
      <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
