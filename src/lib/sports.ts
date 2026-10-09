// Football scores/standings from API-Football (api-sports.io), used either
// directly (API_FOOTBALL_HOST unset) or through the RapidAPI gateway
// (API_FOOTBALL_HOST set to e.g. "api-football-v1.p.rapidapi.com") — both
// auth header styles are sent together since only one is ever checked by
// whichever host actually receives the request. The free plan is 100
// requests/day, so every call here goes through Next's Data Cache with a
// deliberately generous `revalidate`; see the "live" functions below for how
// that budget is protected.
//
// NOTE: the league ids in COMPETITIONS and the parsers in this file follow
// API-Football's documented v3 response shape, but have not been exercised
// against a live response yet (no API key was available while writing this).
// Once API_FOOTBALL_KEY is set, confirm the ids with a one-off call to
// `/leagues?search=brasil` and adjust COMPETITIONS if any are off, and
// sanity-check the parsers against a real `/standings` and `/fixtures`
// response.

const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
const API_BASE = `https://${API_FOOTBALL_HOST}`;

export type Competition = "serie_a" | "serie_b" | "copa_do_brasil" | "libertadores";

export const COMPETITIONS: Record<Competition, { apiLeagueId: number; name_pt: string; name_en: string; format: "table" | "list" }> = {
  serie_a: { apiLeagueId: 71, name_pt: "Brasileirão Série A", name_en: "Brasileirão Série A", format: "table" },
  serie_b: { apiLeagueId: 72, name_pt: "Brasileirão Série B", name_en: "Brasileirão Série B", format: "table" },
  copa_do_brasil: { apiLeagueId: 73, name_pt: "Copa do Brasil", name_en: "Copa do Brasil", format: "list" },
  libertadores: { apiLeagueId: 13, name_pt: "Libertadores", name_en: "Copa Libertadores", format: "list" },
};

export const COMPETITION_ORDER: Competition[] = ["serie_a", "serie_b", "copa_do_brasil", "libertadores"];

export type StandingRow = {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  form: string | null;
  description: string | null;
};

export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed" | "other";

export type Fixture = {
  id: number;
  date: string;
  round: string | null;
  status: FixtureStatus;
  statusShort: string;
  elapsed: number | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  competition: Competition;
};

export type Team = {
  id: number;
  name: string;
  logo: string | null;
};

// Cache durations (seconds) — see the plan's call-budget table for the
// reasoning. Easy to retune later without touching any call site.
const STANDINGS_CACHE_SECONDS = 10800; // 3h — a table only changes after full-time
const SCHEDULE_CACHE_SECONDS = 10800; // 3h — also doubles as the "is anything live" gate, see isAnyCompetitionLiveNow
const LIVE_CACHE_SECONDS = 180; // 3min — only ever actually fetched while the gate is open
const TEAMS_CACHE_SECONDS = 86400; // 24h — a season's club list barely changes
const TEAM_FIXTURES_CACHE_SECONDS = 10800; // 3h

// Brazilian competitions run within a calendar year, so the season param is
// just the current year — unlike August-to-May European leagues.
function currentSeason(): number {
  return new Date().getFullYear();
}

type RawStandingRow = {
  rank: number;
  team: { id: number; name: string; logo?: string };
  points: number;
  goalsDiff: number;
  form?: string | null;
  description?: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
};
type RawStandingsResponse = { response?: { league?: { standings?: RawStandingRow[][] } }[] };

type RawFixture = {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { id: number; round?: string };
  teams: { home: { id: number; name: string; logo?: string }; away: { id: number; name: string; logo?: string } };
  goals: { home: number | null; away: number | null };
};
type RawFixturesResponse = { response?: RawFixture[] };

type RawTeamsResponse = { response?: { team: { id: number; name: string; logo?: string } }[] };

