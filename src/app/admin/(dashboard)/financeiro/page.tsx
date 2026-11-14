import { createClient } from "@/lib/supabase/server";
import { FinanceDashboard } from "./FinanceDashboard";
import { computeColumnistPayouts, DEFAULT_PAYOUT_PARAMS, type ArticleForPayout, type PageViewForPayout } from "@/lib/columnist-payout";
import type { FinanceClient, FinanceEntry, FinancePayoutParams } from "@/types/database.types";

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
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [{ data: entriesData }, { data: clientsData }, { data: recentData }, { data: payoutParamsData }, { data: articlesData }, { data: viewsData }] = await Promise.all([
    client.from("finance_entries").select("*"),
    client.from("finance_clients").select("*"),
    client.from("finance_entries").select("*").order("entry_date", { ascending: false }).limit(8),
    client.from("finance_payout_params").select("*").eq("id", "00000000-0000-0000-0000-000000000001").maybeSingle(),
    client
      .from("articles")
      .select("id, columnist_id, published_at")
      .eq("status", "published")
      .gte("published_at", monthStart.toISOString())
      .lte("published_at", monthEnd.toISOString()),
    client
      .from("page_views")
      .select("article_id, created_at")
      .eq("page_type", "article")
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString()),
  ]);

  const entries = (entriesData ?? []) as FinanceEntry[];
  const clients = (clientsData ?? []) as FinanceClient[];
  const recentEntries = (recentData ?? []) as FinanceEntry[];
  const clientNameById = new Map(clients.map((c) => [c.id, c.name]));

  // Colunistas' pay (per article + weekly "mais lidas" bonuses, see
  // /admin/financeiro/parametros) is never logged as a finance_entries row
  // — it's computed live from the same rate/bonus table and folded into
  // this month's despesa automatically, so nobody has to re-enter it.
  const payoutParams = (payoutParamsData ?? null) as FinancePayoutParams | null;
  const resolvedPayoutParams = {
    perArticleRate: payoutParams?.per_article_rate ?? DEFAULT_PAYOUT_PARAMS.perArticleRate,
    weeklyRankBonuses: payoutParams?.weekly_rank_bonuses ?? DEFAULT_PAYOUT_PARAMS.weeklyRankBonuses,
  };
  const payouts = computeColumnistPayouts(
    (articlesData ?? []) as ArticleForPayout[],
    (viewsData ?? []) as PageViewForPayout[],
    resolvedPayoutParams,
    now.getFullYear(),
    now.getMonth()
  );
  const columnistPayoutTotal = [...payouts.values()].reduce((sum, p) => sum + p.total, 0);

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

  // Folded into the current month only — past months in the 6-month chart
  // stay as pure finance_entries totals, since re-deriving colunistas' pay
  // for every prior month would mean re-running this same computation
  // across many more weeks of page_views for no real benefit here.
  const currentBucket = byMonth.get(currentMonthKey)!;
  currentBucket.expense += columnistPayoutTotal;

  const months = windowMonths.map(({ key, label }) => ({ label, ...byMonth.get(key)! }));
  const current = byMonth.get(currentMonthKey)!;

  return (
    <FinanceDashboard
      monthIncome={current.income}
      monthExpense={current.expense}
      columnistPayoutTotal={columnistPayoutTotal}
      mrr={mrr}
      months={months}
      recentEntries={recentEntries}
      clientNameById={clientNameById}
    />
  );
}
