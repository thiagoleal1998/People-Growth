// Official 2026 election results published by the TSE as public JSON files
// (https://resultados.tse.jus.br). Ids are the ones in the TSE's own
// configuration file: 6257 is the federal election (president), 6259 the state
// election (governors). The TSE asks for no more than 100 requests per second
// per IP, so results are fetched on the server and cached for a minute.

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

export type TseCandidate = { name: string; party: string; votes: number; pct: string; elected: boolean };

export type TseRace = {
  candidates: TseCandidate[];
  sectionsPct: string;
  updatedAt: string;
  final: boolean;
};

type RawFile = {
  tf?: string;
  dt?: string;
  ht?: string;
  s?: { pst?: string };
  carg?: { cd: string | number; agr?: { par?: { sg?: string; cand?: { nmu?: string; nm?: string; vap?: string; pvap?: string; e?: string }[] }[] }[] }[];
};

function parseRace(file: RawFile, office: "1" | "3"): TseRace | null {
  // The TSE writes the office code as a number in some files and text in others.
  const carg = (file.carg ?? []).find((c) => String(c.cd) === office);
  if (!carg) return null;
  const candidates: TseCandidate[] = (carg.agr ?? [])
    .flatMap((agr) => agr.par ?? [])
    .flatMap((par) => (par.cand ?? []).map((cand) => ({ name: cand.nmu ?? cand.nm ?? "", party: par.sg ?? "", votes: Number(cand.vap ?? 0), pct: cand.pvap ?? "0,00", elected: cand.e === "s" })))
    .sort((a, b) => b.votes - a.votes);
  return {
    candidates,
    sectionsPct: file.s?.pst ?? "0,00",
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
  return file ? parseRace(file, "1") : null;
}

export async function getGovernorRace(uf: string): Promise<TseRace | null> {
  if (!UF_OPTIONS.some((option) => option.code === uf)) return null;
  const file = await fetchJson(`${BASE}/${STATE_ELECTION}/dados/${uf}/${uf}-c0003-e00${STATE_ELECTION}-u.json`);
  return file ? parseRace(file, "3") : null;
}
