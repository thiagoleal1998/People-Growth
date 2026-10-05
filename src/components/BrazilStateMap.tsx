import type { BrazilMap } from "@/lib/brazil-map";

// One state's result: colour of the leader's party, a tooltip with first and second
// place, and whether the state is headed to a runoff (drawn with a dashed outline).
export type StateWinner = { color: string; label: string; runoff: boolean };
export type MapLegendItem = { color: string; label: string };
export type RunoffState = { uf: string; text: string };

// Each state is painted with the colour of the party leading it; states without a
// result yet stay grey. Drawn on the server, so no client JS.
export function BrazilStateMap({
  map,
  winners,
  legend,
  runoffStates,
}: {
  map: BrazilMap;
  winners: Record<string, StateWinner>;
  legend: MapLegendItem[];
  runoffStates: RunoffState[];
}) {
  return (
    <div>
      <svg viewBox={map.viewBox} role="img" aria-label="Mapa do Brasil por estado" style={{ width: "100%", maxWidth: "440px", height: "auto", display: "block", margin: "0 auto" }}>
        {map.states.map(({ uf, d }) => {
          const winner = winners[uf];
          return (
            <path
              key={uf}
              d={d}
              fill={winner?.color ?? "var(--site-border-strong)"}
              stroke={winner?.runoff ? "#0d1b2a" : "#ffffff"}
              strokeWidth={winner?.runoff ? 0.35 : 0.12}
              strokeDasharray={winner?.runoff ? "0.9 0.5" : undefined}
              strokeLinejoin="round"
            >
              <title>{winner ? `${uf.toUpperCase()} — ${winner.label}` : uf.toUpperCase()}</title>
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
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--site-muted)", marginTop: "0.5rem" }}>
        Cor: partido de quem lidera. Contorno tracejado: vai para o 2º turno.
      </p>

      {runoffStates.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "0.625rem", backgroundColor: "var(--site-surface-alt)" }}>
          <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--site-text)", marginBottom: "0.5rem" }}>
            Estados com 2º turno ({runoffStates.length})
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {runoffStates.map((state) => (
              <li key={state.uf} style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)" }}>
                <strong style={{ color: "var(--site-text)" }}>{state.uf.toUpperCase()}</strong> · {state.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
