"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { UF_OPTIONS, formatName, partyColor, raceStatus, shortName, type RaceStatus, type TseCandidate, type TseRace } from "@/lib/tse";
import { BrazilFlag } from "@/components/BrazilFlag";
import { ElectionTag } from "@/components/ElectionTag";

type Payload = { uf: string; president: TseRace | null; governor: TseRace | null; senate: TseRace | null };
type SideTab = "governor" | "senate";

// People & Growth's own colour. Candidates use their party's colour instead.
const BRAND = "#4361EE";

function CandidatePhoto({ src, color }: { src: string | null; color: string }) {
  return (
    <div className="election-photo" style={{ width: "3.5rem", height: "3.5rem", borderRadius: "0.375rem", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--site-surface-alt)", boxShadow: `0 0 0 2px ${color}` }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
    </div>
  );
}

// Nobody is greyed out: in a runoff both finalists keep their full colour and carry a "2º Turno" tag.
function CandidateItem({ candidate, runoff }: { candidate: TseCandidate; runoff: boolean }) {
  const color = partyColor(candidate.party);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0, flex: "1 1 0" }}>
      <CandidatePhoto src={candidate.photo} color={color} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", minWidth: 0, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--site-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortName(candidate.name)}</span>
          {candidate.elected && <ElectionTag kind="elected" color={color} />}
          {!candidate.elected && runoff && <ElectionTag kind="runoff" />}
        </div>
        <div style={{ marginTop: "0.125rem" }}>
          <span style={{ color, fontWeight: 800, fontSize: "0.9375rem" }}>{candidate.pct}%</span>
        </div>
      </div>
    </div>
  );
}

// The line under each card: who won, or the runoff pairing. Nothing while the count is open.
function StatusLine({ status }: { status: RaceStatus }) {
  if (status.kind === "open") {
    return <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--site-muted)" }}>Apuração em andamento</div>;
  }
  const text =
    status.kind === "elected"
      ? `${status.names.length > 1 ? "Eleitos" : "Eleito"}: ${status.names.map(formatName).join(" e ")}`
      : `Segundo turno: ${status.names.map(formatName).join(" x ")}`;
  return <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, color: BRAND }}>{text}</div>;
}

const cardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap",
  padding: "1rem 1.125rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
};

