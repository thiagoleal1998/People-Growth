// NFL (American football) — scores, schedule, and standings by division, via
// ESPN's public JSON API. Confirmed live: no key, no auth header, no rate
// limit hit across repeated requests, data current and matching a
// cross-check against TheSportsDB independently. It's undocumented/
// unofficial — no known SLA — so every function here degrades to null on
// any failure, same house pattern as sports.ts's API-Football calls, rather
// than ever throwing.
//
// Endpoints (field paths below verified against real responses, not docs):
// - Scoreboard: .../scoreboard — current week by default.
// - Standings: .../standings?season=YYYY&seasontype=2&level=3 — level=3 is
//   required; without it you only get a flat 16-team conference list with
//   no division grouping, confirmed live.

const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
const ESPN_STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings";

// League shield — originally espncdn.com (light/dark variants, matching
// the scoreboard response's own leagues[0].logos), re-hosted on this
// project's own Supabase Storage bucket instead, same reasoning as
// COMPETITIONS.logo in sports.ts: no third-party CDN DNS dependency for a
// handful of static brand images that never change.
const SPORTS_LOGO_BASE = "https://lqgkxpoyymokrratgabe.supabase.co/storage/v1/object/public/site-assets/sports-logos";
export const NFL_LOGO_URL = `${SPORTS_LOGO_BASE}/nfl-light.png`;
export const NFL_LOGO_URL_DARK = `${SPORTS_LOGO_BASE}/nfl-dark.png`;

async function fetchEspn<T>(url: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const SCOREBOARD_CACHE_SECONDS = 600; // 10min — mirrors the football live cache (sports.ts); no known quota here, just politeness
const STANDINGS_CACHE_SECONDS = 10800; // 3h — a division table only changes once games finish

export type NflGameStatus = "scheduled" | "live" | "finished";

export type NflTeam = {
  name: string;
  abbreviation: string;
  logo: string | null;
  score: number;
};

export type NflGame = {
  id: string;
  date: string; // ISO, UTC
  week: number | null;
  status: NflGameStatus;
  // Human-readable from ESPN itself, already in the right shape to show
  // as-is — e.g. "10/12 - 8:15 PM EDT" (scheduled) or "Final" (finished).
  statusDetail: string;
  home: NflTeam;
  away: NflTeam;
};

type RawEspnCompetitor = { homeAway: "home" | "away"; score: string; team: { displayName: string; abbreviation: string; logo?: string } };
type RawEspnEvent = {
  id: string;
  date: string;
  week?: { number: number };
  competitions: { status: { type: { state: string; shortDetail: string } }; competitors: RawEspnCompetitor[] }[];
};
type RawEspnScoreboard = { events?: RawEspnEvent[] };

function parseGame(e: RawEspnEvent): NflGame | null {
  const comp = e.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors.find((c) => c.homeAway === "home");
  const away = comp.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;
  const state = comp.status.type.state; // "pre" | "in" | "post" — confirmed live
  const status: NflGameStatus = state === "in" ? "live" : state === "post" ? "finished" : "scheduled";
  return {
    id: e.id,
    date: e.date,
    week: e.week?.number ?? null,
    status,
    statusDetail: comp.status.type.shortDetail,
    home: { name: home.team.displayName, abbreviation: home.team.abbreviation, logo: home.team.logo ?? null, score: Number(home.score) || 0 },
    away: { name: away.team.displayName, abbreviation: away.team.abbreviation, logo: away.team.logo ?? null, score: Number(away.score) || 0 },
  };
}

export async function getCurrentWeekGames(): Promise<NflGame[] | null> {
  const data = await fetchEspn<RawEspnScoreboard>(ESPN_SCOREBOARD_URL, SCOREBOARD_CACHE_SECONDS);
  if (!data?.events) return null;
  const games = data.events.map(parseGame).filter((g): g is NflGame => g !== null);
  return games.length > 0 ? games : null;
}

export type NflTeamStanding = {
  teamId: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  wins: number;
  losses: number;
  ties: number;
  winPercent: string;
  streak: string;
  pointsFor: number;
  pointsAgainst: number;
};

export type NflDivisionStandings = {
  conference: string; // "AFC" | "NFC"
  division: string; // e.g. "AFC East"
  teams: NflTeamStanding[];
};

type RawEspnStat = { name: string; displayValue: string };
type RawEspnStandingEntry = { team: { id: string; displayName: string; abbreviation: string; logos?: { href: string }[] }; stats: RawEspnStat[] };
type RawEspnDivision = { name: string; standings: { entries: RawEspnStandingEntry[] } };
type RawEspnConference = { abbreviation: string; children?: RawEspnDivision[] };
type RawEspnStandingsResponse = { children?: RawEspnConference[] };

function statValue(stats: RawEspnStat[], name: string): string {
  return stats.find((s) => s.name === name)?.displayValue ?? "0";
}

// Teams within each division arrive already ranked by ESPN's own real
// tiebreaker rules (confirmed live, e.g. AFC East: Bills 3-1, Patriots 3-2,
// Jets 2-3, Dolphins 0-5) — kept in that order rather than re-sorted here,
// since a naive win%-only sort would get tiebreakers wrong where ESPN
// doesn't.
export async function getStandingsByDivision(): Promise<NflDivisionStandings[] | null> {
  const season = new Date().getFullYear();
  const data = await fetchEspn<RawEspnStandingsResponse>(`${ESPN_STANDINGS_URL}?season=${season}&seasontype=2&level=3`, STANDINGS_CACHE_SECONDS);
  if (!data?.children) return null;
  const divisions: NflDivisionStandings[] = [];
  for (const conf of data.children) {
    for (const div of conf.children ?? []) {
      divisions.push({
        conference: conf.abbreviation,
        division: div.name,
        teams: div.standings.entries.map((entry) => ({
          teamId: entry.team.id,
          name: entry.team.displayName,
          abbreviation: entry.team.abbreviation,
          logo: entry.team.logos?.[0]?.href ?? null,
          wins: Number(statValue(entry.stats, "wins")),
          losses: Number(statValue(entry.stats, "losses")),
          ties: Number(statValue(entry.stats, "ties")),
          winPercent: statValue(entry.stats, "winPercent"),
          streak: statValue(entry.stats, "streak"),
          pointsFor: Number(statValue(entry.stats, "pointsFor")),
          pointsAgainst: Number(statValue(entry.stats, "pointsAgainst")),
        })),
      });
    }
  }
  return divisions.length > 0 ? divisions : null;
}
