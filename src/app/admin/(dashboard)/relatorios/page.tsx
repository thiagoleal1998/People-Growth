import Link from "next/link";
import { Eye, Users, MousePointerClick, Percent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/ui";
import type { Article } from "@/types/database.types";

const PERIODS = [
  { key: "7", label: "7 dias" },
  { key: "30", label: "30 dias" },
  { key: "90", label: "90 dias" },
  { key: "all", label: "Tudo" },
] as const;

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: string; color: string }) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)" }}>{value}</div>
    </div>
  );
}

function Bar({ label, value, max, sub }: { label: string; value: number; max: number; sub?: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem", gap: "1rem" }}>
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)", flexShrink: 0 }}>
          {value.toLocaleString("pt-BR")}{sub ? ` · ${sub}` : ""}
        </span>
      </div>
      <div style={{ height: "0.5rem", borderRadius: "9999px", backgroundColor: "var(--admin-surface-alt)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: "#4361EE" }} />
      </div>
    </div>
  );
}

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period = "30" } = await searchParams;
  const days = period === "all" ? null : Number(period) || 30;
  const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  let viewsQuery = client.from("page_views").select("path, page_type, article_id, visitor_id");
  if (since) viewsQuery = viewsQuery.gte("created_at", since);
  let adQuery = client.from("ad_events").select("ad_slot_key, event_type");
  if (since) adQuery = adQuery.gte("created_at", since);

  const [{ data: viewsData }, { data: adData }, { data: articlesData }] = await Promise.all([
    viewsQuery,
    adQuery,
    client.from("articles").select("id, title_pt"),
  ]);

  const views = (viewsData ?? []) as { path: string; page_type: string; article_id: string | null; visitor_id: string }[];
  const adEvents = (adData ?? []) as { ad_slot_key: string; event_type: string }[];
  const articleTitles = new Map(((articlesData ?? []) as Pick<Article, "id" | "title_pt">[]).map((a) => [a.id, a.title_pt]));

  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map((v) => v.visitor_id)).size;
  const totalImpressions = adEvents.filter((e) => e.event_type === "impression").length;
  const totalClicks = adEvents.filter((e) => e.event_type === "click").length;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";

  const byPath = new Map<string, { views: number; visitors: Set<string>; title: string }>();
  for (const v of views) {
    const label = v.article_id ? (articleTitles.get(v.article_id) ?? v.path) : v.path;
    const entry = byPath.get(v.path) ?? { views: 0, visitors: new Set<string>(), title: label };
    entry.views++;
    entry.visitors.add(v.visitor_id);
    byPath.set(v.path, entry);
  }
  const topPages = Array.from(byPath.entries())
    .map(([path, v]) => ({ path, views: v.views, uniques: v.visitors.size, title: v.title }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  const maxPageViews = topPages[0]?.views ?? 0;

  const adByKey = new Map<string, { impressions: number; clicks: number }>();
  for (const e of adEvents) {
    const s = adByKey.get(e.ad_slot_key) ?? { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") s.impressions++;
    else s.clicks++;
    adByKey.set(e.ad_slot_key, s);
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Métricas reais de audiência do site — visitas anônimas, sem cookies de rastreamento."
        action={
          <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.625rem", padding: "0.25rem" }}>
            {PERIODS.map((p) => (
              <Link
                key={p.key}
                href={`/admin/relatorios?period=${p.key}`}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: period === p.key ? "white" : "var(--admin-muted)",
                  backgroundColor: period === p.key ? "#4361EE" : "transparent",
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <StatCard icon={Eye} label="Visualizações de página" value={totalViews.toLocaleString("pt-BR")} color="#4361EE" />
        <StatCard icon={Users} label="Visitantes únicos" value={uniqueVisitors.toLocaleString("pt-BR")} color="#06D6A0" />
        <StatCard icon={MousePointerClick} label="Cliques em anúncios" value={totalClicks.toLocaleString("pt-BR")} color="#FFB703" />
        <StatCard icon={Percent} label="CTR de anúncios" value={`${ctr}%`} color="#4361EE" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.25rem" }}>
        <Card>
          <div style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Páginas mais acessadas</h2>
            {topPages.length === 0 ? (
              <p style={{ color: "var(--admin-faint)", fontSize: "0.875rem" }}>Ainda sem dados suficientes neste período.</p>
            ) : (
              topPages.map((p) => (
                <Bar key={p.path} label={p.title} value={p.views} max={maxPageViews} sub={`${p.uniques} únicos`} />
              ))
            )}
          </div>
        </Card>

        <Card>
          <div style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Desempenho dos anúncios</h2>
            {adByKey.size === 0 ? (
              <p style={{ color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum anúncio ativo gerou impressões neste período.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr>
                    {["Espaço", "Impressões", "Cliques", "CTR"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0", color: "var(--admin-muted)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(adByKey.entries()).map(([key, s]) => (
                    <tr key={key} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "0.625rem 0", color: "var(--admin-text)", fontWeight: 600 }}>{key}</td>
                      <td style={{ padding: "0.625rem 0", color: "var(--admin-text-secondary)" }}>{s.impressions.toLocaleString("pt-BR")}</td>
                      <td style={{ padding: "0.625rem 0", color: "var(--admin-text-secondary)" }}>{s.clicks.toLocaleString("pt-BR")}</td>
                      <td style={{ padding: "0.625rem 0", color: "var(--admin-faint)" }}>{s.impressions > 0 ? `${((s.clicks / s.impressions) * 100).toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
