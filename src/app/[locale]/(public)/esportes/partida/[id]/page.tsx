import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { COMPETITIONS, getMatchDetail, type MatchEvent, type MatchHeader, type TeamLineup, type TeamStatistics } from "@/lib/sports";

export const revalidate = 180;

// Portuguese-only, same as the rest of /esportes.
const BRAND = "#4361EE";

const TABS = ["lances", "escalacoes", "estatisticas"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = { lances: "Lances", escalacoes: "Escalações", estatisticas: "Estatísticas" };

const cardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--site-border-strong)",
  backgroundColor: "var(--site-card)",
  padding: "1.25rem",
} as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMatchDetail(Number(id));
  if (!detail) return { title: "Partida não encontrada" };
  const { header } = detail;
  return {
    title: `${header.homeTeamName} x ${header.awayTeamName} — ${COMPETITIONS[header.competition].name_pt}`,
    description: `Lances, escalações e estatísticas de ${header.homeTeamName} x ${header.awayTeamName}, pelo ${COMPETITIONS[header.competition].name_pt}.`,
  };
}

function TeamHeading({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} width={56} height={56} style={{ objectFit: "contain" }} />
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #4361EE, #06D6A0)" }} />
      )}
      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--site-text)", textAlign: "center" }}>{name}</span>
    </div>
  );
}

function eventIcon(event: MatchEvent): string {
  if (event.type === "goal") return "⚽";
  if (event.type === "card") return event.detail.toLowerCase().includes("red") ? "🟥" : "🟨";
  if (event.type === "subst") return "🔄";
  if (event.type === "var") return "📺";
  return "•";
}

