import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Newspaper, Trophy, CalendarDays, ListOrdered, Users, ChevronRight, Flag, MapPin } from "lucide-react";
import { CheckeredFlagIcon } from "@/components/icons/CheckeredFlagIcon";
import {
  COMPETITIONS,
  COMPETITION_ORDER,
  getBestStandings,
  getClubFixtures,
  getCurrentRoundFixtures,
  getTodayFixtures,
  withReliableCrests,
  type Competition,
  type Fixture,
  type StandingRow,
} from "@/lib/sports";
import { getCurrentWeekGames, getStandingsByDivision as getNflStandingsByDivision, type NflDivisionStandings, type NflGame } from "@/lib/nfl";
import { getTodayGames, getStandingsByDivision as getNbaStandingsByDivision, type NbaDivisionStandings, type NbaGame } from "@/lib/nba";
import { NFL_LOGO_URL } from "@/lib/nfl";
import { NBA_LOGO_URL } from "@/lib/nba";
import {
  getNextRace,
  getDriverStandings,
  getConstructorStandings,
  getLastRaceResult,
  countryCode,
  nationalityCode,
  constructorColor,
  type F1DriverStanding,
  type F1ConstructorStanding,
} from "@/lib/f1";
import { TeamCrest } from "@/components/TeamCrest";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Columnist, Category } from "@/types/database.types";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Esportes — notícias, Brasileirão, NFL, NBA e F1",
  description: "Notícias de esporte, classificação e jogos do Brasileirão Série A e B, Copa do Brasil, Libertadores, Sul-Americana, NFL, NBA e Fórmula 1.",
};

// Portuguese-only, same as /eleicoes — Brazilian competition data for a
// Brazilian audience, no locale branching needed here.
const BRAND = "#315E9C";
const GOLD = "#C89A4A";
const LIVE = "#DC2626";

const cardStyle = {
  borderRadius: "1.25rem",
  border: "1px solid var(--site-border)",
  backgroundColor: "var(--site-card)",
  padding: "1.5rem",
  boxShadow: "0 1px 2px rgba(13,27,42,0.05)",
} as const;

const TABS = [
  { id: "artigos", label: "Artigos", icon: Newspaper },
  { id: "brasileirao", label: "Futebol", icon: Trophy },
  { id: "nfl", label: "NFL" },
  { id: "nba", label: "NBA" },
  { id: "f1", label: "F1" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// Small filled/outline pill, reused for the top-level tab bar and the
// competition / club sub-navs below each tab — one consistent "segmented
// control" language across every level of navigation on this page instead
// of three slightly different ad-hoc pill styles.
function NavPill({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className="sports-pill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "9999px",
        backgroundColor: active ? BRAND : "transparent",
        color: active ? "white" : "var(--site-text-secondary)",
        border: `1px solid ${active ? BRAND : "var(--site-border-strong)"}`,
        fontWeight: 700,
        fontSize: "0.8125rem",
        textDecoration: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
}

function TabNav({ active }: { active: TabId }) {
  return (
    <nav className="sports-tabnav" style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", overflowX: "auto", padding: "0.3125rem" }}>
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`?tab=${t.id}`}
          aria-current={t.id === active ? "page" : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6875rem 1.375rem",
            borderRadius: "9999px",
            backgroundColor: t.id === active ? BRAND : "transparent",
            color: t.id === active ? "white" : "var(--site-text-secondary)",
            fontWeight: 800,
            fontSize: "0.875rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
        >
          {"icon" in t && <t.icon size={16} />}
          {t.id === "nfl" && <TeamCrest src={NFL_LOGO_URL} alt="" size={18} />}
          {t.id === "nba" && <TeamCrest src={NBA_LOGO_URL} alt="" size={18} />}
          {t.id === "f1" && <CheckeredFlagIcon size={16} />}
          {t.label}
        </a>
      ))}
    </nav>
  );
}

