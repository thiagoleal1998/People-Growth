// Football scores/standings, combining three free sources — confirmed against
// all three live, with real calls, not assumed from docs:
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
// 3) api-futebol.com.br's own PUBLIC marketing pages (not their paid API,
//    which needs a key and starts around R$99/mo per competition — these
//    are the free pages they publish for SEO/lead-gen, the same kind of
//    page a browser or Google would show). Confirmed by direct fetch: full,
//    accurate standings (all 20 teams, matching CBF's own site and
//    Wikipedia's CBF-sourced numbers exactly) and the full current round's
//    match cards with real scores, dates and venues — neither available
//    free anywhere else found. This is NOT an API contract — there's no
//    published endpoint, no SLA, and the markup could change on any
//    redesign, same risk class as the open-source scrapers already doing
//    this against CBF's own site (e.g. github.com/lohxx/brasileirao). Kept
//    deliberately low-volume and identified honestly (a real User-Agent
//    naming this site, a 30-minute cache) rather than disguised as a
//    browser — this is reading the same public page anyone can open, not
//    bypassing a paywall or a search engine's anti-bot defenses.
//
// Competition ids were confirmed against real API responses, not guessed —
// API-Football via `/leagues?country=Brazil` / `/leagues?search=libertadores`
// (71/72/73/13); TheSportsDB via team records' strLeague2/3 fields (e.g.
// Flamengo's own record lists its competitions directly) since TheSportsDB's
// own league-search endpoints are capped the same way (4351/4404/4725/4501);
// api-futebol.com.br's URL slugs confirmed by following redirects from each
// competition's base URL (campeonato-brasileiro / campeonato-brasileiro-serie-b
// / copa-do-brasil / copa-libertadores-da-america).

import * as cheerio from "cheerio";
import { dateKeySaoPaulo } from "@/lib/date-key";

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

const SCRAPE_SLUGS: Record<Competition, string> = {
  serie_a: "campeonato-brasileiro",
  serie_b: "campeonato-brasileiro-serie-b",
  copa_do_brasil: "copa-do-brasil",
  libertadores: "copa-libertadores-da-america",
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
  // "api_football" fixtures have a real API-Football fixture id (in `id`),
  // so /esportes/partida/[id] (events/lineups/statistics, all fixture-id-
  // scoped and NOT season-blocked — confirmed live) can look them up.
  // "scraped" fixtures (TheSportsDB, api-futebol.com.br) number matches in
  // an unrelated system — `id` on its own can't be used for the detail
  // page. `detailId` is the resolved API-Football id when one was found
  // (see attachDetailIds), null otherwise — UI should link using `detailId`,
  // never the raw `id`, for a "scraped" fixture.
  source: "api_football" | "scraped";
  detailId: number | null;
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
    source: "api_football",
    detailId: f.fixture.id,
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
  // "Today" in Brazil, not UTC — using toISOString()'s UTC date here used to
  // create a multi-hour blind window (Brazil is UTC-3, so from ~9pm to
  // midnight local time, the UTC calendar day is already "tomorrow", and
  // today's real matches would silently stop showing up).
  const today = dateKeySaoPaulo(new Date().toISOString());
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
    source: "scraped",
    detailId: null,
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

// --- api-futebol.com.br: full standings + current round, scraped from their
// public pages (not their paid API) — see the file header for why and for
// the honesty/politeness choices (identified User-Agent, 30-min cache).

const SCRAPE_CACHE_SECONDS = 1800; // 30min — a public page, not a rate-limited API; still deliberately not hammered
const SCRAPE_USER_AGENT = "Mozilla/5.0 (compatible; PeopleAndGrowthBot/1.0; +https://peopleandgrowth.com.br)";

async function fetchScrapedHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": SCRAPE_USER_AGENT }, next: { revalidate: SCRAPE_CACHE_SECONDS } });
    if (!res.ok) return null;
    return { html: await res.text(), finalUrl: res.url };
  } catch {
    return null;
  }
}

