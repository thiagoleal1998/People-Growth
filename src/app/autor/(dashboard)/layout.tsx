import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AuthorSidebar } from "@/components/autor/AuthorSidebar";
import { TermsGate } from "@/components/autor/TermsGate";
import { AUTHOR_MENU_DEFAULTS, applyMenuOverrides, type MenuOverride } from "@/lib/menu-registry";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { INSTITUTIONAL_DEFAULTS } from "@/lib/institutional-defaults";

export default async function AuthorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, profile, { data: menuOverridesData }] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").single(),
    getCurrentProfile(),
    client.from("menu_items").select("id,label,sort_order").eq("panel", "autor"),
  ]);
  const logoUrl = configData?.value as string | undefined;
  const menu = applyMenuOverrides(AUTHOR_MENU_DEFAULTS, (menuOverridesData ?? []) as MenuOverride[]);

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

  // Applies to any login linked to an authors row, admin or not — a founder
  // writing columns is still a columnist for this purpose. This only ever
  // gates the author-panel self-service write path (see the RLS policies in
  // 063_author_terms_acceptance.sql); an admin's own /admin powers, which
  // run through a separate unconditional RLS policy, are unaffected either way.
  let termsGate: React.ReactNode = null;
  if (profile?.author_id) {
    const [{ data: authorData }, { data: termsPage }] = await Promise.all([
      client.from("authors").select("terms_accepted_at,terms_declined_at").eq("id", profile.author_id).single(),
      client.from("institutional_pages").select("title_pt,body_pt").eq("slug", "termo-aceite-colunistas").single(),
    ]);
    const defaults = INSTITUTIONAL_DEFAULTS["termo-aceite-colunistas"];
    const title = termsPage?.title_pt || defaults.titlePt || "Termo de Aceite";
    const body = termsPage?.body_pt || defaults.bodyPt;
    termsGate = (
      <TermsGate
        termsAcceptedAt={authorData?.terms_accepted_at ?? null}
        termsDeclinedAt={authorData?.terms_declined_at ?? null}
        termsTitle={title}
        termsBodyHtml={renderMarkdownLite(body)}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AuthorSidebar menu={menu} logoUrl={logoUrl} pendingComments={pendingComments} unreadAnnouncements={unreadAnnouncements} />
      <main className="admin-scroll" style={{ flex: 1, padding: "2rem", overflowY: "auto", height: "100%" }}>
        {termsGate}
        {children}
      </main>
    </div>
  );
}
