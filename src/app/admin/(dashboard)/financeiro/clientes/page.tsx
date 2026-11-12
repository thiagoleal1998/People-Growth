import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ClientsTable } from "./ClientsTable";
import type { FinanceClient } from "@/types/database.types";

export default async function FinanceClientsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("finance_clients").select("*").order("name");
  const clients = (data ?? []) as FinanceClient[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Clientes" subtitle="Clientes e projetos de consultoria — base do faturamento recorrente (MRR)." />
      <ClientsTable clients={clients} />
    </div>
  );
}
