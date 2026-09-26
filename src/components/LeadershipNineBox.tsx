import { TIER_LABELS, scoreTier } from "@/lib/leadership-assessment";

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
  const size = 440;
  const margin = { top: 24, right: 16, bottom: 64, left: 128 };
  const gridSize = size - margin.left - margin.right;
  const cell = gridSize / 3;
  const viewW = margin.left + gridSize + margin.right;
  const viewH = margin.top + gridSize + margin.bottom;

  // Plot at the center of the exact cell the score buckets into (same
  // scoreTier() the quadrant label is computed from) rather than a
  // continuous position — a raw score just past a threshold would otherwise
  // render right on the boundary line, looking like it belongs to neither
  // cell even though the label already committed to one.
  const bTier = scoreTier(behaviorScore || 1);
  const pTier = scoreTier(performanceScore || 1);
  const dotX = margin.left + (bTier - 1) * cell + cell / 2;
  const dotY = margin.top + (3 - pTier) * cell + cell / 2;

  const tierLines = (n: 1 | 2 | 3) => (locale === "en" ? TIER_LABELS[n].en : TIER_LABELS[n].pt);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} role="img" aria-label={personLabel} style={{ width: "100%", maxWidth: `${viewW}px`, height: "auto" }}>
      {/* Axis titles */}
      <text x={28} y={margin.top + gridSize / 2} transform={`rotate(-90 28 ${margin.top + gridSize / 2})`} textAnchor="middle" fontSize="12" fontWeight={700} fill="currentColor">
        {locale === "en" ? "PERFORMANCE" : "DESEMPENHO"}
      </text>
      <text x={margin.left + gridSize / 2} y={viewH - 8} textAnchor="middle" fontSize="12" fontWeight={700} fill="currentColor">
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
            fill={(row + col) % 2 === 0 ? "rgba(67,97,238,0.06)" : "rgba(67,97,238,0.02)"}
            stroke="rgba(128,128,128,0.3)"
          />
        ))
      )}

      {/* Y-axis tier labels (top row = tier 3) */}
      {[3, 2, 1].map((t, i) => {
        const [line1, line2] = tierLines(t as 1 | 2 | 3);
        const y = margin.top + i * cell + cell / 2;
        return (
          <g key={t}>
            <text x={margin.left - 12} y={y - 6} textAnchor="end" fontSize="10.5" fill="currentColor" opacity={0.7}>
              {line1}
            </text>
            <text x={margin.left - 12} y={y + 8} textAnchor="end" fontSize="10.5" fill="currentColor" opacity={0.7}>
              {line2}
            </text>
          </g>
        );
      })}

      {/* X-axis tier labels */}
      {[1, 2, 3].map((t, i) => {
        const [line1, line2] = tierLines(t as 1 | 2 | 3);
        const x = margin.left + i * cell + cell / 2;
        const y = margin.top + gridSize;
        return (
          <g key={t}>
            <text x={x} y={y + 18} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.7}>
              {line1}
            </text>
            <text x={x} y={y + 32} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.7}>
              {line2}
            </text>
          </g>
        );
      })}

      {/* Plotted point */}
      <circle cx={dotX} cy={dotY} r={8} fill="#4361EE" stroke="white" strokeWidth={2.5} />
      <text x={dotX} y={dotY - 15} textAnchor="middle" fontSize="12.5" fontWeight={700} fill="currentColor">
        {legendMark} {personLabel}
      </text>
    </svg>
  );
}
