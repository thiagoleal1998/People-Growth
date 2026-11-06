"use client";

import { useState } from "react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarItemPanel } from "./CalendarItemPanel";
import type { CalendarCell } from "@/lib/calendar-grid";
import type { Article, ContentCalendarItem } from "@/types/database.types";

type ArticlePill = Pick<Article, "id" | "title_pt" | "status" | "scheduled_for" | "columnist_id"> & { columnistName: string | null };

type PanelState = { mode: "edit"; id: string } | { mode: "new"; date: string } | null;

export function CalendarPageClient({
  grid,
  itemsByDate,
  articlesByDate,
  monthKey,
  todayKey,
}: {
  grid: CalendarCell[];
  itemsByDate: Map<string, ContentCalendarItem[]>;
  articlesByDate: Map<string, ArticlePill[]>;
  monthKey: string;
  todayKey: string;
}) {
  const [panel, setPanel] = useState<PanelState>(null);

  const editingItem =
    panel?.mode === "edit"
      ? [...itemsByDate.values()].flat().find((i) => i.id === panel.id)
      : undefined;

  return (
    <>
      <CalendarGrid
        grid={grid}
        itemsByDate={itemsByDate}
        articlesByDate={articlesByDate}
        monthKey={monthKey}
        todayKey={todayKey}
        onOpenItem={(id) => setPanel({ mode: "edit", id })}
        onOpenNew={(date) => setPanel({ mode: "new", date })}
      />
      {panel && (
        <CalendarItemPanel
          item={editingItem}
          date={panel.mode === "new" ? panel.date : undefined}
          month={monthKey}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  );
}
