"use client";

import { useEffect, useRef, useState } from "react";
import { COMPETITIONS, type Fixture, type SportsWidgetTab } from "@/lib/sports";
import { TeamCrest } from "@/components/TeamCrest";

const BRAND = "#315E9C";
const VISIBLE_COUNT = 3;
const ROTATE_MS = 4000;

function statusLabel(fixture: Fixture, locale: string): string {
  if (fixture.status === "live") {
    if (fixture.statusShort === "HT") return locale === "en" ? "Half-time" : "Intervalo";
    return fixture.elapsed ? `${fixture.elapsed}'` : locale === "en" ? "Live" : "Ao vivo";
  }
  if (fixture.status === "finished") return locale === "en" ? "Final" : "Encerrado";
  if (fixture.status === "scheduled") {
    return new Date(fixture.date).toLocaleString(locale === "en" ? "en-US" : "pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return fixture.statusShort;
}

function MatchCard({ fixture, locale }: { fixture: Fixture; locale: string }) {
  const isLive = fixture.status === "live";
  const hasScore = fixture.status === "live" || fixture.status === "finished";
  // No longer links out to a match-detail page — see FixtureRow in
  // /esportes/page.tsx for why (removed, not fixed: no reliable data source
  // for most fixtures, which only ever showed an "indisponível" dead end).
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.875rem 0.75rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: "var(--site-card)",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.3125rem", fontSize: "0.625rem", color: "var(--site-faint)", textAlign: "center", overflow: "hidden", maxWidth: "100%" }}>
        <TeamCrest src={COMPETITIONS[fixture.competition].logo} alt="" size={14} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{COMPETITIONS[fixture.competition].name_pt}</span>
      </div>
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 800,
          color: isLive ? "#DC2626" : "var(--site-muted)",
          backgroundColor: isLive ? "rgba(220,38,38,0.1)" : "var(--site-surface-alt)",
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
        }}
      >
        {statusLabel(fixture, locale)}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem" }}>
        <TeamCrest src={fixture.homeTeamLogo} alt={fixture.homeTeamName} />
        <span style={{ fontWeight: 800, color: BRAND, fontSize: "1.0625rem", minWidth: "2.5rem", textAlign: "center" }}>
          {hasScore ? `${fixture.homeGoals ?? 0}–${fixture.awayGoals ?? 0}` : "×"}
        </span>
        <TeamCrest src={fixture.awayTeamLogo} alt={fixture.awayTeamName} />
      </div>
    </div>
  );
}

const TAB_LABEL: Record<Exclude<SportsWidgetTab, "none">, { pt: string; en: string }> = {
  live: { pt: "Ao vivo", en: "Live" },
  results: { pt: "Resultados da rodada", en: "Round results" },
  upcoming: { pt: "Próximos jogos", en: "Upcoming" },
};