function SectionHeader({ icon: Icon, title, extra }: { icon: typeof CalendarDays; title: string; extra?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.125rem" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.125rem",
          height: "2.125rem",
          borderRadius: "0.75rem",
          backgroundColor: `${BRAND}14`,
          color: BRAND,
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </span>
      <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h2>
      {extra}
    </div>
  );
}

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const date = new Date(fixture.date);
  const dateLabel = date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";
  const scoreLabel = isLive || isFinished ? `${fixture.homeGoals ?? 0} – ${fixture.awayGoals ?? 0}` : dateLabel;
  return (
    <div className="fixture-row" style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 0.875rem", borderRadius: "0.75rem" }}>
      <div style={{ width: "4.5rem", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.3125rem", fontSize: "0.75rem", color: isLive ? LIVE : "var(--site-muted)", fontWeight: isLive ? 800 : 600 }}>
        {isLive && <span className="live-dot" />}
        {isLive ? (fixture.elapsed ? `${fixture.elapsed}'` : "Ao vivo") : dateLabel.split(",")[0] ?? dateLabel}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
            {fixture.homeTeamName}
          </span>
          <TeamCrest src={fixture.homeTeamLogo} alt={fixture.homeTeamName} size={22} />
        </div>
        <span
          style={{
            fontWeight: 800,
            color: isLive ? LIVE : isFinished ? "var(--site-text)" : "var(--site-muted)",
            backgroundColor: isLive || isFinished ? "var(--site-surface-alt)" : "transparent",
            borderRadius: "0.5rem",
            padding: isLive || isFinished ? "0.1875rem 0.5rem" : 0,
            fontSize: "0.875rem",
            flexShrink: 0,
            minWidth: "3.5rem",
            textAlign: "center",
          }}
        >
          {scoreLabel}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TeamCrest src={fixture.awayTeamLogo} alt={fixture.awayTeamName} size={22} />
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.awayTeamName}
          </span>
        </div>
      </div>
    </div>
  );
}

function ComingSoonNote({ text }: { text: string }) {
  return (
    <p style={{ fontSize: "0.8125rem", color: "var(--site-faint)", padding: "0.875rem 1.125rem", backgroundColor: "var(--site-surface-alt)", borderRadius: "0.75rem" }}>
      {text}
    </p>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] | null }) {
  if (!standings || standings.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>;
  }
  const legend: { color: string; label: string }[] = [];
  for (const row of standings) {
    if (row.zoneColor && row.description && !legend.some((l) => l.label === row.description)) {
      legend.push({ color: row.zoneColor, label: row.description });
    }
  }
  return (
    <div>
      <div style={{ overflowX: "auto", borderRadius: "0.875rem", border: "1px solid var(--site-border)" }}>
        <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ color: "var(--site-muted)", textAlign: "left", backgroundColor: "var(--site-surface-alt)" }}>
              <th style={{ padding: "0.625rem 0.5rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>#</th>
              <th style={{ padding: "0.625rem 0.5rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Clube</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>J</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>V</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>E</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>D</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>GP</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>GC</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>SG</th>
              <th style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.teamId} style={{ borderLeft: `4px solid ${row.zoneColor ?? "transparent"}` }}>
                <td style={{ padding: "0.625rem 0.5rem", fontWeight: 700, color: "var(--site-text-secondary)" }}>{row.rank}</td>
                <td style={{ padding: "0.625rem 0.5rem", color: "var(--site-text)", fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    {row.teamLogo && (
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "var(--site-surface-alt)", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.teamLogo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />
                      </span>
                    )}
                    <span>{row.teamName}</span>
                  </div>
                </td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.played}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.win}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.draw}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.lose}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsFor}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsAgainst}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", color: "var(--site-muted)" }}>{row.goalsDiff}</td>
                <td style={{ padding: "0.625rem 0.5rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legend.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", marginTop: "0.875rem", fontSize: "0.75rem", color: "var(--site-muted)" }}>
          {legend.map((entry) => (
            <div key={entry.color} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "9999px", backgroundColor: entry.color, flexShrink: 0 }} />
              {entry.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmericanGameCard({ game }: { game: NflGame | NbaGame }) {
  const isLive = game.status === "live";
  const hasScore = game.status !== "scheduled";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.625rem",
        padding: "1rem 0.875rem",
        borderRadius: "1rem",
        border: `1px solid ${isLive ? LIVE : "var(--site-border)"}`,
        backgroundColor: "var(--site-card)",
        boxShadow: isLive ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 2px rgba(13,27,42,0.04)",
        minWidth: 0,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3125rem",
          fontSize: "0.625rem",
          fontWeight: 800,
          color: isLive ? LIVE : "var(--site-muted)",
          backgroundColor: isLive ? "rgba(220,38,38,0.1)" : "var(--site-surface-alt)",
          padding: "0.1875rem 0.5625rem",
          borderRadius: "9999px",
          textAlign: "center",
        }}
      >
        {isLive && <span className="live-dot" />}
        {game.statusDetail}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", flex: 1, minWidth: 0 }}>
          <TeamCrest src={game.away.logo} alt={game.away.name} size={36} />
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--site-text)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {game.away.abbreviation}
          </span>
        </div>
        <span style={{ fontWeight: 800, color: BRAND, fontSize: "1.0625rem", flexShrink: 0 }}>
          {hasScore ? `${game.away.score}–${game.home.score}` : "×"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", flex: 1, minWidth: 0 }}>
          <TeamCrest src={game.home.logo} alt={game.home.name} size={36} />
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--site-text)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {game.home.abbreviation}
          </span>
        </div>
      </div>
    </div>
  );
}

