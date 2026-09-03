import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { SeoTabs } from "./SeoTabs";
import { updateSeoConfig } from "./actions";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type SiteConfigRow = { key: string; value: string | null };

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase as any).from("site_config").select("*")) as { data: SiteConfigRow[] | null };
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="SEO, GEO & AEO" subtitle="Como o site aparece em buscadores tradicionais e em ferramentas de IA" />
      <SeoTabs values={values} action={updateSeoConfig} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br"} />
    </div>
  );
}
