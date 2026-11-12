import { createClient } from "@/lib/supabase/server";
import { ProjectionCalculator } from "./ProjectionCalculator";
import type { Columnist, FinanceClient, FinanceEntry } from "@/types/database.types";

export default async function FinanceProjectionPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: entriesData }, { data: clientsData }, { data: foundersData }] = await Promise.all([
    client.from("finance_entries").select("*"),
    client.from("finance_clients").select("*"),
    client.from("columnists").select("*").eq("is_founder", true).order("name"),
  ]);

  const entries = (entriesData ?? []) as FinanceEntry[];
  const clients = (clientsData ?? []) as FinanceClient[];
  const founders = (foundersData ?? []) as Columnist[];

  const mrr = clients.filter((c) => c.status === "active").reduce((sum, c) => sum + (c.contract_value ?? 0), 0);

  // Current month's expense total, counting a "monthly" entry logged in any
  // past month as still active today — same projection rule as the
  // dashboard (see financeiro/page.tsx), so this default starts from the
  // same number already shown there instead of a different, inconsistent one.
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  let defaultExpense = 0;
  for (const e of entries) {
    if (e.type !== "expense") continue;
    const startKey = e.entry_date.slice(0, 7);
    if (startKey > currentMonthKey) continue;
    if (e.recurrence === "monthly" || startKey === currentMonthKey) defaultExpense += e.amount;
  }

  return <ProjectionCalculator founders={founders} defaultRevenue={mrr} defaultExpense={defaultExpense} />;
}
