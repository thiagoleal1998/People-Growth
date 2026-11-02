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
