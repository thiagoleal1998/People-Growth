import type { Metadata } from "next";
import { UF_OPTIONS, formatName, getGovernorRace, getPresidentRace, getSenateRace, partyColor, shortName, type TseCandidate, type TseRace } from "@/lib/tse";
import { BrazilFlag } from "@/components/BrazilFlag";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eleições 2026 — apuração",
  description: "Apuração das eleições de 2026 com os dados oficiais do Tribunal Superior Eleitoral.",
};

// People & Growth's own colour. Candidates use their party's colour instead.
const BRAND = "#4361EE";
const CARGOS = ["presidente", "governador", "senado"] as const;
type Cargo = (typeof CARGOS)[number];
const CARGO_LABEL: Record<Cargo, string> = { presidente: "Presidente", governador: "Governador", senado: "Senado" };

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

function SideCard({ title, race, uf, cargo }: { title: string; race: TseRace | null; uf: string; cargo: Cargo }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--site-text)" }}>{title}</span>
        {race && <span style={{ fontSize: "0.8125rem", color: "var(--site-muted)" }}>{race.sectionsPct}%</span>}
      </div>
      {!race || race.candidates.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.875rem" }}>Resultados indisponíveis no momento.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {race.candidates.slice(0, 3).map((candidate, index) => {
              const color = partyColor(candidate.party);
              return (
                <div key={`${candidate.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.625rem", opacity: index === 0 ? 1 : 0.7 }}>
                  <Photo src={candidate.photo} size={44} color={color} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: index === 0 ? 700 : 500, color: "var(--site-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {shortName(candidate.name)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.125rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.875rem", color }}>{candidate.pct}%</span>
                      {candidate.elected && (
                        <span style={{ backgroundColor: color, color: "white", borderRadius: "0.25rem", padding: "0.0625rem 0.375rem", fontSize: "0.6875rem", fontWeight: 700 }}>Eleito</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <a href={`?cargo=${cargo}&uf=${uf}`} style={{ display: "block", textAlign: "center", marginTop: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
            Apuração Completa
          </a>
        </>
      )}
    </div>
  );
}

function BigRow({ candidate, leading }: { candidate: TseCandidate; leading: boolean }) {
  const color = partyColor(candidate.party);
  return (
    <div style={{ padding: "0.875rem 0", borderTop: "1px solid var(--site-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <Photo src={candidate.photo} size={68} color={color} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: leading ? 800 : 600, fontSize: "1.0625rem", color: "var(--site-text)" }}>{formatName(candidate.name)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color, textTransform: "uppercase" }}>{candidate.party}</span>
            {candidate.elected && (
              <span style={{ backgroundColor: color, color: "white", borderRadius: "0.25rem", padding: "0.0625rem 0.4375rem", fontSize: "0.6875rem", fontWeight: 700 }}>Eleito</span>
            )}
          </div>
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

function MainCard({ title, race }: { title: string; race: TseRace | null }) {
  return (
    <div style={{ ...cardStyle, padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h2>
        {race && <span style={{ fontSize: "0.875rem", color: "var(--site-muted)" }}>{race.sectionsPct}% urnas apuradas</span>}
      </div>

      {!race || race.candidates.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.9rem", padding: "1rem 0" }}>Resultados indisponíveis no momento.</p>
      ) : (
        <>
          {race.candidates.slice(0, 5).map((candidate, index) => (
            <BigRow key={`${candidate.name}-${index}`} candidate={candidate} leading={index === 0} />
          ))}
          {race.candidates.length > 5 && (
            <details style={{ borderTop: "1px solid var(--site-border)" }}>
              <summary style={{ cursor: "pointer", textAlign: "center", padding: "0.875rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", listStyle: "none" }}>
                Todos os candidatos ({race.candidates.length}) ⌄
              </summary>
              {race.candidates.slice(5).map((candidate, index) => (
                <BigRow key={`${candidate.name}-rest-${index}`} candidate={candidate} leading={false} />
              ))}
            </details>
          )}
          {race.totals && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "1rem", padding: "1rem", borderRadius: "0.625rem", backgroundColor: "var(--site-surface-alt)", textAlign: "center" }}>
              {[
                { label: "Brancos", value: race.totals.blank, pct: race.totals.blankPct },
                { label: "Nulos", value: race.totals.nulls, pct: race.totals.nullPct },
                { label: "Válidos", value: race.totals.valid, pct: race.totals.validPct },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.75rem", color: "var(--site-muted)" }}>{label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)", marginTop: "0.125rem" }}>{value}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-text)", marginTop: "0.125rem" }}>{pct}%</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function EleicoesPage({ searchParams }: { searchParams: Promise<{ uf?: string; cargo?: string }> }) {
  const { uf: requestedUf, cargo: requestedCargo } = await searchParams;
  const uf = UF_OPTIONS.some((option) => option.code === requestedUf) ? (requestedUf as string) : "sp";
  const cargo: Cargo = CARGOS.includes(requestedCargo as Cargo) ? (requestedCargo as Cargo) : "presidente";
  const [president, governor, senate] = await Promise.all([getPresidentRace(), getGovernorRace(uf), getSenateRace(uf)]);
  const stateName = UF_OPTIONS.find((option) => option.code === uf)?.name ?? "";

  const races: Record<Cargo, { title: string; race: TseRace | null }> = {
    presidente: { title: "Presidente", race: president },
    governador: { title: `Governador — ${stateName}`, race: governor },
    senado: { title: `Senado — ${stateName}`, race: senate },
  };
  const others = CARGOS.filter((option) => option !== cargo);
  const updated = president?.updatedAt ?? governor?.updatedAt ?? "";

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
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
          <div>
            {cargo !== "presidente" && (
              <form method="get" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
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
            <MainCard title={races[cargo].title} race={races[cargo].race} />
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {others.map((option) => (
              <SideCard key={option} title={races[option].title} race={races[option].race} uf={uf} cargo={option} />
            ))}
          </aside>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "1.5rem" }}>
          Fonte: Tribunal Superior Eleitoral (TSE), dados públicos de apuração. Câmara e Assembleia ainda não estão nesta página.
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .eleicoes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