function NflDivisionTable({ division }: { division: NflDivisionStandings }) {
  return (
    // minWidth: 0 — this card is a grid item in a repeat(auto-fit,
    // minmax(280px, 1fr)) track; without it the card refuses to shrink
    // below the table's natural content width (a long club name + 4 stat
    // columns), forcing the card wider than its track and spilling past
    // the rounded border instead of truncating the name.
    <div style={{ ...cardStyle, padding: "1.125rem", minWidth: 0 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
        <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: BRAND, flexShrink: 0 }} />
        {division.division}
      </h3>
      <div style={{ overflowX: "auto" }}>
      <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Clube</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>V</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>D</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>E</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Aprov.</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team) => (
            <tr key={team.teamId}>
              <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-text)", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TeamCrest src={team.logo} alt={team.name} size={18} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
                </div>
              </td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", color: "var(--site-muted)" }}>{team.wins}</td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", color: "var(--site-muted)" }}>{team.losses}</td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", color: "var(--site-muted)" }}>{team.ties}</td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{team.winPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function NbaDivisionTable({ division }: { division: NbaDivisionStandings }) {
  return (
    <div style={{ ...cardStyle, padding: "1.125rem", minWidth: 0 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.75rem" }}>
        <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: BRAND, flexShrink: 0 }} />
        {division.division}
      </h3>
      <div style={{ overflowX: "auto" }}>
      <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Clube</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>V</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>D</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Aprov.</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team) => (
            <tr key={team.teamId}>
              <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-text)", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TeamCrest src={team.logo} alt={team.name} size={18} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
                </div>
              </td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", color: "var(--site-muted)" }}>{team.wins}</td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", color: "var(--site-muted)" }}>{team.losses}</td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{team.winPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function formatF1DateTime(date: string, time: string | null): string {
  const d = new Date(time ? `${date}T${time}` : `${date}T00:00:00Z`);
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) });
}

