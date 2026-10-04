import type { Metadata } from "next";
import { UF_OPTIONS, getGovernorRace, getPresidentRace, type TseRace } from "@/lib/tse";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eleições 2026 — apuração",
  description: "Apuração das eleições de 2026 com os dados oficiais do Tribunal Superior Eleitoral.",
};

function ResultTable({ race, title }: { race: TseRace | null; title: string }) {
  return (
    <section style={{ borderRadius: "1rem", border: "1px solid var(--site-border)", backgroundColor: "var(--site-surface)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)" }}>{title}</h2>
        {race && <span style={{ fontSize: "0.8125rem", color: "var(--site-muted)" }}>{race.sectionsPct}% das seções apuradas</span>}
      </div>
      {!race || race.candidates.length === 0 ? (
        <p style={{ color: "var(--site-faint)", fontSize: "0.9rem" }}>Resultados indisponíveis no momento.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--site-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <th style={{ padding: "0.5rem 0.25rem" }}>Candidato</th>
                <th style={{ padding: "0.5rem 0.25rem" }}>Partido</th>
                <th style={{ padding: "0.5rem 0.25rem", textAlign: "right" }}>Votos</th>
                <th style={{ padding: "0.5rem 0.25rem", textAlign: "right" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {race.candidates.map((candidate, index) => (
                <tr key={`${candidate.name}-${index}`} style={{ borderTop: "1px solid var(--site-border)" }}>
                  <td style={{ padding: "0.6rem 0.25rem", color: "var(--site-text)", fontWeight: index === 0 ? 800 : 600 }}>{candidate.name}</td>
                  <td style={{ padding: "0.6rem 0.25rem", color: "var(--site-muted)" }}>{candidate.party}</td>
                  <td style={{ padding: "0.6rem 0.25rem", textAlign: "right", color: "var(--site-text-secondary)" }}>{candidate.votes.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.6rem 0.25rem", textAlign: "right", color: "#4361EE", fontWeight: 800 }}>{candidate.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function EleicoesPage({ searchParams }: { searchParams: Promise<{ uf?: string }> }) {
  const { uf: requested } = await searchParams;
  const uf = UF_OPTIONS.some((option) => option.code === requested) ? (requested as string) : "sp";
  const [president, governor] = await Promise.all([getPresidentRace(), getGovernorRace(uf)]);
  const stateName = UF_OPTIONS.find((option) => option.code === uf)?.name ?? "";
  const updated = president?.updatedAt ?? governor?.updatedAt ?? "";

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "900px" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "0.5rem" }}>Eleições 2026 — apuração</h1>
        <p style={{ color: "var(--site-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Resultados oficiais do Tribunal Superior Eleitoral, atualizados a cada minuto{updated ? `. Última atualização: ${updated}.` : "."}
        </p>

        <ResultTable race={president} title="Presidente" />

        <form method="get" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <label htmlFor="uf" style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--site-text)" }}>Governador de</label>
          <select id="uf" name="uf" defaultValue={uf} style={{ padding: "0.375rem 0.5rem", borderRadius: "0.5rem", border: "1px solid var(--site-border)", backgroundColor: "var(--site-surface)", color: "var(--site-text)" }}>
            {UF_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
          <button type="submit" style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#4361EE", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Ver</button>
        </form>
        <ResultTable race={governor} title={`Governador — ${stateName}`} />

        <p style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>Fonte: Tribunal Superior Eleitoral (TSE), dados públicos de apuração.</p>
      </div>
    </section>
  );
}
