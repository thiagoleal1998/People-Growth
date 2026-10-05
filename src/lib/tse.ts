// Official 2026 election results published by the TSE as public JSON files
// (https://resultados.tse.jus.br). Ids are the ones in the TSE's own
// configuration file: 6257 is the federal election (president), 6259 the state
// election (governors and senators). The TSE asks for no more than 100 requests
// per second per IP, so results are fetched on the server and cached for a minute.
// Candidate photos come from the same TSE site.

const BASE = "https://resultados.tse.jus.br/oficial/ele2026";
const FEDERAL_ELECTION = "6257";
const STATE_ELECTION = "6259";
const CACHE_SECONDS = 60;

export const UF_OPTIONS = [
  { code: "ac", name: "Acre" }, { code: "al", name: "Alagoas" }, { code: "ap", name: "Amapá" },
  { code: "am", name: "Amazonas" }, { code: "ba", name: "Bahia" }, { code: "ce", name: "Ceará" },
  { code: "df", name: "Distrito Federal" }, { code: "es", name: "Espírito Santo" }, { code: "go", name: "Goiás" },
  { code: "ma", name: "Maranhão" }, { code: "mt", name: "Mato Grosso" }, { code: "ms", name: "Mato Grosso do Sul" },
  { code: "mg", name: "Minas Gerais" }, { code: "pa", name: "Pará" }, { code: "pb", name: "Paraíba" },
  { code: "pr", name: "Paraná" }, { code: "pe", name: "Pernambuco" }, { code: "pi", name: "Piauí" },
  { code: "rj", name: "Rio de Janeiro" }, { code: "rn", name: "Rio Grande do Norte" }, { code: "rs", name: "Rio Grande do Sul" },
  { code: "ro", name: "Rondônia" }, { code: "rr", name: "Roraima" }, { code: "sc", name: "Santa Catarina" },
  { code: "sp", name: "São Paulo" }, { code: "se", name: "Sergipe" }, { code: "to", name: "Tocantins" },
];

export type TseCandidate = {
  name: string;
  party: string;
  votes: number;
  pct: string;
  elected: boolean;
  inRunoff: boolean;
  // Set when the candidacy is not clean, for example "Anulado sub judice": the votes
  // are counted but annulled, and the TSE says why.
  irregular: string | null;
  // Deputies only: would be elected at the votes counted so far (not yet the TSE's result).
  projected: boolean;
  photo: string | null;
};

export type TseTotals = {
  valid: string;
  validPct: string;
  blank: string;
  blankPct: string;
  nulls: string;
  nullPct: string;
  present: string;
  presentPct: string;
  abstained: string;
  abstainedPct: string;
  validVotes: number;
};

export type TseRace = {
  candidates: TseCandidate[];
  // Seats up for election: 1 for presidente or governador, 2 for senado, the state's quota for deputies.
  seats: number;
  sectionsPct: string;
  totals: TseTotals | null;
  updatedAt: string;
  final: boolean;
};

// e is "s" for both the elected and the candidates in a runoff, so the TSE's status
// text (st: "Eleito", "2º turno", "Não eleito") is what tells them apart.
type RawCandidate = { sqcand?: string; nmu?: string; nm?: string; vap?: string; pvap?: string; e?: string; st?: string; dvt?: string };

type RawFile = {
  tf?: string;
  dt?: string;
  ht?: string;
  // v holds the vote counts: tv voters who showed up, vvc valid votes, vb blank votes.
  v?: { tv?: string; vvc?: string; vb?: string };
  s?: { pst?: string };
  // Electorate-level counts: te = electors, c = voters who showed up, a = abstentions.
  e?: { te?: string; c?: string; a?: string };
  carg?: {
    cd: string | number;
    nv?: string;
    qe?: string;
    agr?: { par?: { sg?: string; tvtn?: string; cand?: RawCandidate[] }[] }[];
  }[];
};

// Approximate colours for the parties' usual identity, used for everything that
// belongs to a candidate. Unknown siglas fall back to a neutral grey.
const PARTY_COLORS: Record<string, string> = {
  PT: "#E0201B", PL: "#0B3C8C", PSOL: "#F5B800", PSDB: "#0072BC", MDB: "#00874A", PSD: "#F28C00",
  UNIÃO: "#0055A5", PP: "#0B5CAD", PSB: "#E1251B", PDT: "#15803D", REPUBLICANOS: "#1E6FB8",
  PODE: "#7B2D8E", PCDOB: "#B91C1C", PV: "#3BA33B", AVANTE: "#0099CC", SOLIDARIEDADE: "#F28C28",
  NOVO: "#F26A21", PSTU: "#B30000", PCO: "#8B0000", PRD: "#6D28D9", DC: "#2563EB", PMB: "#0E7490",
  AGIR: "#0F766E", MISSÃO: "#334155", PRTB: "#1D4ED8", PSC: "#0A7D3B", PMN: "#A16207", PCB: "#7F1D1D",
};
const NEUTRAL_PARTY_COLOR = "#64748B";

