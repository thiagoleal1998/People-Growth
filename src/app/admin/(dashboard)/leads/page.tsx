import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { LeadsClient } from "./LeadsClient";
import type { Lead } from "@/types/database.types";

export default async function LeadsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("leads").select("*").order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];

  return (
    <div>
      <PageHeader title="Leads / CRM" subtitle={`${leads.length} lead${leads.length === 1 ? "" : "s"} no total`} />
      <LeadsClient leads={leads} />
    </div>
  );
}
