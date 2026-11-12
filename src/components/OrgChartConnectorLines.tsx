"use client";

import { useLayoutEffect, useState } from "react";

type Pair = { managerId: string; reportId: string };
type Segment = { left: number; top: number; width: number; height: number };

// Draws a "⊤"-shaped connector per manager, grouping all of their reports
// together — the same shape as the static CEO→founders Connector just above
// this in OrganogramaCard: a stub straight down from the manager's own
// center, a horizontal bus roughly midway in the gap below, then one drop
// per report at their own X. Grouping by manager (rather than one straight
// line per manager-report pair) matters once a manager has more than one
// report: a direct line from the manager's edge to each report's center can
// end up running sideways straight through the manager's own circle when a
// report happens to sit near/under it (e.g. three reports spread under one
// manager) — the bus only ever starts below the manager's bottom edge, so it
// never crosses back through the manager's own box.
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

      const reportIdsByManager = new Map<string, string[]>();
      for (const { managerId, reportId } of pairs) {
        const list = reportIdsByManager.get(managerId) ?? [];
        list.push(reportId);
        reportIdsByManager.set(managerId, list);
      }

      const next: Segment[] = [];
      for (const [managerId, reportIds] of reportIdsByManager) {
        const managerEl = document.getElementById(`org-avatar-${managerId}`);
        if (!managerEl) continue;
        const m = managerEl.getBoundingClientRect();
        const managerCenterX = m.left + m.width / 2 - containerRect.left;
        const managerBottomY = m.bottom - containerRect.top;

        const reports = reportIds
          .map((id) => {
            const el = document.getElementById(`org-avatar-${id}`);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { centerX: r.left + r.width / 2 - containerRect.left, topY: r.top - containerRect.top };
          })
          .filter((r): r is { centerX: number; topY: number } => r !== null);
        if (reports.length === 0) continue;

        const minReportTopY = Math.min(...reports.map((r) => r.topY));
        const busY = managerBottomY + Math.max(8, (minReportTopY - managerBottomY) / 2);
        const xs = [managerCenterX, ...reports.map((r) => r.centerX)];
        const busLeft = Math.min(...xs);
        const busRight = Math.max(...xs);

        next.push({ left: managerCenterX - 1, top: managerBottomY, width: 2, height: Math.max(0, busY - managerBottomY) });
        next.push({ left: busLeft, top: busY - 1, width: Math.max(0, busRight - busLeft), height: 2 });
        for (const r of reports) {
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
