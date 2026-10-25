import { formatName, partyColor, raceStatus, type TseCandidate, type TseRace } from "@/lib/tse";

// A headline banner for the presidential race, placed between the results block and
// the news. It says what the count means right now: who is elected, who goes to a
// runoff, or who leads while the count is open.
export function ElectionBanner({ president, locale }: { president: TseRace; locale: string }) {
  const status = raceStatus(president, true);
  const first = president.candidates[0];
  const isRunoffDay = president.round === 2 && status.kind !== "elected";
  // Votes start at 0 for every candidate the moment a round opens, so "leads
  // with 0,00%" would read as a lead that doesn't exist yet. On the runoff's
  // own day the headline leads with what's actually at stake — who wins
  // decides the country's direction — with the race-specific status (who's
  // ahead, or that it's still just opening) as a second line underneath,
  // instead of competing for the same headline.
  const headline = isRunoffDay
    ? "Os brasileiros decidem hoje o rumo do país"
    : status.kind === "runoff"
      ? `${status.names.map(formatName).join(" e ")} vão disputar o 2º turno`
      : status.kind === "elected"
        ? `${formatName(status.names[0])} é eleito presidente`
        : first && first.votes > 0
          ? `${formatName(first.name)} lidera a apuração com ${first.pct}%`
          : "Apuração em andamento";
  const subline = isRunoffDay
    ? status.kind === "runoff"
      ? `Segundo turno: ${status.names.map(formatName).join(" x ")}`
      : first && first.votes > 0
        ? `${formatName(first.name)} lidera o 2º turno com ${first.pct}%`
        : "Segundo turno: apuração começando"
    : null;
  // The two leaders: in a runoff these are the finalists.
  const faces: TseCandidate[] = president.candidates.slice(0, 2);

  return (
    <div
      className="election-banner"
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "1.5rem 1.75rem",
        borderRadius: "1rem",
        background: "linear-gradient(120deg, #0d1b2a 0%, #1d3b8a 60%, #315E9C 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        flexWrap: "wrap",
        boxShadow: "0 18px 40px -18px rgba(49, 94, 156,0.6)",
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 320px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FACC15" }}>
            Eleições 2026 · Presidente
          </span>
          {isRunoffDay && (
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor: "#FACC15",
                color: "#1F2937",
              }}
            >
              2º TURNO
            </span>
          )}
        </div>
        <div style={{ fontSize: "clamp(1.375rem, 3.2vw, 2rem)", fontWeight: 800, lineHeight: 1.2 }}>{headline}</div>
        {subline && <div style={{ fontSize: "1rem", fontWeight: 700, color: "#FACC15", marginTop: "0.375rem" }}>{subline}</div>}
        <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", marginTop: "0.5rem" }}>
          {president.sectionsPct}% das urnas apuradas · Fonte: TSE
        </div>
        <a
          href={`/${locale}/eleicoes?cargo=presidente`}
          style={{ display: "inline-block", marginTop: "1rem", padding: "0.5rem 1rem", borderRadius: "9999px", backgroundColor: "white", color: "#1d3b8a", fontWeight: 800, fontSize: "0.875rem", textDecoration: "none" }}
        >
          Acompanhe a apuração ›
        </a>
      </div>

      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        {faces.map((candidate, index) => (
          <div key={`${candidate.name}-${index}`} style={{ marginLeft: index === 0 ? 0 : "-0.75rem", textAlign: "center" }}>
            <div style={{ width: "6.5rem", height: "6.5rem", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.12)", boxShadow: `0 0 0 3px ${partyColor(candidate.party)}`, border: "3px solid white" }}>
              {candidate.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, marginTop: "0.5rem" }}>{formatName(candidate.name).split(" ").slice(-1)[0]}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>{candidate.pct}%</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .election-banner > div:last-child { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
