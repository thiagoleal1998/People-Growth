"use client";

import { useEffect, useState } from "react";
import { COMPETITIONS, type Fixture } from "@/lib/sports";

const BRAND = "#4361EE";
const VISIBLE_COUNT = 3;
const ROTATE_MS = 4000;

function statusLabel(fixture: Fixture, locale: string): string {
  if (fixture.status === "live") {
    if (fixture.statusShort === "HT") return locale === "en" ? "Half-time" : "Intervalo";
    return fixture.elapsed ? `${fixture.elapsed}'` : locale === "en" ? "Live" : "Ao vivo";
  }
  if (fixture.status === "finished") return locale === "en" ? "Final" : "Encerrado";
  return fixture.statusShort;
}

function Crest({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div style={{ width: "2.75rem", height: "2.75rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} title={alt} width={44} height={44} style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #4361EE, #06D6A0)" }} title={alt} />
      )}
    </div>
  );
}

function MatchCard({ fixture, locale }: { fixture: Fixture; locale: string }) {
  const isLive = fixture.status === "live";
  const hasScore = fixture.status === "live" || fixture.status === "finished";
  // detailId is set natively for live API-Football fixtures, or resolved
  // for scraped round-results fixtures via attachDetailIds() before this
  // ever renders — null means no reliable match was found, stays unclickable.
  const Wrapper = fixture.detailId !== null ? "a" : "div";
  const wrapperProps = fixture.detailId !== null ? { href: `/esportes/partida/${fixture.detailId}` } : {};
  return (
    <Wrapper
      {...wrapperProps}
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
        textDecoration: "none",
      }}
    >
      <div style={{ fontSize: "0.625rem", color: "var(--site-faint)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
        {COMPETITIONS[fixture.competition].name_pt}
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
        <Crest src={fixture.homeTeamLogo} alt={fixture.homeTeamName} />
        <span style={{ fontWeight: 800, color: BRAND, fontSize: "1.0625rem", minWidth: "2.5rem", textAlign: "center" }}>
          {hasScore ? `${fixture.homeGoals ?? 0}–${fixture.awayGoals ?? 0}` : "×"}
        </span>
        <Crest src={fixture.awayTeamLogo} alt={fixture.awayTeamName} />
      </div>
    </Wrapper>
  );
}

// Seeded from the home page's own server-fetched data, then polls its own
// API route every minute — same skeleton as ElectionResults.tsx,
// LiveStatsWidget.tsx and NotificationBell.tsx. The route itself only ever
// hits the real API while a match window is open, so polling here costs
// nothing extra outside live windows. When nothing is live — most of any
// given day — it falls back to showing the current round's finished results
// instead of just saying there's nothing to see. Shows 3 cards at a time,
// auto-rotating through the rest when there are more than 3.
export function SportsLiveWidget({ initial, roundResults = [], locale }: { initial: Fixture[]; roundResults?: Fixture[]; locale: string }) {
  const [live, setLive] = useState<Fixture[]>(initial);
  const [offset, setOffset] = useState(0);

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

  const showingLive = live.length > 0;
  const shown = showingLive ? live : roundResults;

  // Offset isn't reset when `shown` changes identity (e.g. switching from
  // results to live) — every read of it below is modulo'd against the
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
      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--site-text)", marginBottom: "0.75rem", textAlign: "center" }}>
        {showingLive ? (locale === "en" ? "Live now" : "Ao vivo agora") : locale === "en" ? "Round results" : "Resultados da rodada"}
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
