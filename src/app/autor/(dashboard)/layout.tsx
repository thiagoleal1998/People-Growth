import { createClient } from "@/lib/supabase/server";
import { AuthorSidebar } from "@/components/autor/AuthorSidebar";

export default async function AuthorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: configData } = await (supabase as any).from("site_config").select("value").eq("key", "logo_url").single();
  const logoUrl = configData?.value as string | undefined;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AuthorSidebar logoUrl={logoUrl} />
      <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
