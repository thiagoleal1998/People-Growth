"use client";

import { useLayoutEffect, useState } from "react";

type Pair = { managerId: string; reportId: string; side: "left" | "right" };
type Segment = { left: number; top: number; width: number; height: number };

// Draws an L-shaped connector from a manager's avatar out to their report's:
// a horizontal run out of the manager's own left/right edge (whichever side
// the report sits on) at the manager's vertical center, then a vertical drop
// down to the report's avatar — stopping exactly at each photo's edge, never
// drawing a single pixel over either one (see the stop-at-the-edge note in
// OrganogramaCard). Two plain divs rather than one SVG path, since both
// segments are always axis-aligned rectangles.
//
// Positions are measured in the browser (by id, see org-avatar-<id> in
// OrganogramaCard) rather than computed from fixed CSS offsets, because a
// long name wrapping to a second line shifts things below it by a
// line-height that isn't knowable from CSS alone.
export function OrgChartConnectorLines({ pairs, containerId, color }: { pairs: Pair[]; containerId: string; color: string }) {
  const [segments, setSegments] = useState<Segment[]>([]);

  useLayoutEffect(() => {
    function measure() {
      const container = document.getElementById(containerId);
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: Segment[] = [];
      for (const { managerId, reportId, side } of pairs) {
        const managerEl = document.getElementById(`org-avatar-${managerId}`);
        const reportEl = document.getElementById(`org-avatar-${reportId}`);
        if (!managerEl || !reportEl) continue;
        const m = managerEl.getBoundingClientRect();
        const r = reportEl.getBoundingClientRect();

        const managerEdgeX = (side === "left" ? m.left : m.right) - containerRect.left;
        const managerCenterY = m.top + m.height / 2 - containerRect.top;
        const reportCenterX = r.left + r.width / 2 - containerRect.left;
        const reportTopY = r.top - containerRect.top;

        next.push({
          left: Math.min(managerEdgeX, reportCenterX),
          top: managerCenterY - 1,
          width: Math.abs(reportCenterX - managerEdgeX),
          height: 2,
        });
        next.push({
          left: reportCenterX - 1,
          top: managerCenterY,
          width: 2,
          height: Math.max(0, reportTopY - managerCenterY),
        });
      }
      setSegments(next);
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
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.width,
            height: s.height,
            backgroundColor: color,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