// Seeded from the home page's own server-fetched data, then polls its own
// API route every minute — same skeleton as ElectionResults.tsx,
// LiveStatsWidget.tsx and NotificationBell.tsx. The route itself only ever
// hits the real API while a match window is open, so polling here costs
// nothing extra outside live windows.
//
// Three tabs (Ao vivo only appears once something's actually live) let the
// viewer switch freely instead of the page guessing a single state.
// `defaultTab` (computed server-side, see defaultWidgetTab in sports.ts)
// picks the starting tab; once the viewer clicks one themselves, their
// choice sticks even if a match goes live afterward — "ao vivo" only
// auto-takes over the FIRST time it appears, not every poll. Shows 3 cards
// at a time, auto-rotating through the rest when a tab has more than 3.
export function SportsLiveWidget({
  initial,
  roundResults = [],
  roundUpcoming = [],
  defaultTab,
  locale,
}: {
  initial: Fixture[];
  roundResults?: Fixture[];
  roundUpcoming?: Fixture[];
  defaultTab: SportsWidgetTab;
  locale: string;
}) {
  const [live, setLive] = useState<Fixture[]>(initial);
  const [offset, setOffset] = useState(0);
  const [tab, setTab] = useState<SportsWidgetTab>(defaultTab);
  const manualRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch("/api/sports/placar", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { live: Fixture[] };
        if (cancelled) return;
        setLive(data.live);
        if (!manualRef.current && data.live.length > 0) setTab("live");
      } catch {
        // Keep showing the last known matches if a refresh fails.
      }
    }
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const tabs: { key: Exclude<SportsWidgetTab, "none">; data: Fixture[] }[] = [
    ...(live.length > 0 ? [{ key: "live" as const, data: live }] : []),
    { key: "results" as const, data: roundResults },
    { key: "upcoming" as const, data: roundUpcoming },
  ];
  const activeKey = tabs.some((t) => t.key === tab) ? tab : (tabs[0]?.key ?? "results");
  const shown = tabs.find((t) => t.key === activeKey)?.data ?? [];

  // The header names whichever competition the active tab is actually
  // showing — "Brasileirão" was wrong as soon as a Sul-Americana/Libertadores
  // card could appear here too. Only when every fixture in the tab shares
  // one competition does it get that competition's own name/logo; a mixed
  // tab (the common case now that every tracked competition feeds in) falls
  // back to a generic "Esportes" label instead of naming just one of them.
  const shownCompetitions = [...new Set(shown.map((f) => f.competition))];
  const widgetTitle =
    shownCompetitions.length === 1
      ? { logo: COMPETITIONS[shownCompetitions[0]].logo, name: locale === "en" ? COMPETITIONS[shownCompetitions[0]].name_en : COMPETITIONS[shownCompetitions[0]].name_pt }
      : { logo: null, name: locale === "en" ? "Sports" : "Esportes" };

  // Offset isn't reset when `shown` changes identity (switching tabs, or
  // live starting/ending) — every read of it below is modulo'd against the
  // current array length, so it's always a safe index regardless, just
  // possibly not starting back at the first card, which is a fine tradeoff.
  useEffect(() => {
    if (shown.length <= VISIBLE_COUNT) return;
    const timer = setInterval(() => setOffset((o) => (o + 1) % shown.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [shown.length]);

  const visible = Array.from({ length: Math.min(VISIBLE_COUNT, shown.length) }, (_, i) => shown[(offset + i) % shown.length]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.625rem",
          fontSize: "clamp(1.375rem, 3vw, 1.75rem)",
          fontWeight: 800,
          color: "var(--site-text)",
          marginBottom: "1.25rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--site-border)",
        }}
      >
        {widgetTitle.logo ? <TeamCrest src={widgetTitle.logo} alt="" size={32} /> : <span style={{ fontSize: "1.5rem" }}>🏆</span>}
        {widgetTitle.name}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
        {tabs.map(({ key }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              manualRef.current = true;
              setTab(key);
            }}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "9999px",
              border: `1px solid ${key === activeKey ? BRAND : "var(--site-border-strong)"}`,
              backgroundColor: key === activeKey ? BRAND : "transparent",
              color: key === activeKey ? "white" : "var(--site-text-secondary)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            {locale === "en" ? TAB_LABEL[key].en : TAB_LABEL[key].pt}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div style={{ fontSize: "0.875rem", color: "var(--site-faint)", padding: "1rem 0", textAlign: "center" }}>
          {locale === "en" ? "No matches right now." : "Nenhum jogo no momento."}
        </div>
      ) : (
        <div key={offset} className="sports-carousel-fade" style={{ display: "grid", gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))`, gap: "0.75rem" }}>
          {visible.map((fixture, i) => (
            <MatchCard key={`${fixture.id}-${i}`} fixture={fixture} locale={locale} />
          ))}
        </div>
      )}
      <style>{`
        .sports-carousel-fade { animation: sports-carousel-fade-in 0.4s ease; }
        @keyframes sports-carousel-fade-in {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        @media (max-width: 560px) {
          .sports-carousel-fade { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