// Small styled badge with a 2-letter country code — stands in for a flag
// image/emoji (see f1.ts header comment: flag emoji rendering is
// inconsistent across platforms, a styled badge isn't).
function CountryBadge({ code, size = "sm" }: { code: string; size?: "sm" | "lg" }) {
  if (!code) return null;
  const lg = size === "lg";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: lg ? "2.75rem" : "1.625rem",
        height: lg ? "1.875rem" : "1.0625rem",
        padding: lg ? "0 0.5rem" : "0 0.25rem",
        borderRadius: "0.3125rem",
        backgroundColor: `${BRAND}14`,
        color: BRAND,
        fontSize: lg ? "0.8125rem" : "0.625rem",
        fontWeight: 800,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      {code}
    </span>
  );
}

// Small colored dot + name — stands in for a team logo (see f1.ts header
// comment on why real team logos aren't hosted here).
function ConstructorDot({ name }: { name: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4375rem" }}>
      <span style={{ width: "0.5625rem", height: "0.5625rem", borderRadius: "9999px", backgroundColor: constructorColor(name), flexShrink: 0 }} />
      {name}
    </span>
  );
}

function F1DriverStandingsTable({ standings }: { standings: F1DriverStanding[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pos</th>
            <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Piloto</th>
            <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Equipe</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.driverCode}>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{s.position}</td>
              <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-text)", fontWeight: 600, whiteSpace: "nowrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <CountryBadge code={nationalityCode(s.driverNationality)} />
                  {s.driverName}
                </span>
              </td>
              <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-muted)", whiteSpace: "nowrap" }}>
                <ConstructorDot name={s.constructorName} />
              </td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function F1ConstructorStandingsTable({ standings }: { standings: F1ConstructorStanding[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pos</th>
            <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Equipe</th>
            <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.constructorName}>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{s.position}</td>
              <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-text)", fontWeight: 600, whiteSpace: "nowrap" }}>
                <ConstructorDot name={s.constructorName} />
              </td>
              <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Articles tagged "esporte" — same merge-by-primary-or-extra-category logic
// as the generic /conteudo/categoria/[slug] template, just hardcoded to this
// one category since /conteudo/categoria/esporte now redirects here.
async function getSportsArticles() {
  const supabase = await createClient();
  const client = supabase as any;

  const { data: category } = await client.from("categories").select("*").eq("slug", "esporte").maybeSingle();
  if (!category) return { category: null, articles: [], columnistById: new Map(), categoryById: new Map() };

  const [{ data: primaryData }, { data: extraRows }, { data: columnistsData }, { data: allCategoriesData }] = await Promise.all([
    client.from("articles").select("*").eq("category_id", category.id).eq("status", "published").order("published_at", { ascending: false }),
    client.from("article_categories").select("article_id").eq("category_id", category.id),
    client.from("columnists").select("*"),
    client.from("categories").select("*"),
  ]);

  const extraIds = ((extraRows ?? []) as { article_id: string }[]).map((row) => row.article_id);
  const { data: extraData } = extraIds.length > 0 ? await client.from("articles").select("*").in("id", extraIds).eq("status", "published") : { data: [] };

  const byId = new Map<string, Article>();
  for (const article of [...((primaryData ?? []) as Article[]), ...((extraData ?? []) as Article[])]) byId.set(article.id, article);
  const articles = [...byId.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  return {
    category: category as Category,
    articles,
    columnistById: new Map(((columnistsData ?? []) as Columnist[]).map((a: Columnist) => [a.id, a])),
    categoryById: new Map(((allCategoriesData ?? []) as Category[]).map((c: Category) => [c.id, c])),
  };
}

export default async function EsportesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; competicao?: string; clube?: string }>;
}) {
  const { tab: rawTab, competicao: rawCompeticao, clube: rawClube } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "brasileirao";
  const tc = await getTranslations("common");

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a1f3e 100%)", paddingTop: "6rem", paddingBottom: "3rem", color: "white" }}>
        <div className="container-xl" style={{ maxWidth: "1000px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Início
          </Link>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", backgroundColor: `${GOLD}26`, color: GOLD }}>
              <Trophy size={15} />
            </span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD }}>Ao vivo e atualizado</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "0.875rem" }}>Esportes</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: "540px" }}>
            Notícias, Brasileirão, NFL, NBA e F1 — classificação e jogos atualizados em tempo real.
          </p>
        </div>
      </section>

      <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-surface-alt)", minHeight: "60vh" }}>
        <div className="container-xl" style={{ maxWidth: "1000px" }}>
          <TabNav active={tab} />

          {tab === "artigos" && (
            <ArticlesTab />
          )}

          {tab === "brasileirao" && (
            <BrasileiraoTab rawCompeticao={rawCompeticao} rawClube={rawClube} />
          )}

          {tab === "nfl" && <NflTab />}

          {tab === "nba" && <NbaTab />}

          {tab === "f1" && <F1Tab />}
        </div>
      </section>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
        .sports-tabnav { background-color: var(--site-surface); border-radius: 9999px; border: 1px solid var(--site-border); width: fit-content; max-width: 100%; }
        .fixture-row:nth-child(even) { background-color: var(--site-surface-alt); }
        .standings-table tbody tr:nth-child(even) { background-color: var(--site-surface-alt); }
        .live-dot {
          display: inline-block;
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 9999px;
          background-color: ${LIVE};
          animation: sports-live-pulse 1.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sports-live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.75); }
        }
      `}</style>
    </>
  );

  async function ArticlesTab() {
    const { category, articles, columnistById, categoryById } = await getSportsArticles();
    return (
      <div>
        <header style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem", backgroundColor: `${BRAND}14`, color: BRAND, flexShrink: 0 }}>
            <Newspaper size={22} />
          </span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>Notícias de esporte</h1>
        </header>
        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--site-faint)" }}>Nenhum artigo publicado em esporte ainda.</div>
        ) : (
          <div className="sports-articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
            {articles.map((article) => (
              <Link
                key={article.id}
                href={articleHref(article, article.category_id ? categoryById.get(article.category_id)?.slug : null)}
                style={{ display: "block", textDecoration: "none", height: "100%" }}
                className="hover-card"
              >
                <article style={{ backgroundColor: "var(--site-card)", borderRadius: "1.25rem", border: "1px solid var(--site-border)", boxShadow: "0 1px 2px rgba(13,27,42,0.05)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      aspectRatio: "16 / 10",
                      background: article.cover_image ? `url("${article.cover_image}") center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                    }}
                  />
                  <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <FormatTag format={article.format} locale="pt" />
                      {category?.is_people_growth && <PeopleGrowthBadge />}
                      {category?.is_ponto_de_replica && <PontoDeReplicaBadge />}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>
                      {pickLocale("pt", article.title_pt, article.title_en)}
                    </h3>
                    {article.excerpt_pt && (
                      <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", lineHeight: 1.6, marginBottom: "0.625rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {pickLocale("pt", article.excerpt_pt, article.excerpt_en)}
                      </p>
                    )}
                    {(article.columnist_id || article.published_at) && (
                      <span style={{ fontSize: "0.8125rem", color: "var(--site-faint)", marginTop: "auto" }}>
                        {article.columnist_id && columnistById.get(article.columnist_id) && <>{tc("by")} {columnistById.get(article.columnist_id)!.name} · </>}
                        {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        <style>{`
          @media (max-width: 640px) {
            .sports-articles-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    );
  }

  async function BrasileiraoTab({ rawCompeticao, rawClube }: { rawCompeticao?: string; rawClube?: string }) {
    const competition: Competition = COMPETITION_ORDER.includes(rawCompeticao as Competition) ? (rawCompeticao as Competition) : "serie_a";
    const info = COMPETITIONS[competition];

    const [allToday, standings, roundFixtures] = await Promise.all([
      getTodayFixtures(),
      info.format === "table" ? getBestStandings(competition) : Promise.resolve(null),
      getCurrentRoundFixtures(competition),
    ]);
    const todayFixtures = withReliableCrests((allToday ?? []).filter((f) => f.competition === competition), standings);
    const clube = standings?.some((row) => row.teamName === rawClube) ? (rawClube as string) : null;
    const clubFixtures = clube ? await getClubFixtures(competition, clube) : null;

    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <TeamCrest src={info.logo} alt="" size={44} />
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>{info.name_pt}</h1>
        </header>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {COMPETITION_ORDER.map((option) => (
            <NavPill key={option} href={`?tab=brasileirao&competicao=${option}`} active={option === competition}>
              <TeamCrest src={COMPETITIONS[option].logo} alt="" size={18} />
              {COMPETITIONS[option].name_pt}
            </NavPill>
          ))}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {todayFixtures.length > 0 && (
            <div className="fixture-list" style={cardStyle}>
              <SectionHeader icon={CalendarDays} title="Jogos de hoje" />
              <div>
                {todayFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          )}

          {info.format === "table" && (
            <div style={cardStyle}>
              <SectionHeader icon={ListOrdered} title="Classificação" />
              <StandingsTable standings={standings} />
            </div>
          )}

          <div className="fixture-list" style={cardStyle}>
            <SectionHeader icon={CalendarDays} title="Jogos da rodada" />
            {roundFixtures && roundFixtures.length > 0 ? (
              <div>
                {roundFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
            )}
          </div>

          <div className="fixture-list" style={cardStyle}>
            <SectionHeader icon={Users} title="Jogos por clube" />
            {info.format === "table" && standings && standings.length > 0 ? (
              <>
                <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1.125rem" }}>
                  {standings.map((row) => (
                    <NavPill key={row.teamId} href={`?tab=brasileirao&competicao=${competition}&clube=${encodeURIComponent(row.teamName)}`} active={row.teamName === clube}>
                      {row.teamLogo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.teamLogo} alt="" width={16} height={16} style={{ objectFit: "contain", flexShrink: 0 }} />
                      )}
                      {row.teamName}
                    </NavPill>
                  ))}
                </nav>
                {clube ? (
                  clubFixtures && clubFixtures.length > 0 ? (
                    <div>
                      {clubFixtures.map((fixture) => (
                        <FixtureRow key={fixture.id} fixture={fixture} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
                  )
                ) : (
                  <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Escolha um clube para ver o calendário completo.</p>
                )}
              </>
            ) : (
              <ComingSoonNote text="Disponível para o Brasileirão Série A e Série B." />
            )}
          </div>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>
          Fontes: API-Football (ao vivo e hoje) e api-futebol.com.br (classificação completa e jogos da rodada).
        </p>
      </>
    );
  }

  async function NflTab() {
    const [games, standings] = await Promise.all([getCurrentWeekGames(), getNflStandingsByDivision()]);
    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <TeamCrest src={NFL_LOGO_URL} alt="" size={44} />
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>NFL</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <SectionHeader icon={CalendarDays} title={`Jogos da semana${games && games[0]?.week ? ` (semana ${games[0].week})` : ""}`} />
            {games && games.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                {games.map((game) => (
                  <AmericanGameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Jogos indisponíveis no momento.</p>
            )}
          </div>
          <div style={cardStyle}>
            <SectionHeader icon={ListOrdered} title="Classificação por divisão" />
            {standings && standings.length > 0 ? (
              <>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.625rem" }}>AFC</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings.filter((d) => d.conference === "AFC").map((division) => (
                    <NflDivisionTable key={division.division} division={division} />
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.625rem" }}>NFC</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings.filter((d) => d.conference === "NFC").map((division) => (
                    <NflDivisionTable key={division.division} division={division} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
            )}
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: ESPN.</p>
      </>
    );
  }

  async function NbaTab() {
    const [games, standings] = await Promise.all([getTodayGames(), getNbaStandingsByDivision()]);
    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <TeamCrest src={NBA_LOGO_URL} alt="" size={44} />
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>NBA</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <SectionHeader icon={CalendarDays} title="Jogos de hoje" />
            {games && games.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                {games.map((game) => (
                  <AmericanGameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Nenhum jogo hoje.</p>
            )}
          </div>
          <div style={cardStyle}>
            <SectionHeader icon={ListOrdered} title="Classificação por divisão" />
            {standings && standings.length > 0 ? (
              <>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.625rem" }}>Leste</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings.filter((d) => d.conference === "East").map((division) => (
                    <NbaDivisionTable key={division.division} division={division} />
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.625rem" }}>Oeste</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {standings.filter((d) => d.conference === "West").map((division) => (
                    <NbaDivisionTable key={division.division} division={division} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
            )}
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: ESPN.</p>
      </>
    );
  }

  async function F1Tab() {
    const [nextRace, lastResult, driverStandings, constructorStandings] = await Promise.all([
      getNextRace(),
      getLastRaceResult(),
      getDriverStandings(),
      getConstructorStandings(),
    ]);
    return (
      <>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem", backgroundColor: `${BRAND}14`, flexShrink: 0 }}>
            <CheckeredFlagIcon size={24} />
          </span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>Fórmula 1</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <SectionHeader icon={CalendarDays} title="Próxima corrida" />
            {nextRace ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CountryBadge code={countryCode(nextRace.country)} size="lg" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--site-text)" }}>{nextRace.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--site-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      <MapPin size={14} />
                      {nextRace.circuitName}
                      {nextRace.locality ? ` · ${nextRace.locality}, ${nextRace.country}` : nextRace.country ? ` · ${nextRace.country}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: BRAND, fontSize: "0.9375rem", whiteSpace: "nowrap" }}>{formatF1DateTime(nextRace.date, nextRace.time)}</div>
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Nenhuma corrida agendada no momento.</p>
            )}
          </div>

          <div style={cardStyle}>
            <SectionHeader
              icon={Flag}
              title={lastResult ? `Resultado — ${lastResult.name}` : "Último resultado"}
              extra={lastResult ? <CountryBadge code={countryCode(lastResult.country)} /> : undefined}
            />
            {lastResult && lastResult.results.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="standings-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ color: "var(--site-muted)", textAlign: "left" }}>
                      <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pos</th>
                      <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Piloto</th>
                      <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Equipe</th>
                      <th style={{ padding: "0.375rem 0.375rem", fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 800 }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastResult.results.slice(0, 10).map((r) => (
                      <tr key={r.position}>
                        <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{r.position}</td>
                        <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-text)", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                            <CountryBadge code={nationalityCode(r.driverNationality)} />
                            {r.driverName}
                          </span>
                        </td>
                        <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-muted)", whiteSpace: "nowrap" }}>
                          <ConstructorDot name={r.constructorName} />
                        </td>
                        <td style={{ padding: "0.375rem 0.375rem", color: "var(--site-faint)", whiteSpace: "nowrap" }}>{r.status}</td>
                        <td style={{ padding: "0.375rem 0.375rem", textAlign: "center", fontWeight: 800, color: BRAND }}>{r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Resultado indisponível no momento.</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div style={{ ...cardStyle, padding: "1.125rem", minWidth: 0 }}>
              <SectionHeader icon={ListOrdered} title="Pilotos" />
              {driverStandings && driverStandings.length > 0 ? (
                <F1DriverStandingsTable standings={driverStandings} />
              ) : (
                <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
              )}
            </div>
            <div style={{ ...cardStyle, padding: "1.125rem", minWidth: 0 }}>
              <SectionHeader icon={Users} title="Construtores" />
              {constructorStandings && constructorStandings.length > 0 ? (
                <F1ConstructorStandingsTable standings={constructorStandings} />
              ) : (
                <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Classificação indisponível no momento.</p>
              )}
            </div>
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>Fonte: Jolpica F1 (dados públicos, sucessor do Ergast).</p>
      </>
    );
  }
}
