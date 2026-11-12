"use client";

import { useLayoutEffect, useState } from "react";

type Pair = { managerId: string; reportId: string; side: "left" | "right" };
type Segment = { left: number; top: number; width: number; height: number };

// Draws the manager→report connector lines. Two shapes, picked per manager:
//
// - Exactly one report (e.g. Raphael under the CEO): a simple L — horizontal
//   out of the manager's own left/right edge (whichever side the report
//   sits on) at the manager's vertical center, then straight down to the
//   report. Unchanged from the original version of this component — a
//   manager with a single report never had a crossing problem, so there's
//   no reason for it to look different than it always has.
// - Two or more reports under the same manager (e.g. Bruno, Caique and Shay
//   all reporting to Gustavo): a "⊤" — the same shape as the static
//   CEO→founders Connector just above this in OrganogramaCard. A stub
//   straight down from the manager's own center, a horizontal bus roughly
//   midway in the gap below, then one drop per report at their own X. A
//   direct edge-to-report line per report (the single-report shape above)
//   can end up running sideways straight through the manager's own circle
//   once a report happens to sit near/under it — the bus only ever starts
//   below the manager's bottom edge, so it never crosses back through the
//   manager's own box.
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

      const groupsByManager = new Map<string, { reportId: string; side: "left" | "right" }[]>();
      for (const { managerId, reportId, side } of pairs) {
        const list = groupsByManager.get(managerId) ?? [];
        list.push({ reportId, side });
        groupsByManager.set(managerId, list);
      }

      const next: Segment[] = [];
      for (const [managerId, reports] of groupsByManager) {
        const managerEl = document.getElementById(`org-avatar-${managerId}`);
        if (!managerEl) continue;
        const m = managerEl.getBoundingClientRect();
        const managerCenterX = m.left + m.width / 2 - containerRect.left;
        const managerCenterY = m.top + m.height / 2 - containerRect.top;
        const managerBottomY = m.bottom - containerRect.top;

        const resolved = reports
          .map(({ reportId, side }) => {
            const el = document.getElementById(`org-avatar-${reportId}`);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              side,
              centerX: r.left + r.width / 2 - containerRect.left,
              topY: r.top - containerRect.top,
            };
          })
          .filter((r): r is { side: "left" | "right"; centerX: number; topY: number } => r !== null);
        if (resolved.length === 0) continue;

        if (resolved.length === 1) {
          const r = resolved[0];
          const managerEdgeX = (r.side === "left" ? m.left : m.right) - containerRect.left;
          next.push({
            left: Math.min(managerEdgeX, r.centerX),
            top: managerCenterY - 1,
            width: Math.abs(r.centerX - managerEdgeX),
            height: 2,
          });
          next.push({
            left: r.centerX - 1,
            top: managerCenterY,
            width: 2,
            height: Math.max(0, r.topY - managerCenterY),
          });
          continue;
        }

        const minReportTopY = Math.min(...resolved.map((r) => r.topY));
        const busY = managerBottomY + Math.max(8, (minReportTopY - managerBottomY) / 2);
        const xs = [managerCenterX, ...resolved.map((r) => r.centerX)];
        const busLeft = Math.min(...xs);
        const busRight = Math.max(...xs);

        next.push({ left: managerCenterX - 1, top: managerBottomY, width: 2, height: Math.max(0, busY - managerBottomY) });
        next.push({ left: busLeft, top: busY - 1, width: Math.max(0, busRight - busLeft), height: 2 });
        for (const r of resolved) {
          next.push({ left: r.centerX - 1, top: busY, width: 2, height: Math.max(0, r.topY - busY) });
        }
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
