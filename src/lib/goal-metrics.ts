export type GoalMetric = "page_views" | "unique_visitors" | "leads" | "newsletter_subs" | "social_followers";

// Central place for "what's the current value toward this goal" — keeps
// the count-safe query pattern (exact count / ranged fetch, never a bare
// .select() that silently caps at Postgres/PostgREST's default 1000 rows —
// see the fix on this same tab's Visão geral queries) enforced in one
// spot instead of once per metric per goal.
export async function computeCurrentMetricValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  metric: GoalMetric,
  sinceISO: string,
  socialAccountId: string | null
): Promise<number> {
  switch (metric) {
    case "page_views": {
      const { count } = await client.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", sinceISO);
      return count ?? 0;
    }
    case "unique_visitors": {
      const { data } = await client.from("page_views").select("visitor_id").gte("created_at", sinceISO).range(0, 19999);
      return new Set(((data ?? []) as { visitor_id: string }[]).map((r) => r.visitor_id)).size;
    }
    case "leads": {
      const { count } = await client.from("leads").select("*", { count: "exact", head: true }).gte("created_at", sinceISO);
      return count ?? 0;
    }
    case "newsletter_subs": {
      const { count } = await client.from("newsletter_subs").select("*", { count: "exact", head: true }).gte("subscribed_at", sinceISO);
      return count ?? 0;
    }
    case "social_followers": {
      if (!socialAccountId) return 0;
      const { data } = await client
        .from("social_follower_snapshots")
        .select("follower_count")
        .eq("account_id", socialAccountId)
        .order("fetched_at", { ascending: false })
        .limit(1);
      return data?.[0]?.follower_count ?? 0;
    }
  }
}

export type GoalProgress = {
  currentValue: number;
  progressPct: number;
  daysTotal: number;
  daysElapsed: number;
  onTrack: "achieved" | "on_track" | "behind";
};

// Shared by the Relatórios "Planos e Projeções" tab and the admin
// dashboard's goals summary widget — "on track" compares how much of the
// goal's time window has elapsed against how much of the target has been
// reached (90% tolerance so a goal running slightly behind the straight-
// line pace isn't flagged red the moment it dips under 100%).
export async function computeGoalProgress(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  goal: { metric: GoalMetric; starts_at: string; target_date: string; target_value: number; social_account_id: string | null }
): Promise<GoalProgress> {
  const currentValue = await computeCurrentMetricValue(client, goal.metric, goal.starts_at, goal.social_account_id);
  const nowMs = Date.now();
  const start = new Date(goal.starts_at).getTime();
  const end = new Date(`${goal.target_date}T23:59:59`).getTime();
  const daysTotal = Math.max(1, Math.round((end - start) / 86400000));
  const daysElapsed = Math.max(0, Math.min(daysTotal, Math.round((nowMs - start) / 86400000)));
  const progressPct = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
  const expectedFraction = daysElapsed / daysTotal;
  const actualFraction = currentValue / goal.target_value;
  const onTrack: GoalProgress["onTrack"] = currentValue >= goal.target_value ? "achieved" : actualFraction >= expectedFraction * 0.9 ? "on_track" : "behind";
  return { currentValue, progressPct, daysTotal, daysElapsed, onTrack };
}
