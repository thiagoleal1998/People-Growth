import { createClient } from "@/lib/supabase/server";
import { FinanceDashboard } from "./FinanceDashboard";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

const MONTH_LABELS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function FinanceiroPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const now = new Date();
  // 6 months back, so the window always includes the current (partial) month.
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const windowStartISO = windowStart.toISOString().slice(0, 10);

  const [{ data: entriesData }, { data: clientsData }, { data: recentData }] = await Promise.all([
    client.from("finance_entries").select("*").gte("entry_date", windowStartISO).order("entry_date", { ascending: false }),
    client.from("finance_clients").select("*"),
    client.from("finance_entries").select("*").order("entry_date", { ascending: false }).limit(8),
  ]);

  const entries = (entriesData ?? []) as FinanceEntry[];
  const clients = (clientsData ?? []) as FinanceClient[];
  const recentEntries = (recentData ?? []) as FinanceEntry[];
  const clientNameById = new Map(clients.map((c) => [c.id, c.name]));

  // MRR as a proxy: the sum of contract_value across clients currently
  // active — see the migration's own comment for why there's no separate
  // invoice/installment concept yet.
  const mrr = clients.filter((c) => c.status === "active").reduce((sum, c) => sum + (c.contract_value ?? 0), 0);

  const monthKey = (iso: string) => iso.slice(0, 7); // "YYYY-MM"
  const currentMonthKey = now.toISOString().slice(0, 7);
  let monthIncome = 0;
  let monthExpense = 0;
  const byMonth = new Map<string, { income: number; expense: number }>();
  for (const e of entries) {
    const key = monthKey(e.entry_date);
    const bucket = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (e.type === "income") bucket.income += e.amount;
    else bucket.expense += e.amount;
    byMonth.set(key, bucket);
    if (key === currentMonthKey) {
      if (e.type === "income") monthIncome += e.amount;
      else monthExpense += e.amount;
    }
  }

  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const bucket = byMonth.get(key) ?? { income: 0, expense: 0 };
    months.push({ label: `${MONTH_LABELS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, income: bucket.income, expense: bucket.expense });
  }

  return (
    <FinanceDashboard
      monthIncome={monthIncome}
      monthExpense={monthExpense}
      mrr={mrr}
      months={months}
      recentEntries={recentEntries}
      clientNameById={clientNameById}
    />
  );
}
