"use client";

import { useLayoutEffect, useState } from "react";

type Pair = { managerId: string; reportId: string };
type Line = { left: number; top: number; height: number };

// Draws a line from a manager's avatar down to their report's avatar,
// stopping exactly at each photo's own edge (not its center) — covering the
// name/role text between them, which the line *does* run behind (z-index),
// but never drawing a single pixel over either photo itself. A z-index trick
// to run it visually behind round, bordered avatar images turned out to be
// the wrong tool here (border-radius clips the image, not the element's
// stacking box, and the two don't line up reliably across browsers); simply
// never painting inside that box at all sidesteps the question entirely.
// Avatar positions are measured in the browser (by id, see org-avatar-<id>
// in OrganogramaCard) rather than computed from fixed CSS offsets, because a
// long name wrapping to a second line shifts things below it by a
// line-height that isn't knowable from CSS alone.
export function OrgChartConnectorLines({ pairs, containerId, color }: { pairs: Pair[]; containerId: string; color: string }) {
  const [lines, setLines] = useState<Line[]>([]);

  useLayoutEffect(() => {
    function measure() {
      const container = document.getElementById(containerId);
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: Line[] = [];
      for (const { managerId, reportId } of pairs) {
        const managerEl = document.getElementById(`org-avatar-${managerId}`);
        const reportEl = document.getElementById(`org-avatar-${reportId}`);
        if (!managerEl || !reportEl) continue;
        const m = managerEl.getBoundingClientRect();
        const r = reportEl.getBoundingClientRect();
        const left = m.left + m.width / 2 - containerRect.left;
        const top = m.bottom - containerRect.top;
        const bottom = r.top - containerRect.top;
        next.push({ left, top, height: Math.max(0, bottom - top) });
      }
      setLines(next);
    }
    measure();
    // Photos can still be loading at mount time and nudge layout slightly —
    // same reasoning as the late rechecks used elsewhere for this.
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    const lateRecheck = setTimeout(measure, 400);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      clearTimeout(lateRecheck);
    };
  }, [pairs, containerId]);

  return (
    <>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: l.left,
            top: l.top,
            width: "2px",
            height: l.height,
            backgroundColor: color,
            transform: "translateX(-1px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