// Federations come as "PT/PC do B/PV": the first party gives the colour.
export function partyColor(party: string): string {
  const sigla = party.split("/")[0].trim().toUpperCase();
  return PARTY_COLORS[sigla] ?? NEUTRAL_PARTY_COLOR;
}

const LOWERCASE_WORDS = new Set(["de", "da", "do", "das", "dos", "e"]);

// The TSE writes names in capitals ("FLAVIO BOLSONARO"); show them in title case.
export function formatName(raw: string): string {
  return raw
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((word, index) => (index > 0 && LOWERCASE_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1)))
    .join(" ");
}

// Name as shown in tight spaces: "Flavio Bolsonaro" becomes "F. Bolsonaro".
export function shortName(raw: string): string {
  const words = formatName(raw).split(" ");
  return words.length > 1 ? `${words[0].charAt(0)}. ${words[words.length - 1]}` : words[0];
}

function toNumber(value: string | undefined): number {
  return Number((value ?? "0").replace(",", ".")) || 0;
}

function percent(part: number, total: number): string {
  if (total <= 0) return "0,00";
  return ((part / total) * 100).toFixed(2).replace(".", ",");
}

type RawCarg = NonNullable<RawFile["carg"]>[number];

// Deputies are elected by proportion. Each party (or federation) wins one seat per
// full quotient of votes; leftover seats go to the highest averages (votes divided
// by seats already won, plus one). Inside each legenda the most-voted candidates
// win, but only those with at least 10% of the quotient. Computed on the votes
// counted so far, so it moves until the TSE publishes the final result.
function projectDeputies(carg: RawCarg): Set<string> {
  const seatsTotal = Number(carg.nv ?? 0);
  const quotient = Number((carg.qe ?? "0").replace(",", ".")) || 0;
  const elected = new Set<string>();
  if (!seatsTotal || !quotient) return elected;
  const legendas = (carg.agr ?? []).map((agr) => {
    const pars = agr.par ?? [];
    const votes = pars.reduce((sum, par) => sum + Number(par.tvtn ?? 0), 0);
    const candidates = pars.flatMap((par) => (par.cand ?? []).map((cand) => ({ id: cand.sqcand ?? "", votes: Number(cand.vap ?? 0) })));
    return { votes, candidates, seats: Math.floor(votes / quotient) };
  });
  let remaining = seatsTotal - legendas.reduce((sum, legenda) => sum + legenda.seats, 0);
  while (remaining > 0) {
    let best: (typeof legendas)[number] | null = null;
    let bestAverage = 0;
    for (const legenda of legendas) {
      const average = legenda.votes / (legenda.seats + 1);
      if (average > bestAverage) {
        bestAverage = average;
        best = legenda;
      }
    }
    if (!best) break;
    best.seats += 1;
    remaining -= 1;
  }
  for (const legenda of legendas) {
    legenda.candidates
      .filter((candidate) => candidate.votes >= quotient * 0.1)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, legenda.seats)
      .forEach((candidate) => candidate.id && elected.add(candidate.id));
  }
  return elected;
}

function parseRace(file: RawFile, office: string, election: string, scope: string): TseRace | null {
  // The TSE writes the office code as a number in some files and text in others.
  const carg = (file.carg ?? []).find((c) => String(c.cd) === office);
  if (!carg) return null;
  const projected = office === "6" || office === "7" ? projectDeputies(carg) : new Set<string>();
  const candidates: TseCandidate[] = (carg.agr ?? [])
    .flatMap((agr) => agr.par ?? [])
    .flatMap((par) =>
      (par.cand ?? []).map((cand) => ({
        name: formatName(cand.nmu ?? cand.nm ?? ""),
        party: par.sg ?? "",
        votes: Number(cand.vap ?? 0),
        pct: cand.pvap ?? "0,00",
        elected: (cand.st ?? "").startsWith("Eleito"),
        inRunoff: (cand.st ?? "").includes("2º"),
        irregular: cand.dvt && cand.dvt !== "Válido" ? cand.dvt : null,
        projected: projected.has(cand.sqcand ?? ""),
        photo: cand.sqcand ? `${BASE}/${election}/fotos/${scope}/${cand.sqcand}.jpeg` : null,
      }))
    )
    .sort((a, b) => b.votes - a.votes);

  // Brancos and nulos are shares of the voters who showed up; válidos is what is left.
  const total = Number(file.v?.tv ?? 0);
  const valid = Number(file.v?.vvc ?? 0);
  const blank = Number(file.v?.vb ?? 0);
  const nulls = Math.max(0, total - valid - blank);
  const electorate = Number(file.e?.te ?? 0);
  const abstained = Number(file.e?.a ?? Math.max(0, electorate - total));
  const totals: TseTotals | null =
    total > 0
      ? {
          valid: valid.toLocaleString("pt-BR"),
          validPct: percent(valid, total),
          blank: blank.toLocaleString("pt-BR"),
          blankPct: percent(blank, total),
          nulls: nulls.toLocaleString("pt-BR"),
          nullPct: percent(nulls, total),
          present: total.toLocaleString("pt-BR"),
          presentPct: percent(total, electorate),
          abstained: abstained.toLocaleString("pt-BR"),
          abstainedPct: percent(abstained, electorate),
          validVotes: valid,
        }
      : null;

  return {
    candidates,
    seats: Number(carg.nv ?? 0),
    sectionsPct: file.s?.pst ?? "0,00",
    totals,
    updatedAt: [file.dt, file.ht].filter(Boolean).join(" "),
    final: file.tf === "s",
  };
}

