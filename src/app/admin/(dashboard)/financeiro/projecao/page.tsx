import { createClient } from "@/lib/supabase/server";
import { ProjectionCalculator } from "./ProjectionCalculator";
import type { Columnist, FinanceClient, FinanceEntry, FinanceProjection } from "@/types/database.types";

export default async function FinanceProjectionPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: entriesData }, { data: clientsData }, { data: foundersData }, { data: teamData }, { data: savedData }] = await Promise.all([
    client.from("finance_entries").select("*"),
    client.from("finance_clients").select("*"),
    client.from("columnists").select("*").eq("is_founder", true).order("name"),
    // The same "Equipe" concept as the org chart (A empresa): anyone with a
    // manager set there, not just founders/columnists in general.
    client.from("columnists").select("*").not("org_chart_manager_id", "is", null).order("name"),
    client.from("finance_projections").select("*").eq("id", "00000000-0000-0000-0000-000000000001").maybeSingle(),
  ]);

  const entries = (entriesData ?? []) as FinanceEntry[];
  const clients = (clientsData ?? []) as FinanceClient[];
  const founders = (foundersData ?? []) as Columnist[];
  const team = ((teamData ?? []) as Columnist[]).filter((c) => c.name?.trim());
  const saved = (savedData ?? null) as FinanceProjection | null;

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

  return <ProjectionCalculator founders={founders} team={team} defaultRevenue={mrr} defaultExpense={defaultExpense} saved={saved} />;
}
