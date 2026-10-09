// Football scores/standings, combining two free sources — confirmed against
// both live APIs with real calls, not assumed from docs:
//
// 1) API-Football (api-sports.io), used either directly (API_FOOTBALL_HOST
//    unset) or through the RapidAPI gateway (API_FOOTBALL_HOST set to e.g.
//    "api-football-v1.p.rapidapi.com") — both auth header styles are sent
//    together since only one is ever checked by whichever host actually
//    receives the request. The free plan is 100 requests/day AND, confirmed
//    against the live API, rejects every endpoint that takes a `season`
//    param for the CURRENT (2026) season — `/standings`,
//    `/fixtures?league=&season=`, `/teams?league=&season=`,
//    `/fixtures?team=&season=` all return `{"errors":{"plan":"Free plans do
//    not have access to this season, try from 2022 to 2024."}}`. Only two
//    endpoints work on the free plan without a season at all:
//    `/fixtures?live=all` and `/fixtures?date=YYYY-MM-DD` (no league/team
//    param — filtered by league id client-side). getStandings/
//    getCompetitionFixtures(next/last)/getCompetitionTeams/getTeamFixtures
//    below are season-scoped and return null on the free plan — kept here,
//    typed and ready, for whenever this is upgraded to a paid plan; nothing
//    calls them right now.
//
// 2) TheSportsDB (thesportsdb.com), used ONLY for what API-Football's free
//    plan can't do: standings and recent results for the current season.
//    Confirmed against the live API with the public shared key: works for
//    the current season (no season-block like API-Football), but every
//    list-style endpoint is capped at a handful of rows on this key — a
//    league table comes back top-5 only, "past/next events" come back as a
//    single match. That's a real, disclosed limitation (see
//    getStandingsTop5/getLastResult below), not a bug — there's no known
//    free source for a full 20-team table or a multi-day fixture list for
//    Brazilian competitions. A paid TheSportsDB Patreon key (thesportsdb.com,
//    from ~US$9/mo) would lift this cap if ever needed.
//
// Competition ids were confirmed against real API responses, not guessed —
// API-Football via `/leagues?country=Brazil` / `/leagues?search=libertadores`
// (71/72/73/13); TheSportsDB via team records' strLeague2/3 fields (e.g.
// Flamengo's own record lists its competitions directly) since TheSportsDB's
// own league-search endpoints are capped the same way (4351/4404/4725/4501).

const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
const API_BASE = `https://${API_FOOTBALL_HOST}`;

