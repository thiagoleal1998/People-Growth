import Link from "next/link";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeGoalProgress } from "@/lib/goal-metrics";
import { Badge } from "./ui";
import type { Goal } from "@/types/database.types";

const METRIC_LABELS: Record<Goal["metric"], string> = {
  page_views: "Visualizações de página",
  unique_visitors: "Visitantes únicos",
  leads: "Leads",
  newsletter_subs: "Inscritos na newsletter",
  social_followers: "Seguidores em rede social",
};

// Read-only summary for the dashboard home — full create/edit/delete lives
// in /admin/relatorios?tab=planos (PlanosClient.tsx), which is where this
// links out to. Reuses computeGoalProgress from goal-metrics.ts rather than
// recomputing on-track status here, same as that tab does.
export async function GoalsSummaryWidget() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: goalsData } = await client.from("goals").select("*").eq("status", "active").order("target_date", { ascending: true }).limit(6);
  const goals = (goalsData ?? []) as Goal[];

  if (goals.length === 0) return null;

  const goalsWithProgress = await Promise.all(goals.map(async (g) => ({ ...g, progress: await computeGoalProgress(client, g) })));

  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem", marginBottom: "2.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={18} color="#315E9C" />
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)" }}>Metas</h2>
        </div>
        <Link href="/admin/relatorios?tab=planos" style={{ color: "#315E9C", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Ver planos e projeções →</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1rem" }}>
        {goalsWithProgress.map((g) => {
          const badge =
            g.progress.onTrack === "achieved"
              ? { tone: "success" as const, label: "Atingida" }
              : g.progress.onTrack === "on_track"
                ? { tone: "neutral" as const, label: "No caminho" }
                : { tone: "warning" as const, label: "Atrás" };
          return (
            <div key={g.id} style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)", overflowWrap: "anywhere" }}>{g.title}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--admin-faint)" }}>{METRIC_LABELS[g.metric]}</div>
                </div>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--admin-text)" }}>{g.progress.currentValue.toLocaleString("pt-BR")}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>meta: {g.target_value.toLocaleString("pt-BR")}</span>
              </div>
              <div style={{ height: "0.375rem", borderRadius: "9999px", backgroundColor: "var(--admin-surface-alt)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(g.progress.progressPct, 2)}%`, borderRadius: "9999px", backgroundColor: badge.tone === "warning" ? "#cc9200" : "#315E9C" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
