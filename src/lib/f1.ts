// Formula 1 — schedule, standings, and last race result, via Jolpica
// (api.jolpi.ca), the community-run successor to the old Ergast API (which
// went offline in 2024). Free, no key, no commercial-use restriction (unlike
// OpenF1, whose free tier is personal/non-commercial use only and whose live
// data requires a paid plan) — confirmed live against the current season.
// Same house pattern as nfl.ts/nba.ts: every function degrades to null on
// any failure rather than throwing, since this only ever backs an optional
// section of a page.
//
// Jolpica's "current" alias resolves to the current season server-side, so
// there's no need to compute/track the year here.

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

async function fetchJolpica<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(`${JOLPICA_BASE}${path}`, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const SCHEDULE_CACHE_SECONDS = 21600; // 6h — the race calendar for a season essentially never changes mid-year
const STANDINGS_CACHE_SECONDS = 3600; // 1h — only moves once a race finishes, but checked more eagerly than NFL/standings since races are rarer events worth catching sooner
const RESULT_CACHE_SECONDS = 1800; // 30min

export type F1Race = {
  round: number;
  name: string;
  circuitName: string;
  locality: string | null;
  country: string | null;
  date: string; // ISO date, e.g. "2026-03-08"
  time: string | null; // "HH:MM:SSZ" (UTC) when known
};

export type F1DriverStanding = {
  position: number;
  points: number;
  wins: number;
  driverCode: string;
  driverName: string;
  driverNationality: string;
  constructorName: string;
};

export type F1ConstructorStanding = {
  position: number;
  points: number;
  wins: number;
  constructorName: string;
  nationality: string;
};

export type F1RaceResultEntry = {
  position: number;
  driverCode: string;
  driverName: string;
  driverNationality: string;
  constructorName: string;
  status: string; // "Finished", "+1 Lap", "Retired", etc.
  points: number;
};

export type F1RaceResult = {
  round: number;
  name: string;
  circuitName: string;
  country: string | null;
  date: string;
  results: F1RaceResultEntry[];
};

type RawCircuit = { circuitName: string; Location?: { locality?: string; country?: string } };
type RawRace = { round: string; raceName: string; Circuit: RawCircuit; date: string; time?: string };
type RawRaceTable = { MRData: { RaceTable: { Races: RawRace[] } } };

function parseRace(r: RawRace): F1Race {
  return {
    round: Number(r.round),
    name: r.raceName,
    circuitName: r.Circuit.circuitName,
    locality: r.Circuit.Location?.locality ?? null,
    country: r.Circuit.Location?.country ?? null,
    date: r.date,
    time: r.time ?? null,
  };
}

export async function getSeasonSchedule(): Promise<F1Race[] | null> {
  const data = await fetchJolpica<RawRaceTable>("/current.json", SCHEDULE_CACHE_SECONDS);
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || races.length === 0) return null;
  return races.map(parseRace);
}

export async function getNextRace(): Promise<F1Race | null> {
  const data = await fetchJolpica<RawRaceTable>("/current/next.json", RESULT_CACHE_SECONDS);
  const race = data?.MRData?.RaceTable?.Races?.[0];
  return race ? parseRace(race) : null;
}

type RawDriver = { code?: string; givenName: string; familyName: string; nationality?: string };
type RawDriverStandingEntry = { position: string; points: string; wins: string; Driver: RawDriver; Constructors: { name: string }[] };
type RawDriverStandings = {
  MRData: { StandingsTable: { StandingsLists: { DriverStandings: RawDriverStandingEntry[] }[] } };
};

export async function getDriverStandings(): Promise<F1DriverStanding[] | null> {
  const data = await fetchJolpica<RawDriverStandings>("/current/driverstandings.json", STANDINGS_CACHE_SECONDS);
  const entries = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
  if (!entries || entries.length === 0) return null;
  return entries.map((e) => ({
    position: Number(e.position),
    points: Number(e.points),
    wins: Number(e.wins),
    driverCode: e.Driver.code ?? e.Driver.familyName.slice(0, 3).toUpperCase(),
    driverName: `${e.Driver.givenName} ${e.Driver.familyName}`,
    driverNationality: e.Driver.nationality ?? "",
    constructorName: e.Constructors[0]?.name ?? "—",
  }));
}

type RawConstructorStandingEntry = { position: string; points: string; wins: string; Constructor: { name: string; nationality: string } };
type RawConstructorStandings = {
  MRData: { StandingsTable: { StandingsLists: { ConstructorStandings: RawConstructorStandingEntry[] }[] } };
};

export async function getConstructorStandings(): Promise<F1ConstructorStanding[] | null> {
  const data = await fetchJolpica<RawConstructorStandings>("/current/constructorstandings.json", STANDINGS_CACHE_SECONDS);
  const entries = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
  if (!entries || entries.length === 0) return null;
  return entries.map((e) => ({
    position: Number(e.position),
    points: Number(e.points),
    wins: Number(e.wins),
    constructorName: e.Constructor.name,
    nationality: e.Constructor.nationality,
  }));
}