function RaceCard({ race, stateSelect, count, runoff }: { race: TseRace | null; stateSelect?: ReactNode; count: number; runoff: boolean }) {
  if (!race || race.candidates.length === 0) {
    return (
      <div style={cardStyle}>
        {stateSelect}
        <div style={{ fontSize: "0.875rem", color: "var(--site-faint)" }}>Resultados indisponíveis no momento.</div>
      </div>
    );
  }
  return (
    <div style={cardStyle} className="election-card">
      <div className="election-stat" style={{ display: "flex", flexDirection: "column", gap: "0.375rem", minWidth: "7.5rem", flexShrink: 0 }}>
        {stateSelect}
        <div style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>{race.sectionsPct}% urnas apuradas</div>
      </div>
      <div className="election-candidates" style={{ display: "flex", gap: "1rem", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
        {race.candidates.slice(0, count).map((candidate, index) => (
          <CandidateItem key={`${candidate.name}-${index}`} candidate={candidate} runoff={runoff && index < 2} />
        ))}
      </div>
    </div>
  );
}

// A state picker styled as a pill with a list that opens below it, in place of the
// browser's own dropdown.
function StateDropdown({ value, onChange }: { value: string; onChange: (uf: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = UF_OPTIONS.find((option) => option.code === value)?.name ?? "";
  return (
    <div style={{ position: "relative", alignSelf: "flex-start" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.375rem 0.75rem",
          borderRadius: "9999px",
          border: "1px solid var(--site-border-strong)",
          backgroundColor: "var(--site-card)",
          color: BRAND,
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {current}
        <span aria-hidden style={{ fontSize: "0.7rem", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Estado"
          style={{
            position: "absolute",
            top: "calc(100% + 0.375rem)",
            left: 0,
            zIndex: 40,
            width: "210px",
            maxHeight: "260px",
            overflowY: "auto",
            margin: 0,
            padding: "0.375rem",
            listStyle: "none",
            borderRadius: "0.75rem",
            border: "1px solid var(--site-border-strong)",
            backgroundColor: "var(--site-card)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          {UF_OPTIONS.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                role="option"
                aria-selected={option.code === value}
                onClick={() => {
                  onChange(option.code);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.4375rem 0.625rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: option.code === value ? 800 : 500,
                  color: option.code === value ? BRAND : "var(--site-text-secondary)",
                  backgroundColor: option.code === value ? `${BRAND}14` : "transparent",
                }}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ElectionResults({ initial, locale }: { initial: Payload; locale: string }) {
  const [data, setData] = useState<Payload>(initial);
  const [uf, setUf] = useState(initial.uf);
  const [tab, setTab] = useState<SideTab>("governor");

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

  const { president, governor, senate } = data;
  const sideRace = tab === "governor" ? governor : senate;
  const presidentRunoff = raceStatus(president, true).kind === "runoff";
  const sideRunoff = raceStatus(sideRace, tab === "governor").kind === "runoff";
  const stateSelect = <StateDropdown value={uf} onChange={setUf} />;

  return (
    <section style={{ borderTop: `3px solid ${BRAND}`, paddingTop: "1.25rem", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", textAlign: "center", fontSize: "clamp(1.375rem, 3vw, 1.75rem)", fontWeight: 800, color: "var(--site-text)", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--site-border)" }}>
        <BrazilFlag width={34} />
        <span>
          Eleições <span style={{ color: "#E8B400", fontWeight: 800 }}>/</span> 2026
        </span>
      </h2>

      <div className="election-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem", color: "var(--site-text)" }}>Presidente</span>
            <a href={`/${locale}/eleicoes?cargo=presidente`} style={{ color: BRAND, fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
              apuração completa ›
            </a>
          </div>
          <RaceCard race={president} count={2} runoff={presidentRunoff} />
          <StatusLine status={raceStatus(president, true)} />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", padding: "0.1875rem", borderRadius: "9999px", backgroundColor: "var(--site-surface-alt)" }}>
              {(["governor", "senate"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  aria-pressed={tab === option}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "0.3125rem 0.9375rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: tab === option ? "var(--site-text)" : "var(--site-muted)",
                    backgroundColor: tab === option ? "var(--site-card)" : "transparent",
                    boxShadow: tab === option ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  {option === "governor" ? "Governador" : "Senado"}
                </button>
              ))}
            </div>
            <a href={`/${locale}/eleicoes?cargo=${tab === "governor" ? "governador" : "senado"}&uf=${uf}`} style={{ color: BRAND, fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
              apuração completa ›
            </a>
          </div>
          <RaceCard race={sideRace} count={2} stateSelect={stateSelect} runoff={sideRunoff} />
          <StatusLine status={raceStatus(sideRace, tab === "governor")} />
        </div>
      </div>

      <p style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "0.625rem", backgroundColor: "var(--site-surface-alt)", fontSize: "0.8125rem", lineHeight: 1.55, color: "var(--site-text-secondary)" }}>
        <strong style={{ color: BRAND }}>O que é o segundo turno?</strong> Se nenhum candidato passar de 50% dos votos válidos (brancos e nulos não contam), os dois mais votados disputam um segundo turno, em 25 de outubro de 2026.{" "}
        <a href={`/${locale}/eleicoes?cargo=presidente`} style={{ color: BRAND, fontWeight: 700, textDecoration: "none" }}>
          Veja a apuração ›
        </a>
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem", fontSize: "0.6875rem", color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        <span>Fonte: TSE</span>
        <a href={`/${locale}/eleicoes`} style={{ color: BRAND, fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
          apuração completa ›
        </a>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .election-grid { grid-template-columns: 1fr !important; }
          .election-card { flex-direction: column; align-items: stretch; gap: 0.75rem; padding: 0.875rem; }
          .election-stat { min-width: 0 !important; flex-direction: row !important; justify-content: space-between; align-items: center; flex-wrap: wrap; }
          .election-candidates { display: grid !important; grid-template-columns: 1fr 1fr; gap: 0.75rem !important; }
          .election-candidates > div { min-width: 0; }
          .election-photo { width: 3rem !important; height: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
