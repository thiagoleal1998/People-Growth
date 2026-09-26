import { TIER_LABELS } from "@/lib/leadership-assessment";

// Hand-rolled SVG 3x3 grid (no charting library in this project) plotting a
// single evaluated person by their Desempenho (performance, vertical) and
// Comportamento (behavior, horizontal) scores — shared between the public
// tool's result screen and the admin detail view.
export function LeadershipNineBox({
  performanceScore,
  behaviorScore,
  personLabel,
  legendMark,
  locale,
}: {
  performanceScore: number;
  behaviorScore: number;
  personLabel: string;
  legendMark: string;
  locale: string;
}) {
  const size = 320;
  const margin = { top: 12, right: 12, bottom: 44, left: 96 };
  const gridSize = size - margin.left - margin.right;
  const cell = gridSize / 3;
  const viewW = margin.left + gridSize + margin.right;
  const viewH = margin.top + gridSize + margin.bottom;

  // Scores are 1-3; clamp defensively (a person with zero ratings on an
  // axis scores 0, which would otherwise plot off-grid).
  const px = Math.min(3, Math.max(1, behaviorScore || 1));
  const py = Math.min(3, Math.max(1, performanceScore || 1));
  const dotX = margin.left + ((px - 1) / 2) * gridSize;
  const dotY = margin.top + gridSize - ((py - 1) / 2) * gridSize;

  const tier = (n: 1 | 2 | 3) => (locale === "en" ? TIER_LABELS[n].en : TIER_LABELS[n].pt);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} role="img" aria-label={personLabel} style={{ width: "100%", maxWidth: `${viewW}px`, height: "auto" }}>
      {/* Axis titles */}
      <text x={margin.left / 2} y={margin.top + gridSize / 2} transform={`rotate(-90 ${margin.left / 2} ${margin.top + gridSize / 2})`} textAnchor="middle" fontSize="11" fontWeight={700} fill="currentColor">
        {locale === "en" ? "PERFORMANCE" : "DESEMPENHO"}
      </text>
      <text x={margin.left + gridSize / 2} y={viewH - 6} textAnchor="middle" fontSize="11" fontWeight={700} fill="currentColor">
        {locale === "en" ? "BEHAVIOR" : "COMPORTAMENTO"}
      </text>

      {/* Cell fills + grid lines */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={margin.left + col * cell}
            y={margin.top + row * cell}
            width={cell}
            height={cell}
            fill={(row + col) % 2 === 0 ? "rgba(67,97,238,0.05)" : "rgba(67,97,238,0.02)"}
            stroke="rgba(128,128,128,0.35)"
          />
        ))
      )}

      {/* Y-axis tier labels (top = tier 3) */}
      {[3, 2, 1].map((t, i) => (
        <text key={t} x={margin.left - 8} y={margin.top + i * cell + cell / 2} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="currentColor" opacity={0.7}>
          {tier(t as 1 | 2 | 3)}
        </text>
      ))}

      {/* X-axis tier labels */}
      {[1, 2, 3].map((t, i) => (
        <text key={t} x={margin.left + i * cell + cell / 2} y={margin.top + gridSize + 14} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
          {tier(t as 1 | 2 | 3)}
        </text>
      ))}

      {/* Plotted point */}
      <circle cx={dotX} cy={dotY} r={7} fill="#4361EE" stroke="white" strokeWidth={2} />
      <text x={dotX} y={dotY - 12} textAnchor="middle" fontSize="11" fontWeight={700} fill="currentColor">
        {legendMark} {personLabel}
      </text>
    </svg>
  );
}