async function fetchFootballApi<T>(path: string, params: Record<string, string | number>, revalidateSeconds: number): Promise<T | null> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])));
  try {
    const res = await fetch(`${API_BASE}${path}?${query.toString()}`, {
      headers: {
        "x-apisports-key": apiKey,
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": API_FOOTBALL_HOST,
      },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const LIVE_CODES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"]);
const FINISHED_CODES = new Set(["FT", "AET", "PEN"]);
const POSTPONED_CODES = new Set(["PST", "CANC", "ABD", "WO"]);

function mapStatus(short: string): FixtureStatus {
  if (LIVE_CODES.has(short)) return "live";
  if (FINISHED_CODES.has(short)) return "finished";
  if (POSTPONED_CODES.has(short)) return "postponed";
  if (short === "NS" || short === "TBD") return "scheduled";
  return "other";
}

function parseStandings(data: RawStandingsResponse | null): StandingRow[] | null {
  const rows = data?.response?.[0]?.league?.standings?.[0];
  if (!rows) return null;
  return rows.map((r) => ({
    rank: r.rank,
    teamId: r.team.id,
    teamName: r.team.name,
    teamLogo: r.team.logo ?? null,
    points: r.points,
    played: r.all.played,
    win: r.all.win,
    draw: r.all.draw,
    lose: r.all.lose,
    goalsFor: r.all.goals.for,
    goalsAgainst: r.all.goals.against,
    goalsDiff: r.goalsDiff,
    form: r.form ?? null,
    description: r.description ?? null,
  }));
}

function parseFixture(f: RawFixture, competition: Competition): Fixture {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    round: f.league.round ?? null,
    status: mapStatus(f.fixture.status.short),
    statusShort: f.fixture.status.short,
    elapsed: f.fixture.status.elapsed,
    homeTeamId: f.teams.home.id,
    homeTeamName: f.teams.home.name,
    homeTeamLogo: f.teams.home.logo ?? null,
    awayTeamId: f.teams.away.id,
    awayTeamName: f.teams.away.name,
    awayTeamLogo: f.teams.away.logo ?? null,
    homeGoals: f.goals.home,
    awayGoals: f.goals.away,
    competition,
  };
}

export async function getStandings(competition: Competition): Promise<StandingRow[] | null> {
  const { apiLeagueId } = COMPETITIONS[competition];
  const data = await fetchFootballApi<RawStandingsResponse>("/standings", { league: apiLeagueId, season: currentSeason() }, STANDINGS_CACHE_SECONDS);
  return parseStandings(data);
}

// Also the source of the "is anything live right now" gate (see
// isAnyCompetitionLiveNow) — callers asking for "upcoming"/"recent" games and
// the gate both read from this same 3h-cached call, so the gate never costs
// an extra request of its own.
export async function getCompetitionFixtures(competition: Competition, opts: { date?: string; next?: number; last?: number } = {}): Promise<Fixture[] | null> {
  const { apiLeagueId } = COMPETITIONS[competition];
  const params: Record<string, string | number> = { league: apiLeagueId, season: currentSeason() };
  if (opts.date) params.date = opts.date;
  if (opts.next) params.next = opts.next;
  if (opts.last) params.last = opts.last;
  const data = await fetchFootballApi<RawFixturesResponse>("/fixtures", params, SCHEDULE_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((f) => parseFixture(f, competition));
}

// A single call covers live matches across every competition at once — the
// caller (the /api/sports/placar route) only ever calls this while
// isAnyCompetitionLiveNow() says there's an actual match window open, which
// is what keeps this endpoint's 3-minute revalidate inside the daily budget.
export async function getLiveFixtures(): Promise<Fixture[] | null> {
  const data = await fetchFootballApi<RawFixturesResponse>("/fixtures", { live: "all" }, LIVE_CACHE_SECONDS);
  if (!data?.response) return null;
  const competitionByLeagueId = new Map(COMPETITION_ORDER.map((key) => [COMPETITIONS[key].apiLeagueId, key]));
  return data.response
    .filter((f) => competitionByLeagueId.has(f.league.id))
    .map((f) => parseFixture(f, competitionByLeagueId.get(f.league.id)!));
}

export async function getCompetitionTeams(competition: Competition): Promise<Team[] | null> {
  const { apiLeagueId } = COMPETITIONS[competition];
  const data = await fetchFootballApi<RawTeamsResponse>("/teams", { league: apiLeagueId, season: currentSeason() }, TEAMS_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((t) => ({ id: t.team.id, name: t.team.name, logo: t.team.logo ?? null }));
}

export async function getTeamFixtures(teamId: number): Promise<Fixture[] | null> {
  const data = await fetchFootballApi<RawFixturesResponse>("/fixtures", { team: teamId, season: currentSeason() }, TEAM_FIXTURES_CACHE_SECONDS);
  if (!data?.response) return null;
  const competitionByLeagueId = new Map(COMPETITION_ORDER.map((key) => [COMPETITIONS[key].apiLeagueId, key]));
  return data.response
    .filter((f) => competitionByLeagueId.has(f.league.id))
    .map((f) => parseFixture(f, competitionByLeagueId.get(f.league.id)!));
}

// A match window is estimated as kickoff to kickoff+150min (90 regulation
// minutes + stoppage + halftime, with margin) — generous on purpose, since
// under-estimating would stop live polling before a match with heavy
// stoppage time actually ends.
const LIVE_WINDOW_MS = 150 * 60 * 1000;

export async function isAnyCompetitionLiveNow(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const results = await Promise.all(COMPETITION_ORDER.map((competition) => getCompetitionFixtures(competition, { date: today })));
  const now = Date.now();
  return results.some((fixtures) =>
    (fixtures ?? []).some((f) => {
      const kickoff = new Date(f.date).getTime();
      return now >= kickoff && now <= kickoff + LIVE_WINDOW_MS;
    })
  );
}
