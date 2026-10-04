"use client";

import { useEffect, useState } from "react";
import { UF_OPTIONS, type TseRace } from "@/lib/tse";

type Payload = { uf: string; president: TseRace | null; governor: TseRace | null };

function RaceRows({ race, limit }: { race: TseRace; limit: number }) {
  const top = race.candidates.slice(0, limit);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {top.map((candidate, index) => {
        const width = Math.min(100, Number(candidate.pct.replace(",", ".")) || 0);
        return (
          <div key={`${candidate.name}-${index}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--site-text)", fontWeight: index === 0 ? 800 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {candidate.name}
                <span style={{ color: "var(--site-faint)", fontWeight: 500, marginLeft: "0.375rem", fontSize: "0.75rem" }}>{candidate.party}</span>
              </span>
              <span style={{ color: "#4361EE", fontWeight: 800, flexShrink: 0 }}>{candidate.pct}%</span>
            </div>
            <div style={{ height: "0.375rem", borderRadius: "9999px", backgroundColor: "var(--site-border)", overflow: "hidden", marginTop: "0.25rem" }}>
              <div style={{ width: `${width}%`, height: "100%", backgroundColor: index === 0 ? "#4361EE" : "var(--site-faint)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ElectionResults({ initial, locale }: { initial: Payload; locale: string }) {
  const [data, setData] = useState<Payload>(initial);
  const [uf, setUf] = useState(initial.uf);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(`/api/tse/resultados?uf=${uf}`, { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as Payload;
        if (!cancelled) setData(next);
      } catch {
        // Keep showing the last numbers if a refresh fails.
      }
    }
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [uf]);

  const { president, governor } = data;
  const updated = president?.updatedAt ?? governor?.updatedAt ?? "";
  const stateName = UF_OPTIONS.find((option) => option.code === uf)?.name ?? "";

  return (
    <section style={{ borderRadius: "1rem", border: "1px solid var(--site-border)", backgroundColor: "var(--site-surface)", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Eleições 2026 · apuração
        </h2>
        <a href={`/${locale}/eleicoes?uf=${uf}`} style={{ color: "#4361EE", fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>
          apuração completa →
        </a>
      </div>

      <div className="election-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-muted)", marginBottom: "0.75rem" }}>Presidente</div>
          {president && president.candidates.length > 0 ? (
            <>
              <RaceRows race={president} limit={4} />
              <div style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "0.75rem" }}>{president.sectionsPct}% das seções apuradas</div>
            </>
          ) : (
            <div style={{ fontSize: "0.875rem", color: "var(--site-faint)" }}>Resultados indisponíveis no momento.</div>
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-muted)" }}>Governador</span>
            <select
              value={uf}
              onChange={(event) => setUf(event.target.value)}
              aria-label="Estado"
              style={{ fontSize: "0.8125rem", fontWeight: 600, padding: "0.25rem 0.5rem", borderRadius: "0.5rem", border: "1px solid var(--site-border)", backgroundColor: "var(--site-surface-alt)", color: "var(--site-text)" }}
            >
              {UF_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          {governor && governor.candidates.length > 0 ? (
            <>
              <RaceRows race={governor} limit={3} />
              <div style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "0.75rem" }}>
                {stateName} · {governor.sectionsPct}% das seções apuradas
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.875rem", color: "var(--site-faint)" }}>Resultados indisponíveis no momento.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--site-border)", fontSize: "0.7rem", color: "var(--site-faint)" }}>
        <span>Fonte: Tribunal Superior Eleitoral (TSE)</span>
        {updated && <span>Atualizado em {updated}</span>}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .election-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
