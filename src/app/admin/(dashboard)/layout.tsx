import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, profile] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").single(),
    getCurrentProfile(),
  ]);
  const logoUrl = configData?.value as string | undefined;

  let userName: string | undefined;
  let userPhoto: string | undefined;
  if (profile?.author_id) {
    const { data: author } = await client.from("authors").select("name,photo_url").eq("id", profile.author_id).single();
    userName = author?.name;
    userPhoto = author?.photo_url ?? undefined;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar logoUrl={logoUrl} userName={userName ?? profile?.email} userPhoto={userPhoto} />
      <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
