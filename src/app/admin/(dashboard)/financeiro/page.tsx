import { createClient } from "@/lib/supabase/server";
import { FinanceDashboard } from "./FinanceDashboard";
import type { FinanceClient, FinanceEntry } from "@/types/database.types";

const MONTH_LABELS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function FinanceiroPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7); // "YYYY-MM"

  // No date filter here on purpose: a "monthly" entry logged once must keep
  // counting every month after it (see the projection loop below), however
  // far back it was first logged — a 6-month cutoff would silently drop a
  // recurring expense/revenue that started earlier than that.
  const [{ data: entriesData }, { data: clientsData }, { data: recentData }] = await Promise.all([
    client.from("finance_entries").select("*"),
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

  // The 6 months shown (oldest to newest, always ending on the current one).
  const windowMonths: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    windowMonths.push({ key, label: `${MONTH_LABELS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}` });
  }
  const windowKeys = new Set(windowMonths.map((m) => m.key));

  const monthKeyOf = (iso: string) => iso.slice(0, 7);
  const byMonth = new Map<string, { income: number; expense: number }>(windowMonths.map((m) => [m.key, { income: 0, expense: 0 }]));
  for (const e of entries) {
    const startKey = monthKeyOf(e.entry_date);
    if (e.recurrence === "monthly") {
      // Logged once, keeps recurring every month from entry_date through
      // the current month — e.g. hosting logged in October still counts
      // in November, December, etc. without having to be re-entered.
      if (startKey > currentMonthKey) continue;
      for (const { key } of windowMonths) {
        if (key < startKey || key > currentMonthKey) continue;
        const bucket = byMonth.get(key)!;
        if (e.type === "income") bucket.income += e.amount;
        else bucket.expense += e.amount;
      }
    } else if (windowKeys.has(startKey)) {
      const bucket = byMonth.get(startKey)!;
      if (e.type === "income") bucket.income += e.amount;
      else bucket.expense += e.amount;
    }
  }

  const months = windowMonths.map(({ key, label }) => ({ label, ...byMonth.get(key)! }));
  const current = byMonth.get(currentMonthKey)!;

  return (
    <FinanceDashboard
      monthIncome={current.income}
      monthExpense={current.expense}
      mrr={mrr}
      months={months}
      recentEntries={recentEntries}
      clientNameById={clientNameById}
    />
  );
}
