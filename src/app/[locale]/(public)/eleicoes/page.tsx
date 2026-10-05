import type { Metadata } from "next";
import {
  UF_OPTIONS,
  formatName,
  getFederalDeputyRace,
  getGovernorRace,
  getPresidentRace,
  getPresidentRaceInState,
  getSenateRace,
  getStateDeputyRace,
  partyColor,
  raceStatus,
  secondRoundOutlook,
  shortName,
  type RaceStatus,
  type TseCandidate,
  type TseRace,
  type TseTotals,
} from "@/lib/tse";
import { getBrazilMap, type BrazilMap } from "@/lib/brazil-map";
import { BrazilFlag } from "@/components/BrazilFlag";
import { BrazilStateMap, type MapLegendItem, type RunoffState, type StateWinner } from "@/components/BrazilStateMap";
import { ElectionTag } from "@/components/ElectionTag";
import { ElectionPopup, type PopupPerson } from "@/components/ElectionPopup";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eleições 2026 — apuração",
  description: "Apuração das eleições de 2026 com os dados oficiais do Tribunal Superior Eleitoral.",
};

// People & Growth's own colour. Candidates use their party's colour instead.
const BRAND = "#4361EE";
const CARGOS = ["presidente", "governador", "senado", "federal", "estadual"] as const;
type Cargo = (typeof CARGOS)[number];
const CARGO_LABEL: Record<Cargo, string> = {
  presidente: "Presidente",
  governador: "Governador",
  senado: "Senado",
  federal: "Câmara",
  estadual: "Assembleia",
};
const CARGO_EXPLAINED: Record<Cargo, string> = {
  presidente:
    "O que é o segundo turno? Se nenhum candidato passar de 50% dos votos válidos (brancos e nulos não contam), os dois mais votados disputam um segundo turno, em 25 de outubro de 2026.",
  governador:
    "O que é o segundo turno? Se nenhum candidato passar de 50% dos votos válidos (brancos e nulos não contam), os dois mais votados disputam um segundo turno, em 25 de outubro de 2026.",
  senado: "Senado: são eleitos os dois candidatos mais votados do estado. Não há segundo turno para senador.",
  federal:
    "Deputados não têm segundo turno. As vagas são divididas entre partidos e federações conforme os votos de cada legenda, e dentro de cada partido são eleitos os candidatos mais votados.",
  estadual:
    "Deputados não têm segundo turno. As vagas são divididas entre partidos e federações conforme os votos de cada legenda, e dentro de cada partido são eleitos os candidatos mais votados.",
};
const MAJORITY: Cargo[] = ["presidente", "governador"];

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1rem 1.125rem",
} as const;

function Photo({ src, size, color }: { src: string | null; size: number; color: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "0.375rem", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--site-surface-alt)", boxShadow: `0 0 0 2px ${color}` }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
    </div>
  );
}

// Deputies: who is elected by the TSE's flag, or, until the flags come out, who the
// proportional count puts in the seats so far.
function deputyList(race: TseRace): { list: TseCandidate[]; projected: boolean } {
  const elected = race.candidates.filter((candidate) => candidate.elected);
  if (elected.length > 0) return { list: elected, projected: false };
  return { list: race.candidates.filter((candidate) => candidate.projected), projected: true };
}