type RawResultEntry = { position: string; status: string; points: string; Driver: RawDriver; Constructor: { name: string } };
type RawResultRace = { round: string; raceName: string; Circuit: RawCircuit; date: string; Results: RawResultEntry[] };
type RawResultTable = { MRData: { RaceTable: { Races: RawResultRace[] } } };

export async function getLastRaceResult(): Promise<F1RaceResult | null> {
  const data = await fetchJolpica<RawResultTable>("/current/last/results.json", RESULT_CACHE_SECONDS);
  const race = data?.MRData?.RaceTable?.Races?.[0];
  if (!race || !race.Results || race.Results.length === 0) return null;
  return {
    round: Number(race.round),
    name: race.raceName,
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location?.country ?? null,
    date: race.date,
    results: race.Results.map((r) => ({
      position: Number(r.position),
      driverCode: r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase(),
      driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
      driverNationality: r.Driver.nationality ?? "",
      constructorName: r.Constructor.name,
      status: r.status,
      points: Number(r.points),
    })),
  };
}

// Jolpica (Ergast-shaped) data has never included images — these three
// helpers are the "visual" layer on top of it: a 2-letter country code (for
// a small styled badge, not a Unicode flag emoji — flag emoji rendering is
// inconsistent across platforms, confirmed falling back to plain-text
// letter codes in testing, so a styled badge with the code gives a
// consistent look instead of leaving it to chance) and team colors from
// each constructor's real livery, rather than real team/driver logos —
// sourcing ~11 current team logos with clear usage rights wasn't viable
// (same reasoning that ruled out hosting the official trademarked "F1"
// wordmark, see CheckeredFlagIcon). Both maps only need to cover the
// current grid/calendar; an unmapped name just falls back gracefully.

const COUNTRY_CODES: Record<string, string> = {
  Australia: "AU",
  China: "CN",
  Japan: "JP",
  Bahrain: "BH",
  "Saudi Arabia": "SA",
  USA: "US",
  "United States": "US",
  Italy: "IT",
  Monaco: "MC",
  Spain: "ES",
  Canada: "CA",
  Austria: "AT",
  UK: "GB",
  "United Kingdom": "GB",
  Hungary: "HU",
  Belgium: "BE",
  Netherlands: "NL",
  Azerbaijan: "AZ",
  Singapore: "SG",
  Mexico: "MX",
  Brazil: "BR",
  Qatar: "QA",
  "United Arab Emirates": "AE",
  Germany: "DE",
  Portugal: "PT",
  France: "FR",
  Turkey: "TR",
  India: "IN",
  Russia: "RU",
  Malaysia: "MY",
  Korea: "KR",
  "South Korea": "KR",
};

export function countryCode(country: string | null): string {
  if (!country) return "";
  return COUNTRY_CODES[country] ?? "";
}

// Nationality adjectives (as Jolpica/Ergast returns them for drivers), not
// country names — a separate map rather than reusing COUNTRY_CODES above.
const NATIONALITY_CODES: Record<string, string> = {
  British: "GB",
  Dutch: "NL",
  Monegasque: "MC",
  Spanish: "ES",
  Mexican: "MX",
  Brazilian: "BR",
  Australian: "AU",
  French: "FR",
  German: "DE",
  Finnish: "FI",
  Canadian: "CA",
  Japanese: "JP",
  Thai: "TH",
  Danish: "DK",
  Italian: "IT",
  American: "US",
  Chinese: "CN",
  "New Zealander": "NZ",
  Argentine: "AR",
  Austrian: "AT",
  Belgian: "BE",
  Swiss: "CH",
  Polish: "PL",
  Russian: "RU",
  Indian: "IN",
  Indonesian: "ID",
};

export function nationalityCode(nationality: string): string {
  return NATIONALITY_CODES[nationality] ?? "";
}

// Each team's real, widely-recognized livery/brand color — used as a small
// accent dot next to the constructor name in tables instead of a logo.
const CONSTRUCTOR_COLORS: Record<string, string> = {
  Mercedes: "#27F4D2",
  Ferrari: "#E8002D",
  "Red Bull": "#3671C6",
  McLaren: "#FF8000",
  "Aston Martin": "#229971",
  Alpine: "#FF87BC",
  "Alpine F1 Team": "#FF87BC",
  Williams: "#64C4FF",
  "RB F1 Team": "#6692FF",
  "Racing Bulls": "#6692FF",
  "Haas F1 Team": "#B6BABD",
  Haas: "#B6BABD",
  Audi: "#000000",
  Sauber: "#52E252",
  "Cadillac F1 Team": "#9C7C38",
};

const DEFAULT_CONSTRUCTOR_COLOR = "#315E9C";

export function constructorColor(name: string): string {
  return CONSTRUCTOR_COLORS[name] ?? DEFAULT_CONSTRUCTOR_COLOR;
}