// Stable-enough numeric id for a team/match we only know by name or URL slug
// (this source doesn't expose the same numeric ids API-Football/TheSportsDB
// do) — only used for React keys and the Fixture/StandingRow type's shape,
// never to cross-reference against the other two sources.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Full (all 20 teams) current-season standings — see getStandingsTop5 for
// the capped alternative this exists alongside. Only meaningful for
// serie_a/serie_b (COMPETITIONS[x].format === "table").
export async function getFullStandings(competition: Competition): Promise<StandingRow[] | null> {
  const slug = SCRAPE_SLUGS[competition];
  const page = await fetchScrapedHtml(`https://www.api-futebol.com.br/campeonato/${slug}/${currentSeason()}`);
  if (!page) return null;
  const $ = cheerio.load(page.html);
  const rows: StandingRow[] = [];
  $("table tbody tr").each((index, tr) => {
    const cells = $(tr)
      .find("td")
      .map((_, td) => $(td).text().trim())
      .get();
    // Header order confirmed live: #, Time, Pts, J, V, E, D, SG, GP, GC.
    const teamName = $(tr).find("td").eq(1).find("img").attr("alt") ?? cells[1] ?? "";
    const teamLogo = $(tr).find("td").eq(1).find("img").attr("src") ?? null;
    if (!teamName || cells.length < 10) return;
    rows.push({
      rank: Number(cells[0]) || index + 1,
      teamId: hashString(teamName),
      teamName,
      teamLogo,
      points: Number(cells[2]) || 0,
      played: Number(cells[3]) || 0,
      win: Number(cells[4]) || 0,
      draw: Number(cells[5]) || 0,
      lose: Number(cells[6]) || 0,
      goalsDiff: Number(cells[7]) || 0,
      goalsFor: Number(cells[8]) || 0,
      goalsAgainst: Number(cells[9]) || 0,
      form: null,
      description: null,
      updatedAt: null,
    });
  });
  return rows.length > 0 ? rows : null;
}

const SCRAPE_STATUS_FINISHED = "finalizado";
const SCRAPE_STATUS_SCHEDULED = "agendado";

// Match-card links end in "DD-MM-team-names-ID" — league-phase competitions
// (serie_a/serie_b) nest that under a "/partida/" segment, but the knockout
// phase (copa_do_brasil/libertadores) nests it directly under the phase name
// instead (e.g. "/semi-final/07-10-...-34884"), so the selector matches the
// trailing pattern rather than a fixed path segment — confirmed against both
// a league round and a Copa do Brasil semifinal page.
const MATCH_HREF_RE = /\/\d{2}-\d{2}-[a-z0-9-]+-\d+$/;

function parseFixturesFromRoundPage($: cheerio.CheerioAPI, competition: Competition): Fixture[] {
  const fixtures: Fixture[] = [];
  $("a[href]").each((_, a) => {
    const $a = $(a);
    const href = $a.attr("href") ?? "";
    if (!MATCH_HREF_RE.test(href)) return;
    const idMatch = href.match(/-(\d+)$/);
    const text = $a.text().toLowerCase();
    const imgs = $a.find("img[alt]");
    const homeTeamName = $(imgs.get(0)).attr("alt") ?? "";
    const awayTeamName = $(imgs.get(1)).attr("alt") ?? "";
    if (!homeTeamName || !awayTeamName) return;
    const scoreMatch = $a.text().match(/(\d+)\s*[x×]\s*(\d+)/i);
    const dateMatch = $a.text().match(/(\d{2})\/(\d{2})\s+(\d{2})h(\d{2})/);
    const status: FixtureStatus = text.includes(SCRAPE_STATUS_FINISHED)
      ? "finished"
      : text.includes(SCRAPE_STATUS_SCHEDULED)
        ? "scheduled"
        : scoreMatch
          ? "live"
          : "other";
    // The site's "DD/MM HHhMM" text is the raw UTC timestamp, not Brazil
    // local time, despite looking like a BRT-formatted string — confirmed
    // live against API-Football's own fixture time for the same match
    // (identical date+hour in both, with API-Football's tagged "+00:00").
    // Tagging it "-03:00" here was a real bug: for any match kicking off
    // 21:00-23:59 BRT (a common prime-time slot), the UTC hour rolls past
    // midnight into the next day, so "-03:00" silently shifted the fixture
    // onto the wrong calendar day.
    const date = dateMatch
      ? `${currentSeason()}-${dateMatch[2]}-${dateMatch[1]}T${dateMatch[3]}:${dateMatch[4]}:00Z`
      : new Date().toISOString();
    fixtures.push({
      id: idMatch ? Number(idMatch[1]) : hashString(href),
      date,
      round: null,
      status,
      statusShort: status,
      elapsed: null,
      homeTeamId: hashString(homeTeamName),
      homeTeamName,
      homeTeamLogo: $(imgs.get(0)).attr("src") ?? null,
      awayTeamId: hashString(awayTeamName),
      awayTeamName,
      awayTeamLogo: $(imgs.get(1)).attr("src") ?? null,
      homeGoals: scoreMatch ? Number(scoreMatch[1]) : null,
      awayGoals: scoreMatch ? Number(scoreMatch[2]) : null,
      competition,
      source: "scraped",
      detailId: null,
    });
  });
  return fixtures;
}

