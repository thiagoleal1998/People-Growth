import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { EntriesTable } from "./EntriesTable";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

export default async function FinanceEntriesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: entriesData }, { data: clientsData }] = await Promise.all([
    client.from("finance_entries").select("*").order("entry_date", { ascending: false }),
    client.from("finance_clients").select("id,name"),
  ]);
  const entries = (entriesData ?? []) as FinanceEntry[];
  const clientNameById = new Map(((clientsData ?? []) as Pick<FinanceClient, "id" | "name">[]).map((c) => [c.id, c.name]));

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Lançamentos" subtitle="Receitas e despesas lançadas manualmente — base do fluxo de caixa." />
      <EntriesTable entries={entries} clientNameById={clientNameById} />
    </div>
  );
}
