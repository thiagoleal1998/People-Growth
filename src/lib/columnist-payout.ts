// Monthly pay for a colunista = (articles published that month × a fixed
// R$ rate) + a bonus for every time one of their articles landed in that
// week's top-5 "mais lidas" ranking, summed across every 7-day block of
// the month. Both the rate and the 5 bonus amounts are admin-editable (see
// /admin/financeiro/parametros) — this module is the shared math, used by
// that page (to preview the numbers being configured) and by the main
// Financeiro dashboard (to pull the current month's total into "Despesa
// do mês" automatically).
export type PayoutParams = {
  perArticleRate: number;
  // Index 0 = 1st place's bonus, index 4 = 5th place's.
  weeklyRankBonuses: number[];
};

export const DEFAULT_PAYOUT_PARAMS: PayoutParams = {
  perArticleRate: 5,
  weeklyRankBonuses: [100, 90, 80, 70, 60],
};

export type ArticleForPayout = { id: string; columnist_id: string | null; published_at: string | null };
export type PageViewForPayout = { article_id: string | null; created_at: string };

export type WeeklyWin = { weekIndex: number; rank: number; articleId: string; bonus: number };

export type ColumnistPayout = {
  articlesCount: number;
  articlesAmount: number;
  weeklyBonusTotal: number;
  weeklyWins: WeeklyWin[];
  total: number;
};

// A month is cut into 4 fixed blocks — days 1-7, 8-14, 15-21 and 22-through
// the end of the month — rather than real calendar weeks, so every month
// always resolves to exactly 4 "semanas" regardless of which weekday the
// 1st falls on, matching how the payout is described (4 weekly rankings
// summed per month).
export function getMonthWeekBlocks(year: number, monthIndex: number): { start: Date; end: Date }[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const starts = [1, 8, 15, 22];
  return starts.map((d, i) => {
    const start = new Date(year, monthIndex, d, 0, 0, 0, 0);
    const endDay = i < starts.length - 1 ? starts[i + 1] - 1 : daysInMonth;
    const end = new Date(year, monthIndex, endDay, 23, 59, 59, 999);
    return { start, end };
  });
}

export function computeColumnistPayouts(
  articles: ArticleForPayout[],
  pageViews: PageViewForPayout[],
  params: PayoutParams,
  year: number,
  monthIndex: number
): Map<string, ColumnistPayout> {
  const result = new Map<string, ColumnistPayout>();
  const articleColumnist = new Map(articles.map((a) => [a.id, a.columnist_id]));

  function ensure(columnistId: string): ColumnistPayout {
    let entry = result.get(columnistId);
    if (!entry) {
      entry = { articlesCount: 0, articlesAmount: 0, weeklyBonusTotal: 0, weeklyWins: [], total: 0 };
      result.set(columnistId, entry);
    }
    return entry;
  }

  for (const a of articles) {
    if (!a.columnist_id || !a.published_at) continue;
    const pub = new Date(a.published_at);
    if (pub.getFullYear() !== year || pub.getMonth() !== monthIndex) continue;
    ensure(a.columnist_id).articlesCount += 1;
  }
  for (const entry of result.values()) {
    entry.articlesAmount = entry.articlesCount * params.perArticleRate;
  }

  const weeks = getMonthWeekBlocks(year, monthIndex);
  weeks.forEach((week, weekIndex) => {
    const viewsByArticle = new Map<string, number>();
    for (const v of pageViews) {
      if (!v.article_id) continue;
      const created = new Date(v.created_at);
      if (created < week.start || created > week.end) continue;
      viewsByArticle.set(v.article_id, (viewsByArticle.get(v.article_id) ?? 0) + 1);
    }
    const ranked = [...viewsByArticle.entries()].sort((a, b) => b[1] - a[1]).slice(0, params.weeklyRankBonuses.length);
    ranked.forEach(([articleId], idx) => {
      const columnistId = articleColumnist.get(articleId);
      if (!columnistId) return;
      const bonus = params.weeklyRankBonuses[idx] ?? 0;
      const entry = ensure(columnistId);
      entry.weeklyBonusTotal += bonus;
      entry.weeklyWins.push({ weekIndex, rank: idx + 1, articleId, bonus });
    });
  });

  for (const entry of result.values()) {
    entry.total = entry.articlesAmount + entry.weeklyBonusTotal;
  }

  return result;
}
