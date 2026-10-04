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

export type TseCandidate = { name: string; party: string; votes: number; pct: string; elected: boolean; photo: string | null };

export type TseTotals = { valid: string; validPct: string; blank: string; blankPct: string; nulls: string; nullPct: string };

export type TseRace = {
  candidates: TseCandidate[];
  sectionsPct: string;
  totals: TseTotals | null;
  updatedAt: string;
  final: boolean;
};

type RawCandidate = { sqcand?: string; nmu?: string; nm?: string; vap?: string; pvap?: string; e?: string };

type RawFile = {
  tf?: string;
  dt?: string;
  ht?: string;
  tv?: string;
  vvc?: string;
  vb?: string;
  s?: { pst?: string };
  carg?: { cd: string | number; agr?: { par?: { sg?: string; cand?: RawCandidate[] }[] }[] }[];
};

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

function parseRace(file: RawFile, office: string, election: string, scope: string): TseRace | null {
  // The TSE writes the office code as a number in some files and text in others.
  const carg = (file.carg ?? []).find((c) => String(c.cd) === office);
  if (!carg) return null;
  const candidates: TseCandidate[] = (carg.agr ?? [])
    .flatMap((agr) => agr.par ?? [])
    .flatMap((par) =>
      (par.cand ?? []).map((cand) => ({
        name: formatName(cand.nmu ?? cand.nm ?? ""),
        party: par.sg ?? "",
        votes: Number(cand.vap ?? 0),
        pct: cand.pvap ?? "0,00",
        elected: cand.e === "s",
        photo: cand.sqcand ? `${BASE}/${election}/fotos/${scope}/${cand.sqcand}.jpeg` : null,
      }))
    )
    .sort((a, b) => b.votes - a.votes);

  const total = Number(file.tv ?? 0);
  const valid = Number(file.vvc ?? 0);
  const blank = Number(file.vb ?? 0);
  const nulls = Math.max(0, total - valid - blank);
  const totals: TseTotals | null =
    total > 0
      ? {
          valid: valid.toLocaleString("pt-BR"),
          validPct: percent(valid, total),
          blank: blank.toLocaleString("pt-BR"),
          blankPct: percent(blank, total),
          nulls: nulls.toLocaleString("pt-BR"),
          nullPct: percent(nulls, total),
        }
      : null;

  return {
    candidates,
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

export async function getGovernorRace(uf: string): Promise<TseRace | null> {
  if (!UF_OPTIONS.some((option) => option.code === uf)) return null;
  const file = await fetchJson(`${BASE}/${STATE_ELECTION}/dados/${uf}/${uf}-c0003-e00${STATE_ELECTION}-u.json`);
  return file ? parseRace(file, "3", STATE_ELECTION, uf) : null;
}

export async function getSenateRace(uf: string): Promise<TseRace | null> {
  if (!UF_OPTIONS.some((option) => option.code === uf)) return null;
  const file = await fetchJson(`${BASE}/${STATE_ELECTION}/dados/${uf}/${uf}-c0005-e00${STATE_ELECTION}-u.json`);
  return file ? parseRace(file, "5", STATE_ELECTION, uf) : null;
}