// The "Rodada anterior" nav arrow's href carries the previous round's
// number — used to fall back to it when the current round hasn't been
// played yet (see getCurrentRoundFixtures).
function previousRoundNumber($: cheerio.CheerioAPI): number | null {
  const href = $('a[aria-label="Rodada anterior"]').attr("href") ?? "";
  const match = href.match(/\/rodada\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

// Current round's matches (10 for the league-phase competitions; however
// many ties are active for the knockout phase of copa_do_brasil/
// libertadores) — real scores/dates, scraped from the same site. "Current"
// follows the site's own default view, which — confirmed live — advances to
// the next round as soon as the previous one finishes, even before any of
// the new round's matches have actually kicked off. When that happens (the
// "current" round is all `agendado`, nothing finished or live yet), this
// falls back to the previous round instead, so there's always something to
// show rather than an all-scheduled round with zero results.
export async function getCurrentRoundFixtures(competition: Competition): Promise<Fixture[] | null> {
  const slug = SCRAPE_SLUGS[competition];
  const page = await fetchScrapedHtml(`https://www.api-futebol.com.br/campeonato/${slug}/${currentSeason()}`);
  if (!page) return null;
  const $ = cheerio.load(page.html);
  const fixtures = parseFixturesFromRoundPage($, competition);
  if (fixtures.length === 0) return null;

  const hasAnyResult = fixtures.some((f) => f.status === "finished" || f.status === "live");
  if (hasAnyResult) return fixtures;

  const prevRound = previousRoundNumber($);
  if (prevRound === null) return fixtures;
  const prevPage = await fetchScrapedHtml(`https://www.api-futebol.com.br/campeonato/${slug}/${currentSeason()}/rodada/${prevRound}`);
  if (!prevPage) return fixtures;
  const prevFixtures = parseFixturesFromRoundPage(cheerio.load(prevPage.html), competition);
  return prevFixtures.length > 0 ? prevFixtures : fixtures;
}

// The full scraped table is the real, complete standings — but it's the one
// reading an undocumented public page, so it's the one most likely to break
// first. Falls back to TheSportsDB's top-5 (a documented API, just capped)
// rather than showing nothing if the scrape ever comes back empty.
export async function getBestStandings(competition: Competition): Promise<StandingRow[] | null> {
  return (await getFullStandings(competition)) ?? getStandingsTop5(competition);
}

// getCurrentRoundFixtures has no built-in expiry of its own — it just
// follows the site's own "current round" definition, which can sit on the
// same finished round for days between matchdays (midweek gaps,
// international breaks). Left unchecked, the home page's "Resultados da
// rodada" fallback would show the same results indefinitely instead of
// just clearing out once they're no longer news. 2h is a safe upper bound
// for a match's own length (90min + stoppage + half-time), so "last
// finished kickoff + 2h + 24h" is the round's actual cutoff for staying on
// the home page.
const ROUND_RESULTS_STALE_HOURS = 26; // ~2h match length + 24h grace

export function isRoundResultsFresh(fixtures: Fixture[]): boolean {
  const finishedKickoffs = fixtures.filter((f) => f.status === "finished").map((f) => new Date(f.date).getTime());
  if (finishedKickoffs.length === 0) return false;
  const lastKickoff = Math.max(...finishedKickoffs);
  return Date.now() - lastKickoff < ROUND_RESULTS_STALE_HOURS * 60 * 60 * 1000;
}

// "Jogos por clube" (full season schedule for one team) needs a different
// source than the round page: api-futebol.com.br has no per-team page at
// all (confirmed live — no team links anywhere on the standings/round
// pages, every guessed URL shape 404s), and API-Football's /fixtures?team=
// is season-scoped, blocked on the free plan same as /standings. But the
// standings page's own Next.js payload embeds the WHOLE season's matches —
// confirmed live: 379 clean, individually JSON.parse-able objects for
// Série A 2026, not just the current round — so a club's full schedule
// (past results + upcoming fixtures) is just a filter over that, no extra
// request beyond the one getFullStandings/getCurrentRoundFixtures already
// make (same URL, same Data Cache entry).
const SEASON_MATCH_RE = /\{"round":\d+,"date":"[^"]+","time":"[^"]+".{0,500}?"matchId":"\d+","group":null\}/g;

type ScrapedSeasonMatch = {
  round: number;
  date: string;
  time: string;
  status: string;
  homeTeam: { name: string; logo?: string; score: number | null };
  awayTeam: { name: string; logo?: string; score: number | null };
  matchId: string;
};

export async function getSeasonFixtures(competition: Competition): Promise<Fixture[] | null> {
  const slug = SCRAPE_SLUGS[competition];
  const page = await fetchScrapedHtml(`https://www.api-futebol.com.br/campeonato/${slug}/${currentSeason()}`);
  if (!page) return null;
  const matches = page.html.match(SEASON_MATCH_RE);
  if (!matches || matches.length === 0) return null;

  const fixtures: Fixture[] = [];
  for (const raw of matches) {
    let parsed: ScrapedSeasonMatch;
    try {
      parsed = JSON.parse(raw) as ScrapedSeasonMatch;
    } catch {
      continue;
    }
    // Same UTC-not-BRT quirk as the round page's displayed "DD/MM HHhMM"
    // text (see parseFixturesFromRoundPage) — this "time" field is the same
    // raw value, confirmed identical for the same match on both pages.
    const status: FixtureStatus =
      parsed.status === SCRAPE_STATUS_FINISHED
        ? "finished"
        : parsed.status === SCRAPE_STATUS_SCHEDULED
          ? "scheduled"
          : parsed.homeTeam.score !== null
            ? "live"
            : "other";
    fixtures.push({
      id: Number(parsed.matchId),
      date: `${parsed.date}T${parsed.time}:00Z`,
      round: String(parsed.round),
      status,
      statusShort: status,
      elapsed: null,
      homeTeamId: hashString(parsed.homeTeam.name),
      homeTeamName: parsed.homeTeam.name,
      homeTeamLogo: parsed.homeTeam.logo ?? null,
      awayTeamId: hashString(parsed.awayTeam.name),
      awayTeamName: parsed.awayTeam.name,
      awayTeamLogo: parsed.awayTeam.logo ?? null,
      homeGoals: parsed.homeTeam.score,
      awayGoals: parsed.awayTeam.score,
      competition,
      source: "scraped",
      detailId: null,
    });
  }
  return fixtures;
}

// A club's full-season schedule (past results + upcoming fixtures),
// chronological — only meaningful for serie_a/serie_b (COMPETITIONS[x].
// format === "table"); Copa do Brasil/Libertadores don't expose this same
// per-season match list and aren't a fixed round-robin roster to filter by.
export async function getClubFixtures(competition: Competition, teamName: string): Promise<Fixture[] | null> {
  const season = await getSeasonFixtures(competition);
  if (!season) return null;
  const fixtures = season.filter((f) => f.homeTeamName === teamName || f.awayTeamName === teamName);
  return fixtures.sort((a, b) => a.date.localeCompare(b.date));
}

// Scraped fixtures (TheSportsDB, api-futebol.com.br) have no real
// API-Football id to link to the detail page with. Resolving one via
// API-Football's date-scoped /fixtures endpoint was tried first, but
// confirmed live to only ever serve dates from today forward (free plan
// error message: "try from <today> to <today+2>") — never the past, which
// is exactly when a "round results" fixture happened. /fixtures/headtohead
// has no such restriction (confirmed live: returns a team pair's full
// history, past and future, across every competition and season) — so
// fixtures are resolved by looking up both teams' numeric API-Football ids
// below and searching their h2h history for the same calendar day + league.
// Team ids were resolved once via /teams?search= and cross-checked against
// /teams?league=&season=2024 (an unblocked past season, also season/date
// unrestricted) — the search endpoint alone isn't reliable, confirmed live:
// it returned a stale duplicate record for Atlético-MG ("Atletico Mineiro",
// id 117, with zero fixtures) instead of the id actually used in fixtures
// ("Atletico-MG", id 1062) — hardcoded here, keyed by the exact name string
// api-futebol.com.br's pages use — this mirrors COMPETITIONS/SCRAPE_SLUGS/
// THESPORTSDB_LEAGUE_IDS elsewhere in this file: a small, stable universe
// (current Série A + B rosters) verified against the live API rather than
// guessed, cheaper and far more reliable than fuzzy name matching (which hit
// real ambiguity live, e.g. "Bragantino" substring-matching both "RB
// Bragantino" and the unrelated lower-division "Bragantino PA").
const TEAM_IDS: Record<string, number> = {
  // Série A 2026
  Flamengo: 127,
  Palmeiras: 121,
  Fluminense: 124,
  "Athletico-PR": 134,
  Cruzeiro: 135,
  Bahia: 118,
  "Atlético-MG": 1062,
  Santos: 128,
  Coritiba: 147,
  Bragantino: 794,
  "São Paulo": 126,
  Vitória: 136,
  Botafogo: 120,
  Vasco: 133,
  Mirassol: 7848,
  Corinthians: 131,
  Internacional: 119,
  Grêmio: 130,
  Remo: 1198,
  Chapecoense: 132,
  // Série B 2026
  Juventude: 152,
  "Vila Nova": 142,
  Novorizontino: 7834,
  Fortaleza: 154,
  Criciúma: 140,
  "Atlético-GO": 144,
  CRB: 146,
  Sport: 123,
  "Operário-PR": 1223,
  Cuiabá: 1193,
  Goiás: 151,
  "São Bernardo": 7865,
  Náutico: 755,
  Ceará: 129,
  "Athletic Club": 13975,
  "Botafogo-SP": 2618,
  Avaí: 145,
  Londrina: 148,
  "América-MG": 125,
  "Ponte Preta": 139,
};

const H2H_CACHE_SECONDS = 21600; // 6h — per team pair, not per fixture, so cheap even daily

export async function attachDetailIds(fixtures: Fixture[]): Promise<Fixture[]> {
  const unresolved = fixtures.filter((f) => f.source === "scraped" && f.detailId === null);
  if (unresolved.length === 0) return fixtures;

  const pairs = new Map<string, { home: number; away: number }>();
  for (const f of unresolved) {
    const home = TEAM_IDS[f.homeTeamName];
    const away = TEAM_IDS[f.awayTeamName];
    if (home && away) pairs.set(`${home}-${away}`, { home, away });
  }

  const h2hByPair = new Map<string, RawFixture[]>();
  await Promise.all(
    [...pairs.entries()].map(async ([key, { home, away }]) => {
      const data = await fetchFootballApi<RawFixturesResponse>("/fixtures/headtohead", { h2h: `${home}-${away}` }, H2H_CACHE_SECONDS);
      h2hByPair.set(key, data?.response ?? []);
    })
  );

  return fixtures.map((f) => {
    if (f.source !== "scraped" || f.detailId !== null) return f;
    const home = TEAM_IDS[f.homeTeamName];
    const away = TEAM_IDS[f.awayTeamName];
    if (!home || !away) return f;
    const candidates = h2hByPair.get(`${home}-${away}`) ?? [];
    const targetDate = dateKeySaoPaulo(f.date);
    const leagueId = COMPETITIONS[f.competition].apiLeagueId;
    const match = candidates.find((raw) => raw.league.id === leagueId && dateKeySaoPaulo(raw.fixture.date) === targetDate);
    return match ? { ...f, detailId: match.fixture.id } : f;
  });
}

// --- Match detail: events, lineups, statistics for a single fixture ---
// (src/app/[locale]/(public)/esportes/partida/[id]/page.tsx). Confirmed
// live: /fixtures?id=, /fixtures/events, /fixtures/lineups and
// /fixtures/statistics are all scoped by fixture id, not by season — none of
// them hit the free-plan season block that /standings and the other
// season-scoped endpoints do. Only usable for fixtures with a real
// API-Football id (Fixture.source === "api_football"); never call these with
// an id from the scraped sources, which use an unrelated numbering.

const MATCH_DETAIL_CACHE_SECONDS = 180; // 3min — same cadence as live scores

export type MatchHeader = Fixture & {
  referee: string | null;
  venueName: string | null;
  venueCity: string | null;
};

type RawFixtureFull = RawFixture & {
  fixture: RawFixture["fixture"] & { referee?: string | null; venue?: { name?: string | null; city?: string | null } };
};
type RawFixturesFullResponse = { response?: RawFixtureFull[] };

export async function getMatchHeader(fixtureId: number): Promise<MatchHeader | null> {
  const data = await fetchFootballApi<RawFixturesFullResponse>("/fixtures", { id: fixtureId }, MATCH_DETAIL_CACHE_SECONDS);
  const f = data?.response?.[0];
  if (!f) return null;
  const competitionByLeagueId = new Map(COMPETITION_ORDER.map((key) => [COMPETITIONS[key].apiLeagueId, key]));
  const competition = competitionByLeagueId.get(f.league.id);
  if (!competition) return null;
  return {
    ...parseFixture(f, competition),
    referee: f.fixture.referee ?? null,
    venueName: f.fixture.venue?.name ?? null,
    venueCity: f.fixture.venue?.city ?? null,
  };
}

export type MatchEvent = {
  minute: number;
  extraMinute: number | null;
  teamId: number;
  teamName: string;
  playerName: string | null;
  assistName: string | null;
  type: "goal" | "card" | "subst" | "var" | "other";
  detail: string;
};

type RawMatchEvent = {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { name: string | null };
  assist: { name: string | null };
  type: string;
  detail: string;
};
type RawEventsResponse = { response?: RawMatchEvent[] };

function mapEventType(type: string): MatchEvent["type"] {
  const lower = type.toLowerCase();
  if (lower === "goal") return "goal";
  if (lower === "card") return "card";
  if (lower === "subst") return "subst";
  if (lower === "var") return "var";
  return "other";
}

export async function getMatchEvents(fixtureId: number): Promise<MatchEvent[] | null> {
  const data = await fetchFootballApi<RawEventsResponse>("/fixtures/events", { fixture: fixtureId }, MATCH_DETAIL_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((e) => ({
    minute: e.time.elapsed,
    extraMinute: e.time.extra,
    teamId: e.team.id,
    teamName: e.team.name,
    playerName: e.player.name ?? null,
    assistName: e.assist.name ?? null,
    type: mapEventType(e.type),
    detail: e.detail,
  }));
}

export type LineupPlayer = { id: number; name: string; number: number | null; position: string | null };

export type TeamLineup = {
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  formation: string | null;
  coachName: string | null;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
};

type RawLineupPlayer = { player: { id: number; name: string; number: number | null; pos: string | null } };
type RawLineup = {
  team: { id: number; name: string; logo?: string };
  formation: string | null;
  coach: { name: string | null };
  startXI: RawLineupPlayer[];
  substitutes: RawLineupPlayer[];
};
type RawLineupsResponse = { response?: RawLineup[] };

export async function getMatchLineups(fixtureId: number): Promise<TeamLineup[] | null> {
  const data = await fetchFootballApi<RawLineupsResponse>("/fixtures/lineups", { fixture: fixtureId }, MATCH_DETAIL_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((l) => ({
    teamId: l.team.id,
    teamName: l.team.name,
    teamLogo: l.team.logo ?? null,
    formation: l.formation,
    coachName: l.coach.name ?? null,
    startXI: l.startXI.map((p) => ({ id: p.player.id, name: p.player.name, number: p.player.number, position: p.player.pos })),
    substitutes: l.substitutes.map((p) => ({ id: p.player.id, name: p.player.name, number: p.player.number, position: p.player.pos })),
  }));
}

export type TeamStatistics = { teamId: number; teamName: string; stats: { type: string; value: string | number | null }[] };

type RawTeamStatistics = { team: { id: number; name: string }; statistics: { type: string; value: string | number | null }[] };
type RawStatisticsResponse = { response?: RawTeamStatistics[] };

export async function getMatchStatistics(fixtureId: number): Promise<TeamStatistics[] | null> {
  const data = await fetchFootballApi<RawStatisticsResponse>("/fixtures/statistics", { fixture: fixtureId }, MATCH_DETAIL_CACHE_SECONDS);
  if (!data?.response) return null;
  return data.response.map((s) => ({ teamId: s.team.id, teamName: s.team.name, stats: s.statistics }));
}

export type MatchDetail = {
  header: MatchHeader;
  events: MatchEvent[] | null;
  lineups: TeamLineup[] | null;
  statistics: TeamStatistics[] | null;
};

export async function getMatchDetail(fixtureId: number): Promise<MatchDetail | null> {
  const header = await getMatchHeader(fixtureId);
  if (!header) return null;
  const [events, lineups, statistics] = await Promise.all([getMatchEvents(fixtureId), getMatchLineups(fixtureId), getMatchStatistics(fixtureId)]);
  return { header, events, lineups, statistics };
}
