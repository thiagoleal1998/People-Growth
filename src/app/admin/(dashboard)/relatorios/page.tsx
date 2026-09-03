import Link from "next/link";
import { Eye, Users, MousePointerClick, Percent, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/ui";
import { AD_SLOT_DEFS } from "../publicidade/ad-slots";
import type { Article, Ad } from "@/types/database.types";

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

function DailyChart({ days }: { days: { date: string; impressions: number; clicks: number }[] }) {
  const shown = days.slice(-60);
  const max = Math.max(1, ...shown.map((d) => Math.max(d.impressions, d.clicks)));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "160px", overflowX: "auto", paddingBottom: "0.5rem" }}>
        {shown.map((d) => (
          <div
            key={d.date}
            title={`${new Date(d.date).toLocaleDateString("pt-BR")}: ${d.impressions} impressões, ${d.clicks} cliques`}
            style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "140px", flexShrink: 0 }}
          >
            <div style={{ width: "6px", height: `${(d.impressions / max) * 140}px`, backgroundColor: "#4361EE", borderRadius: "2px 2px 0 0" }} />
            <div style={{ width: "6px", height: `${(d.clicks / max) * 140}px`, backgroundColor: "#FFB703", borderRadius: "2px 2px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.75rem", color: "var(--admin-muted)" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#4361EE", borderRadius: 2, marginRight: 4 }} />Impressões</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#FFB703", borderRadius: 2, marginRight: 4 }} />Cliques</span>
      </div>
    </div>
  );
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; ad?: string }>;
}) {
  const { period = "30", from, to, ad: adParam } = await searchParams;
  const usingCustomRange = Boolean(from || to);

  let since: string | null;
  let until: string | null = null;
  if (usingCustomRange) {
    since = from ? new Date(`${from}T00:00:00`).toISOString() : null;
    until = to ? new Date(`${to}T23:59:59`).toISOString() : null;
  } else {
    const days = period === "all" ? null : Number(period) || 30;
    since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  let viewsQuery = client.from("page_views").select("path, page_type, article_id, visitor_id, referrer, utm_source, utm_campaign");
  if (since) viewsQuery = viewsQuery.gte("created_at", since);
  if (until) viewsQuery = viewsQuery.lte("created_at", until);
  let adEventsQuery = client.from("ad_events").select("ad_slot_key, ad_id, event_type");
  if (since) adEventsQuery = adEventsQuery.gte("created_at", since);
  if (until) adEventsQuery = adEventsQuery.lte("created_at", until);

  const [{ data: viewsData }, { data: adEventsData }, { data: articlesData }, { data: adsData }] = await Promise.all([
    viewsQuery,
    adEventsQuery,
    client.from("articles").select("id, title_pt"),
    client.from("ads").select("id, title, slot_key"),
  ]);

  const views = (viewsData ?? []) as {
    path: string;
    page_type: string;
    article_id: string | null;
    visitor_id: string;
    referrer: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
  }[];
  const adEvents = (adEventsData ?? []) as { ad_slot_key: string; ad_id: string | null; event_type: string }[];
  const articleTitles = new Map(((articlesData ?? []) as Pick<Article, "id" | "title_pt">[]).map((a) => [a.id, a.title_pt]));
  const slotLabels = new Map<string, string>(AD_SLOT_DEFS.map((d) => [d.key, d.label]));
  const adsById = new Map<string, Pick<Ad, "id" | "title" | "slot_key">>(
    ((adsData ?? []) as Pick<Ad, "id" | "title" | "slot_key">[]).map((a) => [a.id, a])
  );

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

  function sourceLabel(v: { referrer: string | null; utm_source: string | null; utm_campaign: string | null }): string {
    if (v.utm_source) return v.utm_campaign ? `${v.utm_source} / ${v.utm_campaign}` : v.utm_source;
    if (v.referrer) {
      try {
        return new URL(v.referrer).hostname.replace(/^www\./, "");
      } catch {
        return "Outro";
      }
    }
    return "Direto";
  }

  const bySource = new Map<string, { views: number; visitors: Set<string> }>();
  for (const v of views) {
    const label = sourceLabel(v);
    const entry = bySource.get(label) ?? { views: 0, visitors: new Set<string>() };
    entry.views++;
    entry.visitors.add(v.visitor_id);
    bySource.set(label, entry);
  }
  const topSources = Array.from(bySource.entries())
    .map(([source, v]) => ({ source, views: v.views, uniques: v.visitors.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
  const maxSourceViews = topSources[0]?.views ?? 0;

  const statsByAd = new Map<string, { impressions: number; clicks: number }>();
  for (const e of adEvents) {
    if (!e.ad_id) continue;
    const s = statsByAd.get(e.ad_id) ?? { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") s.impressions++;
    else s.clicks++;
    statsByAd.set(e.ad_id, s);
  }

  let adDetail: { label: string; days: { date: string; impressions: number; clicks: number }[] } | null = null;
  if (adParam) {
    let adDetailQuery = client.from("ad_events").select("event_type, created_at").eq("ad_id", adParam);
    if (since) adDetailQuery = adDetailQuery.gte("created_at", since);
    if (until) adDetailQuery = adDetailQuery.lte("created_at", until);
    const { data: adDetailEvents } = await adDetailQuery;
    const byDay = new Map<string, { impressions: number; clicks: number }>();
    for (const e of (adDetailEvents ?? []) as { event_type: string; created_at: string }[]) {
      const day = e.created_at.slice(0, 10);
      const d = byDay.get(day) ?? { impressions: 0, clicks: 0 };
      if (e.event_type === "impression") d.impressions++;
      else d.clicks++;
      byDay.set(day, d);
    }
    const adInfo = adsById.get(adParam);
    adDetail = {
      label: adInfo ? `${adInfo.title} · ${slotLabels.get(adInfo.slot_key) ?? adInfo.slot_key}` : adParam,
      days: Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  const rangeQuery: Record<string, string> = usingCustomRange ? { ...(from ? { from } : {}), ...(to ? { to } : {}) } : { period };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Métricas reais de audiência do site — visitas anônimas, sem cookies de rastreamento."
      />

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
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
                color: !usingCustomRange && period === p.key ? "white" : "var(--admin-muted)",
                backgroundColor: !usingCustomRange && period === p.key ? "#4361EE" : "transparent",
              }}
            >
              {p.label}
            </Link>
          ))}
        </div>

        <form
          method="get"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.625rem", padding: "0.375rem 0.625rem" }}
        >
          {adParam && <input type="hidden" name="ad" value={adParam} />}
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            style={{ border: "1px solid var(--admin-border-strong)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
          />
          <span style={{ color: "var(--admin-faint)", fontSize: "0.8125rem" }}>até</span>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            style={{ border: "1px solid var(--admin-border-strong)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
          />
          <button
            type="submit"
            style={{ backgroundColor: "#4361EE", color: "white", border: "none", borderRadius: "0.375rem", padding: "0.375rem 0.875rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
          >
            Aplicar
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <StatCard icon={Eye} label="Visualizações de página" value={totalViews.toLocaleString("pt-BR")} color="#4361EE" />
        <StatCard icon={Users} label="Visitantes únicos" value={uniqueVisitors.toLocaleString("pt-BR")} color="#06D6A0" />
        <StatCard icon={MousePointerClick} label="Cliques em anúncios" value={totalClicks.toLocaleString("pt-BR")} color="#FFB703" />
        <StatCard icon={Percent} label="CTR de anúncios" value={`${ctr}%`} color="#4361EE" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
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
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Origem do tráfego</h2>
            {topSources.length === 0 ? (
              <p style={{ color: "var(--admin-faint)", fontSize: "0.875rem" }}>Ainda sem dados suficientes neste período.</p>
            ) : (
              topSources.map((s) => (
                <Bar key={s.source} label={s.source} value={s.views} max={maxSourceViews} sub={`${s.uniques} únicos`} />
              ))
            )}
          </div>
        </Card>

        <Card>
          <div style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.375rem" }}>Desempenho dos anúncios</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginBottom: "1rem" }}>Clique num anúncio para ver o gráfico diário.</p>
            {statsByAd.size === 0 ? (
              <p style={{ color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum anúncio ativo gerou impressões neste período.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr>
                    {["Anúncio", "Espaço", "Impressões", "Cliques", "CTR"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0", color: "var(--admin-muted)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(statsByAd.entries()).map(([id, s]) => {
                    const info = adsById.get(id);
                    return (
                      <tr key={id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                        <td style={{ padding: "0.625rem 0" }}>
                          <Link
                            href={`/admin/relatorios?${new URLSearchParams({ ...rangeQuery, ad: id }).toString()}`}
                            style={{ color: adParam === id ? "#4361EE" : "var(--admin-text)", fontWeight: 700, textDecoration: adParam === id ? "underline" : "none" }}
                          >
                            {info?.title ?? id}
                          </Link>
                        </td>
                        <td style={{ padding: "0.625rem 0", color: "var(--admin-text-secondary)" }}>{info ? (slotLabels.get(info.slot_key) ?? info.slot_key) : "—"}</td>
                        <td style={{ padding: "0.625rem 0", color: "var(--admin-text-secondary)" }}>{s.impressions.toLocaleString("pt-BR")}</td>
                        <td style={{ padding: "0.625rem 0", color: "var(--admin-text-secondary)" }}>{s.clicks.toLocaleString("pt-BR")}</td>
                        <td style={{ padding: "0.625rem 0", color: "var(--admin-faint)" }}>{s.impressions > 0 ? `${((s.clicks / s.impressions) * 100).toFixed(1)}%` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {adDetail && (
        <Card>
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>
                Desempenho diário — {adDetail.label}
              </h2>
              <Link
                href={`/admin/relatorios?${new URLSearchParams(rangeQuery).toString()}`}
                style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--admin-muted)", fontSize: "0.8125rem", textDecoration: "none" }}
              >
                <X size={14} /> Fechar
              </Link>
            </div>
            {adDetail.days.length === 0 ? (
              <p style={{ color: "var(--admin-faint)", fontSize: "0.875rem" }}>Sem eventos registrados neste período.</p>
            ) : (
              <DailyChart days={adDetail.days} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
