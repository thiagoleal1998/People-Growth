import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { SeoTabs } from "./SeoTabs";
import { updateSeoConfig } from "./actions";

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
      <SeoTabs values={values} action={updateSeoConfig} />
    </div>
  );
}
