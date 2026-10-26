import { formatName, INCUMBENT_SEEKING_REELECTION, partyColor, raceStatus, secondRoundOutlook, type TseCandidate, type TseRace } from "@/lib/tse";

// Rally photo shown once the 2nd round is mathematically decided — cleared for
// republishing by Agência Brasil's own terms ("A republicação é gratuita desde
// que citada a fonte"), credit kept visible on the image per those terms.
const VICTORY_PHOTO_URL = "https://lqgkxpoyymokrratgabe.supabase.co/storage/v1/object/public/site-assets/eleicoes/1792976692057-lula-vitoria.webp";
const VICTORY_PHOTO_CREDIT = "Foto: Paulo Pinto/Agência Brasil";

// A headline banner for the presidential race, placed between the results block and
// the news. It says what the count means right now: who is elected, who goes to a
// runoff, or who leads while the count is open.
export function ElectionBanner({ president, locale }: { president: TseRace; locale: string }) {
  const status = raceStatus(president, true);
  const first = president.candidates[0];
  const isRound2 = president.round === 2;
  const isRunoffDay = isRound2 && status.kind !== "elected";
  // The arithmetic can make the outcome certain (nobody left uncounted can
  // flip it) before the TSE's own "Eleito" flag appears — tracked as its own
  // tier, distinct from the official result, since that distinction matters
  // more here than almost anywhere else on the site.
  const outlook = isRunoffDay ? secondRoundOutlook(president) : null;
  const mathDecided = outlook?.kind === "decided";
  const officiallyElected = isRound2 && status.kind === "elected";
  // The victory photo applies to both: the race is effectively over either
  // way, whether that's "the math already says so" or "the TSE confirmed
  // it" — only the headline/subline wording differs between the two.
  const decided = isRound2 && (mathDecided || officiallyElected);
  const winnerName = officiallyElected ? status.names[0] : mathDecided ? outlook!.name : null;
  const isReelection = winnerName === INCUMBENT_SEEKING_REELECTION;
  // Votes start at 0 for every candidate the moment a round opens, so "leads
  // with 0,00%" would read as a lead that doesn't exist yet. On the runoff's
  // own day the headline leads with what's actually at stake — who wins
  // decides the country's direction — with the race-specific status (who's
  // ahead, or that it's still just opening) as a second line underneath,
  // instead of competing for the same headline.
  const headline = officiallyElected
    ? `${formatName(winnerName!)} é ${isReelection ? "reeleito" : "eleito"} presidente`
    : mathDecided
      ? `${formatName(winnerName!)} vence o 2º turno`
      : isRunoffDay
        ? "Os brasileiros decidem hoje o rumo do país"
        : status.kind === "runoff"
          ? `${status.names.map(formatName).join(" e ")} vão disputar o 2º turno`
          : first && first.votes > 0
            ? `${formatName(first.name)} lidera a apuração com ${first.pct}%`
            : "Apuração em andamento";
  const subline = officiallyElected
    ? isReelection
      ? "Lula vai para o quarto mandato com o desafio de um Congresso mais conservador pela frente"
      : "Resultado oficial confirmado pelo TSE"
    : mathDecided
      ? "Resultado já decidido pela apuração — aguardando a confirmação oficial do TSE"
      : isRunoffDay
        ? status.kind === "runoff"
          ? `Segundo turno: ${status.names.map(formatName).join(" x ")}`
          : first && first.votes > 0
            ? `${formatName(first.name)} lidera o 2º turno com ${first.pct}%`
            : "Segundo turno: apuração começando"
        : null;
  // The two leaders: in a runoff these are the finalists.
  const faces: TseCandidate[] = president.candidates.slice(0, 2);

  // Decided: a photo of Lula full and unobscured needs its own panel — a
  // dark overlay heavy enough to keep text readable also buried him, since
  // he sits exactly where that overlay was darkest. Splitting the banner
  // into a solid-colour text panel and a clean photo panel sidesteps that
  // fight entirely: neither one has to compromise for the other.
  const textPanel = (
    <div
      style={{
        minWidth: 0,
        flex: "1 1 360px",
        padding: decided ? "2.25rem 2rem" : "1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: decided ? "0.875rem" : "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FACC15" }}>
          Eleições 2026 · Presidente
        </span>
        {isRound2 && (
          <span
            style={{
              fontSize: decided ? "0.8125rem" : "0.6875rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              padding: decided ? "0.1875rem 0.625rem" : "0.125rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: decided ? "#16A34A" : "#FACC15",
              color: decided ? "white" : "#1F2937",
            }}
          >
            {officiallyElected ? (isReelection ? "REELEITO" : "ELEITO") : mathDecided ? "RESULTADO DECIDIDO" : "2º TURNO"}
          </span>
        )}
      </div>
      <div style={{ fontSize: decided ? "clamp(1.75rem, 4.4vw, 2.75rem)" : "clamp(1.375rem, 3.2vw, 2rem)", fontWeight: 800, lineHeight: 1.15 }}>{headline}</div>
      {subline && <div style={{ fontSize: decided ? "1.1875rem" : "1rem", fontWeight: 700, color: "#FACC15", marginTop: "0.5rem" }}>{subline}</div>}
      <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", marginTop: "0.625rem" }}>
        {president.sectionsPct}% das urnas apuradas · Fonte: TSE
      </div>
      <a
        href={`/${locale}/eleicoes?cargo=presidente`}
        style={{ display: "inline-block", marginTop: "1.25rem", padding: decided ? "0.625rem 1.25rem" : "0.5rem 1rem", borderRadius: "9999px", backgroundColor: "white", color: "#1d3b8a", fontWeight: 800, fontSize: decided ? "1rem" : "0.875rem", textDecoration: "none", alignSelf: "flex-start" }}
      >
        {officiallyElected ? "Apuração completa" : "Acompanhe a apuração"} ›
      </a>
    </div>
  );

  return (
    <div
      className="election-banner"
      style={{
        position: "relative",
        maxWidth: "1180px",
        margin: "0 auto",
        borderRadius: "1rem",
        overflow: "hidden",
        minHeight: decided ? "380px" : undefined,
        background: decided ? "#0d1b2a" : "linear-gradient(120deg, #0d1b2a 0%, #1d3b8a 60%, #315E9C 100%)",
        color: "white",
        display: "flex",
        alignItems: decided ? "stretch" : "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        boxShadow: "0 18px 40px -18px rgba(49, 94, 156,0.6)",
      }}
    >
      {decided ? (
        <>
          <div style={{ background: "linear-gradient(145deg, #0d1b2a 0%, #17356b 100%)", flex: "1 1 360px", display: "flex" }}>{textPanel}</div>
          <div style={{ position: "relative", flex: "1 1 320px", minHeight: "260px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={VICTORY_PHOTO_URL}
              alt={`${formatName(winnerName!)} discursa em comício com a bandeira do Brasil ao fundo`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "28% 22%", display: "block" }}
            />
            <span
              style={{
                position: "absolute",
                bottom: "0.5rem",
                left: "0.625rem",
                fontSize: "0.6875rem",
                color: "rgba(255,255,255,0.9)",
                backgroundColor: "rgba(0,0,0,0.45)",
                padding: "0.125rem 0.5rem",
                borderRadius: "0.25rem",
              }}
            >
              {VICTORY_PHOTO_CREDIT}
            </span>
          </div>
        </>
      ) : (
        <>
          {textPanel}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 1.75rem" }}>
            {faces.map((candidate, index) => (
              <div key={`${candidate.name}-${index}`} style={{ marginLeft: index === 0 ? 0 : "-0.75rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "6.5rem",
                    height: "6.5rem",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    boxShadow: `0 0 0 3px ${partyColor(candidate.party)}`,
                    border: "3px solid white",
                  }}
                >
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
        </>
      )}

      <style>{`
        @media (max-width: 560px) {
          .election-banner > div:last-child { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