// "3" is TheSportsDB's own public test key, meant for exactly this kind of
// low-volume free use — THESPORTSDB_KEY overrides it with a real registered
// key (still free to create, just not capped the same way as the public one
// for some endpoints) or a paid Patreon key, if either is ever added.
const THESPORTSDB_KEY = process.env.THESPORTSDB_KEY || "3";
const THESPORTSDB_BASE = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}`;

export type Competition = "serie_a" | "serie_b" | "copa_do_brasil" | "libertadores";

export const COMPETITIONS: Record<Competition, { apiLeagueId: number; name_pt: string; name_en: string; format: "table" | "list" }> = {
  serie_a: { apiLeagueId: 71, name_pt: "Brasileirão Série A", name_en: "Brasileirão Série A", format: "table" },
  serie_b: { apiLeagueId: 72, name_pt: "Brasileirão Série B", name_en: "Brasileirão Série B", format: "table" },
  copa_do_brasil: { apiLeagueId: 73, name_pt: "Copa do Brasil", name_en: "Copa do Brasil", format: "list" },
  libertadores: { apiLeagueId: 13, name_pt: "Libertadores", name_en: "Copa Libertadores", format: "list" },
};

export const COMPETITION_ORDER: Competition[] = ["serie_a", "serie_b", "copa_do_brasil", "libertadores"];

const THESPORTSDB_LEAGUE_IDS: Record<Competition, number> = {
  serie_a: 4351,
  serie_b: 4404,
  copa_do_brasil: 4725,
  libertadores: 4501,
};

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
  // When the source last recalculated this row — surfaced in the UI because
  // free standings sources can lag a match or two behind the official
  // result (confirmed: TheSportsDB's table was briefly a draw short of the
  // real points total for a couple of teams after a late match).
  updatedAt: string | null;
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
    updatedAt: null,
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

// Season-scoped — blocked on the free plan for the current season (see the
// file header). Not called from any page right now; kept for when this is
// upgraded or pointed at a different source.
export async function getStandings(competition: Competition): Promise<StandingRow[] | null> {
  const { apiLeagueId } = COMPETITIONS[competition];
  const data = await fetchFootballApi<RawStandingsResponse>("/standings", { league: apiLeagueId, season: currentSeason() }, STANDINGS_CACHE_SECONDS);
  return parseStandings(data);
}

// Season-scoped — blocked on the free plan for the current season. Not
// called from any page right now (see getTodayFixtures for the free-plan
// substitute used for "today's games" and the live gate).
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

// Season-scoped — blocked on the free plan for the current season. Not
// called from any page right now.
export async function getCompetitionTeams(competition: Competition): Promise<Team[] | null> {
  const { apiLeagueId } = COMPETITIONS[competition];
  const data = await fetchFootballApi<RawTeamsResponse>("/teams", { league: apiLeagueId, season: currentSeason() }, TEAMS_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((t) => ({ id: t.team.id, name: t.team.name, logo: t.team.logo ?? null }));
}

// Season-scoped — blocked on the free plan for the current season. Not
// called from any page right now.
export async function getTeamFixtures(teamId: number): Promise<Fixture[] | null> {
  const data = await fetchFootballApi<RawFixturesResponse>("/fixtures", { team: teamId, season: currentSeason() }, TEAM_FIXTURES_CACHE_SECONDS);
  if (!data?.response) return null;
  const competitionByLeagueId = new Map(COMPETITION_ORDER.map((key) => [COMPETITIONS[key].apiLeagueId, key]));
  return data.response
    .filter((f) => competitionByLeagueId.has(f.league.id))
    .map((f) => parseFixture(f, competitionByLeagueId.get(f.league.id)!));
}

// The free-plan substitute for "today's fixtures per competition": /fixtures
// with only a `date` (no league, no season) is NOT season-gated — confirmed
// against the live API — but it returns every match worldwide for that date,
// so results are filtered down to our 4 competitions here. This is the
// source for both "jogos de hoje" and the live-match gate below, at the cost
// of one global call rather than one per competition.
const TODAY_CACHE_SECONDS = 10800; // 3h

export async function getTodayFixtures(): Promise<Fixture[] | null> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await fetchFootballApi<RawFixturesResponse>("/fixtures", { date: today }, TODAY_CACHE_SECONDS);
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
  const fixtures = await getTodayFixtures();
  const now = Date.now();
  return (fixtures ?? []).some((f) => {
    const kickoff = new Date(f.date).getTime();
    return now >= kickoff && now <= kickoff + LIVE_WINDOW_MS;
  });
}

// --- TheSportsDB: standings + recent results for the current season ---
// (API-Football's free plan can't do either — see the file header.)

type RawSportsDbTableRow = {
  idTeam: string;
  strTeam: string;
  strBadge?: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  intRank: string;
  strForm?: string | null;
  strDescription?: string | null;
  dateUpdated?: string | null;
};
type RawSportsDbTableResponse = { table?: RawSportsDbTableRow[] };

type RawSportsDbEvent = {
  idEvent: string;
  dateEvent: string;
  strTime?: string | null;
  strStatus?: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
};
type RawSportsDbEventsResponse = { events?: RawSportsDbEvent[] | null };

const SPORTSDB_STANDINGS_CACHE_SECONDS = 10800; // 3h
const SPORTSDB_RESULTS_CACHE_SECONDS = 3600; // 1h

async function fetchSportsDb<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(`${THESPORTSDB_BASE}${path}`, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// TheSportsDB's table endpoint is capped at the top 5 rows on the shared
// free key — real current-season data, just not the full 20-team table (no
// known free source gives that). Only meaningful for serie_a/serie_b
// (COMPETITIONS[x].format === "table"); copa_do_brasil/libertadores don't
// have a points table to begin with.
export async function getStandingsTop5(competition: Competition): Promise<StandingRow[] | null> {
  const leagueId = THESPORTSDB_LEAGUE_IDS[competition];
  const data = await fetchSportsDb<RawSportsDbTableResponse>(`/lookuptable.php?l=${leagueId}&s=${currentSeason()}`, SPORTSDB_STANDINGS_CACHE_SECONDS);
  if (!data?.table) return null;
  return data.table.map((r) => ({
    rank: Number(r.intRank),
    teamId: Number(r.idTeam),
    teamName: r.strTeam,
    teamLogo: r.strBadge ?? null,
    points: Number(r.intPoints),
    played: Number(r.intPlayed),
    win: Number(r.intWin),
    draw: Number(r.intDraw),
    lose: Number(r.intLoss),
    goalsFor: Number(r.intGoalsFor),
    goalsAgainst: Number(r.intGoalsAgainst),
    goalsDiff: Number(r.intGoalDifference),
    form: r.strForm ?? null,
    description: r.strDescription ?? null,
    updatedAt: r.dateUpdated ?? null,
  }));
}

function parseSportsDbEvent(e: RawSportsDbEvent, competition: Competition): Fixture {
  return {
    id: Number(e.idEvent),
    date: e.strTime ? `${e.dateEvent}T${e.strTime}Z` : e.dateEvent,
    round: null,
    status: e.strStatus === "FT" ? "finished" : e.strStatus === "NS" ? "scheduled" : e.strStatus ? "live" : "other",
    statusShort: e.strStatus ?? "",
    elapsed: null,
    homeTeamId: Number(e.idHomeTeam),
    homeTeamName: e.strHomeTeam,
    homeTeamLogo: e.strHomeTeamBadge ?? null,
    awayTeamId: Number(e.idAwayTeam),
    awayTeamName: e.strAwayTeam,
    awayTeamLogo: e.strAwayTeamBadge ?? null,
    homeGoals: e.intHomeScore !== null && e.intHomeScore !== undefined ? Number(e.intHomeScore) : null,
    awayGoals: e.intAwayScore !== null && e.intAwayScore !== undefined ? Number(e.intAwayScore) : null,
    competition,
  };
}

// TheSportsDB's "past events" endpoint is capped at a single match on the
// shared free key — the competition's most recent result, not a list.
export async function getLastResult(competition: Competition): Promise<Fixture | null> {
  const leagueId = THESPORTSDB_LEAGUE_IDS[competition];
  const data = await fetchSportsDb<RawSportsDbEventsResponse>(`/eventspastleague.php?id=${leagueId}`, SPORTSDB_RESULTS_CACHE_SECONDS);
  const event = data?.events?.[0];
  return event ? parseSportsDbEvent(event, competition) : null;
}
