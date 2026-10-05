import { UF_OPTIONS, formatName, partyColor, shortName, type RaceStatus, type TseRace } from "@/lib/tse";
import { ElectionTag } from "@/components/ElectionTag";

const BRAND = "#4361EE";

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1.25rem 1.5rem",
} as const;

export type StateRow = { uf: string; race: TseRace | null; status: RaceStatus };

function ufName(uf: string): string {
  return UF_OPTIONS.find((option) => option.code === uf)?.name ?? uf.toUpperCase();
}

// One line per state: the leader and the second place, each with its party colour.
// A state in a runoff shows both finalists at full strength, with a "2º Turno" tag.
export function StateResultsList({ title, subtitle, rows }: { title: string; subtitle?: string; rows: StateRow[] }) {
  const ordered = [...rows].sort((a, b) => ufName(a.uf).localeCompare(ufName(b.uf), "pt-BR"));
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h3>
      {subtitle && <p style={{ fontSize: "0.8125rem", color: "var(--site-muted)", marginTop: "0.25rem" }}>{subtitle}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "1rem" }}>
        {ordered.map(({ uf, race, status }) => {
          const top = race?.candidates[0];
          const second = race?.candidates[1];
          return (
            <div key={uf} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "0.875rem", borderBottom: "1px solid var(--site-border)" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--site-text)" }}>{ufName(uf)}</div>
                <div style={{ marginTop: "0.25rem" }}>
                  {status.kind === "elected" && <ElectionTag kind="elected" />}
                  {status.kind === "runoff" && <ElectionTag kind="runoff" />}
                </div>
              </div>
              {!top ? (
                <div style={{ fontSize: "0.8125rem", color: "var(--site-faint)" }}>Resultado indisponível</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {[top, second].filter(Boolean).map((candidate, index) => {
                    const color = partyColor(candidate!.party);
                    const width = Math.min(100, Number(candidate!.pct.replace(",", ".")) || 0);
                    return (
                      <div key={`${uf}-${index}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.8125rem" }}>
                          <span style={{ color: "var(--site-text)", fontWeight: index === 0 ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {shortName(candidate!.name)} <span style={{ color: "var(--site-muted)", fontSize: "0.7rem" }}>{candidate!.party}</span>
                          </span>
                          <span style={{ color, fontWeight: 800, flexShrink: 0 }}>{candidate!.pct}%</span>
                        </div>
                        <div style={{ height: "0.4375rem", borderRadius: "9999px", backgroundColor: "var(--site-border-strong)", overflow: "hidden", marginTop: "0.25rem" }}>
                          <div style={{ width: `${width}%`, height: "100%", backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Governors: how many states were decided in the first round, how many go to a runoff,
// and which parties won or are in one.
export function GovernorSummary({ rows }: { rows: StateRow[] }) {
  const elected = rows.filter((row) => row.status.kind === "elected");
  const runoff = rows.filter((row) => row.status.kind === "runoff");
  const open = rows.length - elected.length - runoff.length;
  const byParty = new Map<string, { elected: number; runoff: number; color: string }>();
  const bump = (party: string, key: "elected" | "runoff") => {
    const entry = byParty.get(party) ?? { elected: 0, runoff: 0, color: partyColor(party) };
    entry[key] += 1;
    byParty.set(party, entry);
  };
  for (const row of elected) {
    const winner = row.race?.candidates.find((candidate) => candidate.elected);
    if (winner) bump(winner.party, "elected");
  }
  for (const row of runoff) {
    for (const finalist of row.race?.candidates.filter((candidate) => candidate.inRunoff).slice(0, 2) ?? []) bump(finalist.party, "runoff");
  }
  const parties = [...byParty.entries()].sort((a, b) => b[1].elected + b[1].runoff - (a[1].elected + a[1].runoff));
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)" }}>Governadores</h3>
      <p style={{ fontSize: "0.9375rem", color: "var(--site-text-secondary)", margin: "0.5rem 0 1rem" }}>
        <strong style={{ color: "var(--site-text)" }}>{elected.length}</strong> estados elegeram governador no 1º turno e{" "}
        <strong style={{ color: "var(--site-text)" }}>{runoff.length}</strong> terão disputa de 2º turno.
        {open > 0 && <> {open} ainda em apuração.</>}
      </p>
      <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--site-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
        Eleitos e disputas de 2º turno por partido
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {parties.map(([party, entry]) => (
          <div key={party} style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <span style={{ minWidth: "5.5rem", fontWeight: 800, fontSize: "0.8125rem", color: entry.color }}>{party}</span>
            {entry.elected > 0 && <span style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>{entry.elected} eleito(s)</span>}
            {entry.runoff > 0 && <span style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>{entry.runoff} em 2º turno</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// National count of elected people per party, as bars. Used for the Senado, the
// Câmara and the Assembleia.
export function PartyBars({ title, subtitle, items, note }: { title: string; subtitle: string; items: { party: string; count: number }[]; note?: string }) {
  const sorted = [...items].filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count ?? 1;
  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--site-muted)", marginTop: "0.25rem" }}>{subtitle}</p>
      {note && <p style={{ fontSize: "0.8125rem", color: BRAND, fontWeight: 700, marginTop: "0.5rem" }}>{note}</p>}
      {sorted.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--site-faint)", marginTop: "1rem" }}>Nenhum eleito divulgado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {sorted.map((item) => {
            const color = partyColor(item.party);
            return (
              <div key={item.party}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 800, color }}>{item.party}</span>
                  <span style={{ fontWeight: 800, color: "var(--site-text)" }}>{item.count}</span>
                </div>
                <div style={{ height: "0.5rem", borderRadius: "9999px", backgroundColor: "var(--site-border-strong)", overflow: "hidden", marginTop: "0.25rem" }}>
                  <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", backgroundColor: color }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>Total de {total} eleitos contados até agora.</div>
        </div>
      )}
    </div>
  );
}
