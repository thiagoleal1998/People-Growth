import { Link } from "@/i18n/navigation";
import { getCurrentWeekGames, NFL_LOGO_URL_DARK, type NflGame } from "@/lib/nfl";
import { TeamCrest } from "@/components/TeamCrest";
import { PagedCarousel } from "@/components/PagedCarousel";

const NFL_RED = "#D50A0A";

function GameRow({ game }: { game: NflGame }) {
  const isLive = game.status === "live";
  const hasScore = game.status !== "scheduled";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.125rem 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ width: "6rem", flexShrink: 0, fontSize: "0.75rem", color: isLive ? "#FF5252" : "rgba(255,255,255,0.55)", fontWeight: isLive ? 800 : 600 }}>
        {isLive ? "Ao vivo" : game.statusDetail}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {game.away.abbreviation}
          </span>
          <TeamCrest src={game.away.logo} alt={game.away.name} size={36} />
        </div>
        <span style={{ fontWeight: 800, color: NFL_RED, fontSize: "1.125rem", flexShrink: 0, minWidth: "3rem", textAlign: "center" }}>
          {hasScore ? `${game.away.score}–${game.home.score}` : "×"}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <TeamCrest src={game.home.logo} alt={game.home.name} size={36} />
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
// src/lib/nfl.ts). Renders nothing at all if ESPN's data is unavailable,
// same null-safe pattern as the rest of the sports section, rather than an
// empty-looking dark block.
export async function NflPreview() {
  const games = await getCurrentWeekGames();
  if (!games || games.length === 0) return null;

  return (
    <section style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #162236 50%, #1a1f3e 100%)", position: "relative", overflow: "hidden", padding: "3.5rem 0" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(213,10,10,0.16) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(49, 94, 156,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div className="container-xl" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <TeamCrest src={NFL_LOGO_URL_DARK} alt="NFL" size={52} />
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: NFL_RED, letterSpacing: "0.08em", textTransform: "uppercase" }}>Esportes</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>NFL</h2>
            </div>
          </div>
          <Link
            href="/nfl"
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "9999px",
              padding: "0.5rem 1.375rem",
            }}
          >
            Ver mais →
          </Link>
        </div>
        <PagedCarousel
          items={games.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
          accentColor={NFL_RED}
          pageStyle={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)", padding: "0.5rem 1.75rem" }}
        />
      </div>
    </section>
  );
}
