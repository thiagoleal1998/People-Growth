"use client";

import { useLayoutEffect, useState } from "react";

type Pair = { managerId: string; reportId: string };
type Line = { left: number; top: number; height: number };

// Draws a straight line from the vertical center of a manager's avatar down
// to their report's avatar — passing *behind* both (z-index below the
// photos, above the card/box background underneath) rather than stopping at
// whichever box edge is in the way, which read as "floating nearby" instead
// of "connected to this specific person". Avatar positions are measured in
// the browser (by id, see org-avatar-<id> in OrganogramaCard) rather than
// computed from fixed CSS offsets, because a long name wrapping to a second
// line shifts the avatar below it by a line-height that isn't knowable from
// CSS alone.
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
        const top = m.top + m.height / 2 - containerRect.top;
        const bottom = r.top + r.height / 2 - containerRect.top;
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
            width: "3px",
            height: l.height,
            backgroundColor: color,
            transform: "translateX(-1.5px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
