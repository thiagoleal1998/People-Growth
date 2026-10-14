// NBA (basketball) — scores, schedule, and standings by division, via ESPN's
// public JSON API. Same source and same house pattern as nfl.ts (confirmed
// live: no key, no auth header, no rate limit hit) — every function here
// degrades to null on any failure rather than ever throwing.
//
// Endpoints (field paths below verified against real responses, not docs):
// - Scoreboard: .../scoreboard — today's games by default (unlike NFL,
//   there's no "week" grouping; games are just grouped by date).
// - Standings: .../standings?season=YYYY&seasontype=2&level=3 — same
//   level=3 requirement as NFL for division grouping (Atlantic/Central/
//   Southeast under the Eastern Conference, Northwest/Pacific/Southwest
//   under the Western), confirmed live — without it you only get a flat
//   15-team conference list.

const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const ESPN_STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";

// League logo — same re-hosting reasoning as NFL_LOGO_URL in nfl.ts: no
// third-party CDN DNS dependency for a static brand image that never changes.
const SPORTS_LOGO_BASE = "https://lqgkxpoyymokrratgabe.supabase.co/storage/v1/object/public/site-assets/sports-logos";
export const NBA_LOGO_URL = `${SPORTS_LOGO_BASE}/nba-light.png`;
export const NBA_LOGO_URL_DARK = `${SPORTS_LOGO_BASE}/nba-dark.png`;

async function fetchEspn<T>(url: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const SCOREBOARD_CACHE_SECONDS = 600; // 10min — mirrors nfl.ts; no known quota here, just politeness
const STANDINGS_CACHE_SECONDS = 10800; // 3h — a division table only changes once games finish

export type NbaGameStatus = "scheduled" | "live" | "finished";

export type NbaTeam = {
  name: string;
  abbreviation: string;
  logo: string | null;
  score: number;
};

export type NbaGame = {
  id: string;
  date: string; // ISO, UTC
  status: NbaGameStatus;
  // Human-readable from ESPN itself, already in the right shape to show
  // as-is — e.g. "10/13 - 8:00 PM EDT" (scheduled) or "Final" (finished).
  statusDetail: string;
  home: NbaTeam;
  away: NbaTeam;
};

type RawEspnCompetitor = { homeAway: "home" | "away"; score: string; team: { displayName: string; abbreviation: string; logo?: string } };
type RawEspnEvent = {
  id: string;
  date: string;
  competitions: { status: { type: { state: string; shortDetail: string } }; competitors: RawEspnCompetitor[] }[];
};
type RawEspnScoreboard = { events?: RawEspnEvent[] };

function parseGame(e: RawEspnEvent): NbaGame | null {
  const comp = e.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors.find((c) => c.homeAway === "home");
  const away = comp.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;
  const state = comp.status.type.state; // "pre" | "in" | "post" — confirmed live
  const status: NbaGameStatus = state === "in" ? "live" : state === "post" ? "finished" : "scheduled";
  return {
    id: e.id,
    date: e.date,
    status,
    statusDetail: comp.status.type.shortDetail,
    home: { name: home.team.displayName, abbreviation: home.team.abbreviation, logo: home.team.logo ?? null, score: Number(home.score) || 0 },
    away: { name: away.team.displayName, abbreviation: away.team.abbreviation, logo: away.team.logo ?? null, score: Number(away.score) || 0 },
  };
}

export async function getTodayGames(): Promise<NbaGame[] | null> {
  const data = await fetchEspn<RawEspnScoreboard>(ESPN_SCOREBOARD_URL, SCOREBOARD_CACHE_SECONDS);
  if (!data?.events) return null;
  const games = data.events.map(parseGame).filter((g): g is NbaGame => g !== null);
  return games.length > 0 ? games : null;
}

export type NbaTeamStanding = {
  teamId: string;
  name: string;
  abbreviation: string;
  logo: string | null;
  wins: number;
  losses: number;
  winPercent: string;
  streak: string;
  pointsFor: number;
  pointsAgainst: number;
};

export type NbaDivisionStandings = {
  conference: string; // "East" | "West"
  division: string; // e.g. "Atlantic"
  teams: NbaTeamStanding[];
};

type RawEspnStat = { name: string; displayValue: string };
type RawEspnStandingEntry = { team: { id: string; displayName: string; abbreviation: string; logos?: { href: string }[] }; stats: RawEspnStat[] };
type RawEspnDivision = { name: string; standings: { entries: RawEspnStandingEntry[] } };
type RawEspnConference = { abbreviation: string; children?: RawEspnDivision[] };
type RawEspnStandingsResponse = { children?: RawEspnConference[] };

function statValue(stats: RawEspnStat[], name: string): string {
  return stats.find((s) => s.name === name)?.displayValue ?? "0";
}

// Unlike NFL (labeled by the year its season STARTS in, which is also just
// the current calendar year for most of that season), ESPN labels an NBA
// season by the year it ENDS in — confirmed live in October: season=<this
// year> returned the just-finished PRIOR season's complete 82-game final
// standings (wins+losses summing to 82), not the just-starting new one;
// season=<this year + 1> correctly returned every team 0-0. The season runs
// October-June, so July on, "this year" really means the season ending next
// calendar year.
function nbaSeasonYear(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear(); // getMonth() is 0-indexed; 6 = July
}

// Teams within each division arrive already ranked by ESPN's own real
// tiebreaker rules (same as NFL's getStandingsByDivision) — kept in that
// order rather than re-sorted here.
export async function getStandingsByDivision(): Promise<NbaDivisionStandings[] | null> {
  const data = await fetchEspn<RawEspnStandingsResponse>(`${ESPN_STANDINGS_URL}?season=${nbaSeasonYear()}&seasontype=2&level=3`, STANDINGS_CACHE_SECONDS);
  if (!data?.children) return null;
  const divisions: NbaDivisionStandings[] = [];
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
