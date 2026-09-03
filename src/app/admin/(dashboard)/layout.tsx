import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, profile, { count: pendingComments }, { count: newLeads }, { count: newErrors }, { count: openTickets }, { count: pendingResets }] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").single(),
    getCurrentProfile(),
    client.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    client.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("error_reports").select("id", { count: "exact", head: true }).eq("status", "new"),
    client.from("internal_tickets").select("id", { count: "exact", head: true }).neq("status", "resolved"),
    client.from("password_reset_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const logoUrl = configData?.value as string | undefined;

  if (profile?.id) {
    const admin = await createAdminClient();
    await (admin as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .from("user_profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", profile.id);
  }

  let userName: string | undefined;
  let userPhoto: string | undefined;
  if (profile?.author_id) {
    const { data: author } = await client.from("authors").select("name,photo_url").eq("id", profile.author_id).single();
    userName = author?.name;
    userPhoto = author?.photo_url ?? undefined;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AdminSidebar
        logoUrl={logoUrl}
        userName={userName ?? profile?.email}
        userPhoto={userPhoto}
        counts={{ comentarios: pendingComments ?? 0, leads: newLeads ?? 0, chamados: (newErrors ?? 0) + (openTickets ?? 0), resetRequests: pendingResets ?? 0 }}
      />
      <main className="admin-scroll" style={{ flex: 1, padding: "2rem", overflowY: "auto", height: "100%" }}>{children}</main>
    </div>
  );
}