async function fetchJson(url: string): Promise<RawFile | null> {
  try {
    const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
    if (!res.ok) return null;
    return (await res.json()) as RawFile;
  } catch {
    return null;
  }
}

export async function getPresidentRace(): Promise<TseRace | null> {
  const file = await fetchJson(`${BASE}/${FEDERAL_ELECTION}/dados/br/br-c0001-e00${FEDERAL_ELECTION}-u.json`);
  return file ? parseRace(file, "1", FEDERAL_ELECTION, "br") : null;
}

// The presidential vote as counted in one state, for the state map.
export async function getPresidentRaceInState(uf: string): Promise<TseRace | null> {
  if (!UF_OPTIONS.some((option) => option.code === uf)) return null;
  const file = await fetchJson(`${BASE}/${FEDERAL_ELECTION}/dados/${uf}/${uf}-c0001-e00${FEDERAL_ELECTION}-u.json`);
  return file ? parseRace(file, "1", FEDERAL_ELECTION, uf) : null;
}

// Governor, senator and both kinds of deputy share the state-election folder;
// the office code (cd) in the file tells them apart: 3 governor, 5 senator,
// 6 federal deputy, 7 state deputy.
async function getStateElectionRace(uf: string, office: string): Promise<TseRace | null> {
  if (!UF_OPTIONS.some((option) => option.code === uf)) return null;
  const file = await fetchJson(`${BASE}/${STATE_ELECTION}/dados/${uf}/${uf}-c${office.padStart(4, "0")}-e00${STATE_ELECTION}-u.json`);
  return file ? parseRace(file, office, STATE_ELECTION, uf) : null;
}

export async function getGovernorRace(uf: string): Promise<TseRace | null> {
  return getStateElectionRace(uf, "3");
}

export async function getSenateRace(uf: string): Promise<TseRace | null> {
  return getStateElectionRace(uf, "5");
}

export async function getFederalDeputyRace(uf: string): Promise<TseRace | null> {
  return getStateElectionRace(uf, "6");
}

export async function getStateDeputyRace(uf: string): Promise<TseRace | null> {
  return getStateElectionRace(uf, "7");
}

export type RaceStatus = { kind: "elected"; names: string[] } | { kind: "runoff"; names: [string, string] } | { kind: "open" };

// Who has won, from the TSE's own "elected" flag. Only presidente and governador
// can go to a second round: a candidate needs more than half of the valid votes,
// so when the count is complete and nobody reached it, the top two run again.
// Senators and deputies have no runoff.
export function raceStatus(race: TseRace | null, hasRunoff: boolean): RaceStatus {
  if (!race || race.candidates.length === 0) return { kind: "open" };
  // Whoever the TSE marks as elected wins. A majority race is only decided in the
  // first round by the TSE's marking, or when the arithmetic leaves no doubt.
  const elected = race.candidates.filter((candidate) => candidate.elected);
  if (elected.length > 0) return { kind: "elected", names: elected.map((candidate) => candidate.name) };
  if (hasRunoff) {
    const flagged = race.candidates.filter((candidate) => candidate.inRunoff);
    if (flagged.length >= 2) return { kind: "runoff", names: [flagged[0].name, flagged[1].name] };
    if (race.candidates.length >= 2 && secondRoundOutlook(race).kind === "runoff") {
      return { kind: "runoff", names: [race.candidates[0].name, race.candidates[1].name] };
    }
  }
  return { kind: "open" };
}

export type Outlook = { kind: "decided"; name: string } | { kind: "runoff" } | { kind: "open" };

// The arithmetic of the count so far. The votes still to come are estimated from
// the share of sections counted, assuming the rest of the valid vote looks like
// what is in. A candidate is decided when even their current votes are over half
// of the estimated total; a runoff is certain when nobody can still reach half.
export function secondRoundOutlook(race: TseRace | null): Outlook {
  if (!race || !race.totals || race.candidates.length === 0) return { kind: "open" };
  const counted = Number(race.sectionsPct.replace(",", ".")) / 100;
  if (counted <= 0) return { kind: "open" };
  const validCounted = race.totals.validVotes;
  const estimatedTotal = validCounted / counted;
  const remaining = estimatedTotal - validCounted;
  const sure = race.candidates.find((candidate) => candidate.votes / estimatedTotal > 0.5);
  if (sure) return { kind: "decided", name: sure.name };
  const anyCanReachHalf = race.candidates.some((candidate) => (candidate.votes + remaining) / estimatedTotal > 0.5);
  return anyCanReachHalf ? { kind: "open" } : { kind: "runoff" };
}
