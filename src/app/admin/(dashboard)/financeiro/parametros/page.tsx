import { createClient } from "@/lib/supabase/server";
import { ParametrosForm } from "./ParametrosForm";
import { computeColumnistPayouts, DEFAULT_PAYOUT_PARAMS, type ArticleForPayout, type PageViewForPayout } from "@/lib/columnist-payout";
import type { Columnist, FinancePayoutParams } from "@/types/database.types";

export default async function FinanceParametrosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  const [{ data: savedData }, { data: columnistsData }, { data: articlesData }, { data: viewsData }] = await Promise.all([
    client.from("finance_payout_params").select("*").eq("id", "00000000-0000-0000-0000-000000000001").maybeSingle(),
    client.from("columnists").select("id, name").eq("status", "active").order("name"),
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

  const saved = (savedData ?? null) as FinancePayoutParams | null;
  const columnists = (columnistsData ?? []) as Pick<Columnist, "id" | "name">[];
  const articles = (articlesData ?? []) as ArticleForPayout[];
  const pageViews = (viewsData ?? []) as PageViewForPayout[];

  const params = {
    perArticleRate: saved?.per_article_rate ?? DEFAULT_PAYOUT_PARAMS.perArticleRate,
    weeklyRankBonuses: saved?.weekly_rank_bonuses ?? DEFAULT_PAYOUT_PARAMS.weeklyRankBonuses,
  };

  const payouts = computeColumnistPayouts(articles, pageViews, params, year, monthIndex);
  const rawMonthLabel = monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);

  return (
    <ParametrosForm
      perArticleRate={params.perArticleRate}
      weeklyRankBonuses={params.weeklyRankBonuses}
      columnists={columnists}
      payouts={Object.fromEntries(payouts)}
      monthLabel={monthLabel}
    />
  );
}
