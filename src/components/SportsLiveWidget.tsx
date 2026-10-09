"use client";

import { useEffect, useState } from "react";
import { COMPETITIONS, type Fixture } from "@/lib/sports";

const BRAND = "#4361EE";

function statusLabel(fixture: Fixture, locale: string): string {
  if (fixture.status !== "live") return fixture.statusShort;
  if (fixture.statusShort === "HT") return locale === "en" ? "Half-time" : "Intervalo";
  return fixture.elapsed ? `${fixture.elapsed}'` : (locale === "en" ? "Live" : "Ao vivo");
}

function MatchRow({ fixture, locale }: { fixture: Fixture; locale: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.625rem 0.75rem",
        borderRadius: "0.625rem",
        border: "1px solid var(--site-border-strong)",
        backgroundColor: "var(--site-card)",
      }}
    >
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 800,
          color: "#DC2626",
          backgroundColor: "rgba(220,38,38,0.1)",
          padding: "0.1875rem 0.5rem",
          borderRadius: "9999px",
          flexShrink: 0,
        }}
      >
        {statusLabel(fixture, locale)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", marginBottom: "0.1875rem" }}>{COMPETITIONS[fixture.competition].name_pt}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--site-text)" }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fixture.homeTeamName}</span>
          <span style={{ fontWeight: 800, color: BRAND, flexShrink: 0 }}>
            {fixture.homeGoals ?? 0} – {fixture.awayGoals ?? 0}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{fixture.awayTeamName}</span>
        </div>
      </div>
    </div>
  );
}

// Seeded from the home page's own server-fetched data, then polls its own
// API route every minute — same skeleton as ElectionResults.tsx,
// LiveStatsWidget.tsx and NotificationBell.tsx. The route itself only ever
// hits the real API while a match window is open, so polling here costs
// nothing extra outside live windows.
export function SportsLiveWidget({ initial, locale }: { initial: Fixture[]; locale: string }) {
  const [live, setLive] = useState<Fixture[]>(initial);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch("/api/sports/placar", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { live: Fixture[] };
        if (!cancelled) setLive(data.live);
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

  if (live.length === 0) {
    return (
      <div style={{ fontSize: "0.875rem", color: "var(--site-faint)", padding: "1rem 0" }}>
        {locale === "en" ? "No live matches right now." : "Nenhum jogo ao vivo agora."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {live.map((fixture) => (
        <MatchRow key={fixture.id} fixture={fixture} locale={locale} />
      ))}
    </div>
  );
}
