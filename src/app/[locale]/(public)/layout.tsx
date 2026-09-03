import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { createClient } from "@/lib/supabase/server";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("site_config").select("key,value").eq("key", "logo_url").single();
  const logoUrl = (data as { value: string | null } | null)?.value;

  return (
    <>
      <Navbar logoUrl={logoUrl} />
      <main style={{ paddingTop: "4rem" }}>
        <CategoryNav />
        {children}
      </main>
      <Footer logoUrl={logoUrl} />
      <CookieBanner />
    </>
  );
}