// The top two get "2º Turno" tags in a runoff; nobody is greyed out.
function SideCard({ title, race, status, uf, cargo }: { title: string; race: TseRace | null; status: RaceStatus; uf: string; cargo: Cargo }) {
  const isDeputy = cargo === "federal" || cargo === "estadual";
  const deputies = race && isDeputy ? deputyList(race) : null;
  const shown = deputies ? deputies.list : (race?.candidates ?? []);
  const runoff = status.kind === "runoff";
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--site-text)" }}>{title}</span>
        {race && (
          <span style={{ fontSize: "0.8125rem", color: "var(--site-muted)", whiteSpace: "nowrap" }}>
            {deputies ? `${shown.length} ${deputies.projected ? "projetados" : "eleitos"}` : `${race.sectionsPct}%`}
          </span>
        )}
      </div>
      {!race || race.candidates.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.875rem" }}>Resultados indisponíveis no momento.</p>
      ) : shown.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.875rem" }}>Nenhum eleito divulgado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {shown.slice(0, 3).map((candidate, index) => {
            const color = partyColor(candidate.party);
            return (
              <div key={`${candidate.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <Photo src={candidate.photo} size={44} color={color} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", minWidth: 0, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--site-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortName(candidate.name)}</span>
                    {candidate.elected && <ElectionTag kind="elected" color={color} />}
                    {!candidate.elected && deputies?.projected && <ElectionTag kind="projected" />}
                    {!candidate.elected && !deputies && runoff && index < 2 && <ElectionTag kind="runoff" />}
                  </div>
                  <div style={{ marginTop: "0.125rem" }}>
                    {isDeputy ? (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color, textTransform: "uppercase" }}>{candidate.party}</span>
                    ) : (
                      <span style={{ fontWeight: 800, fontSize: "0.875rem", color }}>{candidate.pct}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {race && race.candidates.length > 0 && (
        <a href={`?cargo=${cargo}&uf=${uf}`} style={{ display: "block", textAlign: "center", marginTop: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          {isDeputy ? "Ver todos" : "Apuração Completa"}
        </a>
      )}
    </div>
  );
}

function BigRow({ candidate, leading, runoff }: { candidate: TseCandidate; leading: boolean; runoff: boolean }) {
  const color = partyColor(candidate.party);
  return (
    <div style={{ padding: "0.875rem 0", borderTop: "1px solid var(--site-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <Photo src={candidate.photo} size={68} color={color} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: leading ? 800 : 600, fontSize: "1.0625rem", color: "var(--site-text)" }}>{formatName(candidate.name)}</span>
            {candidate.elected && <ElectionTag kind="elected" color={color} />}
            {!candidate.elected && runoff && <ElectionTag kind="runoff" />}
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color, textTransform: "uppercase", marginTop: "0.125rem" }}>{candidate.party}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.375rem", fontWeight: 800, color }}>{candidate.pct}%</div>
          <div style={{ fontSize: "0.75rem", color: "var(--site-muted)" }}>{candidate.votes.toLocaleString("pt-BR")} votos</div>
        </div>
      </div>
      <div style={{ height: "0.4375rem", borderRadius: "9999px", backgroundColor: "var(--site-border-strong)", overflow: "hidden", marginTop: "0.75rem" }}>
        <div style={{ width: `${Math.min(100, Number(candidate.pct.replace(",", ".")) || 0)}%`, height: "100%", backgroundColor: color }} />
      </div>
    </div>
  );
}

// Deputies: one line per person, no photo or bar, so hundreds of names stay readable.
function CompactRow({ candidate, projected }: { candidate: TseCandidate; projected: boolean }) {
  const color = partyColor(candidate.party);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0", borderTop: "1px solid var(--site-border)" }}>
      <Photo src={candidate.photo} size={36} color={color} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatName(candidate.name)}</span>
          {candidate.elected && <ElectionTag kind="elected" color={color} />}
          {!candidate.elected && projected && candidate.projected && <ElectionTag kind="projected" />}
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color, textTransform: "uppercase" }}>{candidate.party}</span>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>{candidate.votes.toLocaleString("pt-BR")} votos</div>
    </div>
  );
}

function StatusBanner({ status }: { status: RaceStatus }) {
  if (status.kind === "open") {
    return <p style={{ fontSize: "0.875rem", color: "var(--site-muted)", marginBottom: "0.75rem" }}>Apuração em andamento.</p>;
  }
  const text =
    status.kind === "elected"
      ? `${status.names.length > 1 ? "Eleitos" : "Eleito"}: ${status.names.map(formatName).join(" e ")}`
      : `Segundo turno: ${status.names.map(formatName).join(" x ")}`;
  return (
    <div style={{ padding: "0.75rem 1rem", borderRadius: "0.625rem", backgroundColor: `${BRAND}14`, color: BRAND, fontWeight: 800, fontSize: "0.9375rem", marginBottom: "0.75rem" }}>
      {text}
    </div>
  );
}

// The arithmetic of the count, shown next to the status for the majority races.
function OutlookLine({ race }: { race: TseRace }) {
  const outlook = secondRoundOutlook(race);
  const text =
    outlook.kind === "decided"
      ? `Vitória matematicamente garantida no 1º turno: ${formatName(outlook.name)}.`
      : outlook.kind === "runoff"
        ? "Segundo turno matematicamente garantido: ninguém mais consegue chegar a 50% dos votos válidos."
        : "Ainda é possível decidir no 1º turno.";
  return (
    <p style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)", marginBottom: "0.75rem" }}>
      {text} <span style={{ color: "var(--site-faint)" }}>(cálculo pelas seções apuradas)</span>
    </p>
  );
}

function TotalsGrid({ totals, title }: { totals: TseTotals; title: string }) {
  const items = [
    { label: "Votos válidos", value: totals.valid, pct: totals.validPct },
    { label: "Brancos", value: totals.blank, pct: totals.blankPct },
    { label: "Nulos", value: totals.nulls, pct: totals.nullPct },
    { label: "Comparecimento", value: totals.present, pct: totals.presentPct },
    { label: "Abstenção", value: totals.abstained, pct: totals.abstainedPct },
  ];
  return (
    <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "1rem" }}>Totais — {title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem 1.5rem" }}>
        {items.map(({ label, value, pct }) => (
          <div key={label}>
            <div style={{ fontSize: "0.8125rem", color: "var(--site-muted)" }}>{label}</div>
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginTop: "0.125rem" }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--site-faint)", marginTop: "0.125rem" }}>{pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainCard({ title, race, cargo, status }: { title: string; race: TseRace | null; cargo: Cargo; status: RaceStatus }) {
  const isDeputy = cargo === "federal" || cargo === "estadual";
  const runoff = status.kind === "runoff";
  return (
    <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h2>
        {race && <span style={{ fontSize: "0.875rem", color: "var(--site-muted)" }}>{race.sectionsPct}% urnas apuradas</span>}
      </div>

      <p style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "0.625rem", backgroundColor: "var(--site-surface-alt)", fontSize: "0.8125rem", lineHeight: 1.55, color: "var(--site-text-secondary)" }}>
        {CARGO_EXPLAINED[cargo]}
      </p>

      {!race || race.candidates.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.9rem", padding: "1rem 0" }}>Resultados indisponíveis no momento.</p>
      ) : isDeputy ? (
        <DeputyBody race={race} />
      ) : (
        <>
          <StatusBanner status={status} />
          {MAJORITY.includes(cargo) && <OutlookLine race={race} />}
          {race.candidates.slice(0, 5).map((candidate, index) => (
            <BigRow key={`${candidate.name}-${index}`} candidate={candidate} leading={index === 0} runoff={runoff && index < 2} />
          ))}
          {race.candidates.length > 5 && (
            <details style={{ borderTop: "1px solid var(--site-border)" }}>
              <summary style={{ cursor: "pointer", textAlign: "center", padding: "0.875rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", listStyle: "none" }}>
                Todos os candidatos ({race.candidates.length}) ⌄
              </summary>
              {race.candidates.slice(5).map((candidate, index) => (
                <BigRow key={`${candidate.name}-rest-${index}`} candidate={candidate} leading={false} runoff={false} />
              ))}
            </details>
          )}
        </>
      )}
    </div>
  );
}

function DeputyBody({ race }: { race: TseRace }) {
  const { list, projected } = deputyList(race);
  return (
    <>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-text)", margin: "0.25rem 0" }}>
        {projected ? `Projetados (${list.length} de ${race.seats} vagas)` : `Eleitos (${list.length})`}
      </h3>
      {projected && (
        <p style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)", marginBottom: "0.5rem" }}>
          Pela regra proporcional, com os votos apurados até agora. Muda até o resultado final, quando o TSE publica os eleitos.
        </p>
      )}
      {list.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.5rem 0" }}>Nenhum eleito divulgado ainda.</p>
      ) : (
        list.map((candidate, index) => <CompactRow key={`${candidate.name}-${index}`} candidate={candidate} projected={projected} />)
      )}
      <details style={{ marginTop: "1rem", borderTop: "1px solid var(--site-border)" }}>
        <summary style={{ cursor: "pointer", textAlign: "center", padding: "0.875rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", listStyle: "none" }}>
          Mais votados ({Math.min(50, race.candidates.length)} de {race.candidates.length}) ⌄
        </summary>
        {race.candidates.slice(0, 50).map((candidate, index) => (
          <CompactRow key={`${candidate.name}-top-${index}`} candidate={candidate} projected={false} />
        ))}
      </details>
    </>
  );
}

// Each state's result for the map: colour of the leader's party, a tooltip with first
// and second place, and whether the state is headed to a runoff.
function stateMapData(races: [string, TseRace | null][]): { winners: Record<string, StateWinner>; runoffStates: RunoffState[]; legend: MapLegendItem[] } {
  const winners: Record<string, StateWinner> = {};
  const runoffStates: RunoffState[] = [];
  const legend = new Map<string, MapLegendItem>();
  for (const [uf, race] of races) {
    const top = race?.candidates[0];
    if (!race || !top) continue;
    const second = race.candidates[1];
    const status = raceStatus(race, true);
    const runoff = status.kind === "runoff";
    const outcome = status.kind === "elected" ? `Eleito: ${formatName(status.names[0])}` : runoff ? "2º turno" : "em apuração";
    const detail = `1º ${formatName(top.name)} (${top.party}) ${top.pct}%${second ? ` · 2º ${formatName(second.name)} (${second.party}) ${second.pct}%` : ""}`;
    const color = partyColor(top.party);
    winners[uf] = { color, label: `${detail} — ${outcome}`, runoff };
    if (!legend.has(top.party)) legend.set(top.party, { color, label: `${top.party} · ${formatName(top.name)}` });
    if (runoff && second) runoffStates.push({ uf, text: `${formatName(top.name)} x ${formatName(second.name)}` });
  }
  return { winners, runoffStates, legend: [...legend.values()] };
}

export default async function EleicoesPage({ searchParams }: { searchParams: Promise<{ uf?: string; cargo?: string }> }) {
  const { uf: requestedUf, cargo: requestedCargo } = await searchParams;
  const uf = UF_OPTIONS.some((option) => option.code === requestedUf) ? (requestedUf as string) : "sp";
  const cargo: Cargo = CARGOS.includes(requestedCargo as Cargo) ? (requestedCargo as Cargo) : "presidente";
  const [president, governor, senate, federal, state] = await Promise.all([
    getPresidentRace(),
    getGovernorRace(uf),
    getSenateRace(uf),
    getFederalDeputyRace(uf),
    getStateDeputyRace(uf),
  ]);
  const stateName = UF_OPTIONS.find((option) => option.code === uf)?.name ?? "";

  const races: Record<Cargo, { title: string; race: TseRace | null; status: RaceStatus }> = {
    presidente: { title: "Presidente", race: president, status: raceStatus(president, true) },
    governador: { title: `Governador — ${stateName}`, race: governor, status: raceStatus(governor, true) },
    senado: { title: `Senado — ${stateName}`, race: senate, status: raceStatus(senate, false) },
    federal: { title: `Câmara dos deputados — ${stateName}`, race: federal, status: raceStatus(federal, false) },
    estadual: { title: `Assembleia legislativa — ${stateName}`, race: state, status: raceStatus(state, false) },
  };
  const others = CARGOS.filter((option) => option !== cargo);
  const totals = races[cargo].race?.totals ?? null;
  const updated = president?.updatedAt ?? governor?.updatedAt ?? "";

  // Pop-up with who was elected, or who is in the runoff, for the race on screen.
  const current = races[cargo];
  let popup: { title: string; subtitle: string; people: PopupPerson[] } | null = null;
  if (current.race && (cargo === "presidente" || cargo === "governador" || cargo === "senado")) {
    const race = current.race;
    if (current.status.kind === "elected") {
      popup = {
        title: CARGO_LABEL[cargo],
        subtitle: cargo === "presidente" ? "Brasil" : stateName,
        people: race.candidates.filter((c) => c.elected).map((c) => ({ name: formatName(c.name), party: c.party, color: partyColor(c.party), photo: c.photo, tag: "elected" as const })),
      };
    } else if (current.status.kind === "runoff") {
      popup = {
        title: CARGO_LABEL[cargo],
        subtitle: cargo === "presidente" ? "Segundo turno — Brasil" : `Segundo turno — ${stateName}`,
        people: race.candidates.slice(0, 2).map((c) => ({ name: formatName(c.name), party: c.party, color: partyColor(c.party), photo: c.photo, tag: "runoff" as const })),
      };
    }
  }

  // The map is drawn for presidente and governador, state by state.
  let map: BrazilMap | null = null;
  let mapData: ReturnType<typeof stateMapData> | null = null;
  if (cargo === "presidente" || cargo === "governador") {
    const ufs = UF_OPTIONS.map((option) => option.code);
    const [brazilMap, perState] = await Promise.all([
      getBrazilMap(),
      Promise.all(ufs.map(async (code) => [code, cargo === "presidente" ? await getPresidentRaceInState(code) : await getGovernorRace(code)] as [string, TseRace | null])),
    ]);
    map = brazilMap;
    mapData = stateMapData(perState);
  }

  return (
    <section className="section-padding eleicoes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "1180px" }}>
        <header style={{ borderBottom: `2px solid ${BRAND}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ color: BRAND, fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Eleições 2026</div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)" }}>
            <BrazilFlag width={40} />
            <span>Apuração das eleições</span>
          </h1>
          {updated && <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", marginTop: "0.375rem" }}>Atualizado em {updated}</p>}
        </header>

        <nav style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {CARGOS.map((option) => (
            <a
              key={option}
              href={`?cargo=${option}&uf=${uf}`}
              aria-current={option === cargo ? "page" : undefined}
              style={{
                padding: "0.5rem 1.125rem",
                borderRadius: "0.5rem",
                border: `1px solid ${option === cargo ? BRAND : "var(--site-border-strong)"}`,
                color: option === cargo ? BRAND : "var(--site-text-secondary)",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              {CARGO_LABEL[option]}
            </a>
          ))}
        </nav>

        <div className="eleicoes-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "1.5rem", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {cargo !== "presidente" && (
              <form method="get" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="hidden" name="cargo" value={cargo} />
                <label htmlFor="uf" style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--site-text)" }}>Estado</label>
                <select id="uf" name="uf" defaultValue={uf} style={{ padding: "0.375rem 0.5rem", borderRadius: "0.5rem", border: "1px solid var(--site-border-strong)", backgroundColor: "var(--site-card)", color: "var(--site-text)" }}>
                  {UF_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button type="submit" style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "none", backgroundColor: BRAND, color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                  Ver
                </button>
              </form>
            )}
            <MainCard title={current.title} race={current.race} cargo={cargo} status={current.status} />
            {totals && <TotalsGrid totals={totals} title={current.title} />}
            {map && mapData && Object.keys(mapData.winners).length > 0 && (
              <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.25rem" }}>
                  {cargo === "presidente" ? "Vencedor por estado — Presidente" : "Vencedor por estado — Governador"}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--site-muted)", marginBottom: "1rem" }}>Passe o cursor em cada estado para ver o 1º e o 2º colocados.</p>
                <BrazilStateMap map={map} winners={mapData.winners} legend={mapData.legend} runoffStates={mapData.runoffStates} />
              </div>
            )}
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {others.map((option) => (
              <SideCard key={option} title={races[option].title} race={races[option].race} status={races[option].status} uf={uf} cargo={option} />
            ))}
          </aside>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>
          Fonte: Tribunal Superior Eleitoral (TSE), dados públicos de apuração. Malha dos estados: IBGE.
        </p>
      </div>

      {popup && <ElectionPopup storageKey={`eleicoes-popup-${cargo}-${uf}`} title={popup.title} subtitle={popup.subtitle} people={popup.people} />}

      <style>{`
        body:has(.eleicoes-page) .category-nav,
        body:has(.eleicoes-page) .social-sidebar { display: none !important; }
        @media (max-width: 860px) {
          .eleicoes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
