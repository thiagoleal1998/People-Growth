import { Link } from "@/i18n/navigation";
import { getCurrentWeekGames, type NflGame } from "@/lib/nfl";
import { TeamCrest } from "@/components/TeamCrest";

const BRAND = "#4361EE";
const PREVIEW_COUNT = 3;

function GameRow({ game }: { game: NflGame }) {
  const isLive = game.status === "live";
  const hasScore = game.status !== "scheduled";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderTop: "1px solid var(--site-border)" }}>
      <div style={{ width: "5rem", flexShrink: 0, fontSize: "0.75rem", color: isLive ? "#DC2626" : "var(--site-muted)", fontWeight: isLive ? 800 : 600 }}>
        {isLive ? "Ao vivo" : game.statusDetail}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.375rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--site-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {game.away.abbreviation}
          </span>
          <TeamCrest src={game.away.logo} alt={game.away.name} size={20} />
        </div>
        <span style={{ fontWeight: 800, color: BRAND, fontSize: "0.875rem", flexShrink: 0, minWidth: "2.75rem", textAlign: "center" }}>
          {hasScore ? `${game.away.score}–${game.home.score}` : "×"}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <TeamCrest src={game.home.logo} alt={game.home.name} size={20} />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--site-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {game.home.abbreviation}
          </span>
        </div>
      </div>
    </div>
  );
}

// A small, static preview — unlike SportsLiveWidget this doesn't poll (NFL
// games are a once-a-week cadence, not worth the client-side complexity),
// so it's a plain Server Component fetching ESPN's scoreboard directly (see
// src/lib/nfl.ts). Shows nothing at all if ESPN's data is unavailable,
// same null-safe pattern as the rest of the sports section, rather than an
// empty-looking card.
export async function NflPreview() {
  const games = await getCurrentWeekGames();
  if (!games || games.length === 0) return null;
  const highlighted = games.slice(0, PREVIEW_COUNT);

  return (
    <section className="container-xl" style={{ paddingTop: "1.5rem", paddingBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--site-text)" }}>NFL</h2>
        <Link href="/nfl" style={{ color: BRAND, fontWeight: 700, fontSize: "0.8125rem", textDecoration: "none" }}>
          Ver mais →
        </Link>
      </div>
      <div style={{ borderRadius: "0.75rem", border: "1px solid var(--site-border-strong)", backgroundColor: "var(--site-card)", padding: "0.25rem 1.125rem" }}>
        {highlighted.map((game) => (
          <GameRow key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