function EventsTimeline({ events, header }: { events: MatchEvent[] | null; header: MatchHeader }) {
  if (!events || events.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Lances indisponíveis no momento.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {events.map((event, i) => {
        const isHome = event.teamId === header.homeTeamId;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ width: "3rem", flexShrink: 0, fontSize: "0.8125rem", fontWeight: 800, color: "var(--site-muted)", textAlign: "right" }}>
              {event.minute}
              {event.extraMinute ? `+${event.extraMinute}` : ""}&apos;
            </div>
            <div style={{ fontSize: "1.125rem", lineHeight: 1, flexShrink: 0 }}>{eventIcon(event)}</div>
            <div style={{ fontSize: "0.875rem", color: "var(--site-text)" }}>
              <span style={{ fontWeight: 700 }}>{event.playerName ?? event.teamName}</span>
              {event.assistName && <span style={{ color: "var(--site-muted)" }}> (assist. {event.assistName})</span>}
              <div style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>
                {isHome ? header.homeTeamName : header.awayTeamName} · {event.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const POSITION_ORDER = ["G", "D", "M", "F"];
const POSITION_LABEL: Record<string, string> = { G: "Goleiro", D: "Defesa", M: "Meio-campo", F: "Ataque" };

function LineupColumn({ lineup }: { lineup: TeamLineup }) {
  const grouped = POSITION_ORDER.map((pos) => ({ pos, players: lineup.startXI.filter((p) => p.position === pos) })).filter((g) => g.players.length > 0);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {lineup.teamLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lineup.teamLogo} alt="" width={28} height={28} style={{ objectFit: "contain" }} />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--site-text)" }}>{lineup.teamName}</div>
          {lineup.formation && <div style={{ fontSize: "0.75rem", color: "var(--site-muted)" }}>{lineup.formation}</div>}
        </div>
      </div>
      {lineup.coachName && <div style={{ fontSize: "0.75rem", color: "var(--site-faint)", marginBottom: "0.75rem" }}>Técnico: {lineup.coachName}</div>}
      {grouped.map(({ pos, players }) => (
        <div key={pos} style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--site-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
            {POSITION_LABEL[pos] ?? pos}
          </div>
          {players.map((p) => (
            <div key={p.id} style={{ fontSize: "0.8125rem", color: "var(--site-text)", padding: "0.1875rem 0" }}>
              {p.number != null && <span style={{ color: "var(--site-muted)", marginRight: "0.375rem" }}>{p.number}</span>}
              {p.name}
            </div>
          ))}
        </div>
      ))}
      {lineup.substitutes.length > 0 && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary style={{ cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: BRAND }}>Reservas ({lineup.substitutes.length})</summary>
          {lineup.substitutes.map((p) => (
            <div key={p.id} style={{ fontSize: "0.8125rem", color: "var(--site-text)", padding: "0.1875rem 0" }}>
              {p.number != null && <span style={{ color: "var(--site-muted)", marginRight: "0.375rem" }}>{p.number}</span>}
              {p.name}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

function Lineups({ lineups }: { lineups: TeamLineup[] | null }) {
  if (!lineups || lineups.length < 2) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Escalações indisponíveis no momento.</p>;
  }
  return (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <LineupColumn lineup={lineups[0]} />
      <LineupColumn lineup={lineups[1]} />
    </div>
  );
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Posse de bola",
  "Total Shots": "Finalizações",
  "Shots on Goal": "No gol",
  "Shots off Goal": "Para fora",
  "Shots insidebox": "De dentro da área",
  "Shots outsidebox": "De fora da área",
  "Blocked Shots": "Bloqueadas",
  "Corner Kicks": "Escanteios",
  Fouls: "Faltas",
  Offsides: "Impedimentos",
  "Yellow Cards": "Cartões amarelos",
  "Red Cards": "Cartões vermelhos",
  "Goalkeeper Saves": "Defesas do goleiro",
  "Total passes": "Passes",
  "Passes accurate": "Passes certos",
  "Free Kicks": "Faltas cobradas",
};

const STAT_ORDER = ["Ball Possession", "Total Shots", "Shots on Goal", "Corner Kicks", "Fouls", "Offsides", "Yellow Cards", "Red Cards"];

function statNumber(value: string | number | null): number {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  const n = Number.parseFloat(value.replace("%", ""));
  return Number.isFinite(n) ? n : 0;
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-text)", marginBottom: "0.25rem" }}>
        <span>{home}</span>
        <span style={{ color: "var(--site-muted)", fontWeight: 600 }}>{label}</span>
        <span>{away}</span>
      </div>
      <div style={{ display: "flex", height: "0.375rem", borderRadius: "9999px", overflow: "hidden", backgroundColor: "var(--site-border)" }}>
        <div style={{ width: `${homePct}%`, backgroundColor: BRAND }} />
        <div style={{ width: `${100 - homePct}%`, backgroundColor: "#06D6A0" }} />
      </div>
    </div>
  );
}

function Statistics({ statistics }: { statistics: TeamStatistics[] | null }) {
  if (!statistics || statistics.length < 2) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Estatísticas indisponíveis no momento.</p>;
  }
  const [home, away] = statistics;
  const homeByType = new Map(home.stats.map((s) => [s.type, s.value]));
  const awayByType = new Map(away.stats.map((s) => [s.type, s.value]));
  const types = STAT_ORDER.filter((t) => homeByType.has(t) || awayByType.has(t));
  if (types.length === 0) {
    return <p style={{ color: "var(--site-faint)", fontSize: "0.875rem", padding: "0.75rem 0" }}>Estatísticas indisponíveis no momento.</p>;
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 700, color: "var(--site-text)", marginBottom: "1rem" }}>
        <span>{home.teamName}</span>
        <span>{away.teamName}</span>
      </div>
      {types.map((type) => (
        <StatRow key={type} label={STAT_LABELS[type] ?? type} home={statNumber(homeByType.get(type) ?? null)} away={statNumber(awayByType.get(type) ?? null)} />
      ))}
    </div>
  );
}

export default async function PartidaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "lances";
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) notFound();

  const detail = await getMatchDetail(fixtureId);
  if (!detail) notFound();
  const { header, events, lineups, statistics } = detail;

  const dateLabel = new Date(header.date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const isLive = header.status === "live";
  const isFinished = header.status === "finished";
  const hasScore = isLive || isFinished;

  return (
    <section className="section-padding esportes-page" style={{ backgroundColor: "var(--site-bg)", minHeight: "70vh" }}>
      <div className="container-xl" style={{ maxWidth: "800px" }}>
        <Link href="/esportes" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1rem", color: BRAND, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
          ← Voltar para Esportes
        </Link>

        <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
          <div style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--site-muted)", marginBottom: "0.75rem" }}>
            {COMPETITIONS[header.competition].name_pt}
            {header.round ? ` · ${header.round}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            <TeamHeading name={header.homeTeamName} logo={header.homeTeamLogo} />
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              {isLive && (
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#DC2626", marginBottom: "0.25rem" }}>
                  {header.elapsed ? `${header.elapsed}'` : "Ao vivo"}
                </div>
              )}
              {isFinished && <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-muted)", marginBottom: "0.25rem" }}>Encerrado</div>}
              <div style={{ fontSize: "2rem", fontWeight: 800, color: BRAND }}>
                {hasScore ? `${header.homeGoals ?? 0} : ${header.awayGoals ?? 0}` : "×"}
              </div>
              {!hasScore && <div style={{ fontSize: "0.75rem", color: "var(--site-muted)" }}>Ainda não começou</div>}
            </div>
            <TeamHeading name={header.awayTeamName} logo={header.awayTeamLogo} />
          </div>
          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--site-faint)", marginTop: "0.875rem" }}>
            {dateLabel}
            {header.venueName ? ` · ${header.venueName}${header.venueCity ? `, ${header.venueCity}` : ""}` : ""}
            {header.referee ? ` · Árbitro: ${header.referee}` : ""}
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {TABS.map((option) => (
            <a
              key={option}
              href={`?tab=${option}`}
              aria-current={option === tab ? "page" : undefined}
              style={{
                padding: "0.5rem 1.125rem",
                borderRadius: "0.5rem",
                border: `1px solid ${option === tab ? BRAND : "var(--site-border-strong)"}`,
                color: option === tab ? BRAND : "var(--site-text-secondary)",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              {TAB_LABEL[option]}
            </a>
          ))}
        </nav>

        <div style={cardStyle}>
          {tab === "lances" && <EventsTimeline events={events} header={header} />}
          {tab === "escalacoes" && <Lineups lineups={lineups} />}
          {tab === "estatisticas" && <Statistics statistics={statistics} />}
        </div>
      </div>

      <style>{`
        body:has(.esportes-page) .category-nav,
        body:has(.esportes-page) .social-sidebar { display: none !important; }
      `}</style>
    </section>
  );
}
