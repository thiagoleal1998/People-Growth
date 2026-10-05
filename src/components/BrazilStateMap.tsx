import type { BrazilMap } from "@/lib/brazil-map";

export type StateWinner = { color: string; label: string };
export type MapLegendItem = { color: string; label: string };

// Each state is painted with the colour of the candidate or party that led it.
// States without a result yet stay grey. Drawn on the server, so no client JS.
export function BrazilStateMap({ map, winners, legend }: { map: BrazilMap; winners: Record<string, StateWinner>; legend: MapLegendItem[] }) {
  return (
    <div>
      <svg viewBox={map.viewBox} role="img" aria-label="Mapa do Brasil por estado" style={{ width: "100%", maxWidth: "440px", height: "auto", display: "block", margin: "0 auto" }}>
        {map.states.map(({ uf, d }) => {
          const winner = winners[uf];
          return (
            <path key={uf} d={d} fill={winner?.color ?? "var(--site-border-strong)"} stroke="#ffffff" strokeWidth={0.12} strokeLinejoin="round">
              <title>{winner ? `${uf.toUpperCase()}: ${winner.label}` : uf.toUpperCase()}</title>
            </path>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", justifyContent: "center", marginTop: "0.75rem" }}>
        {legend.map((item) => (
          <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>
            <span style={{ width: "0.75rem", height: "0.75rem", borderRadius: "0.2rem", backgroundColor: item.color, flexShrink: 0 }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
