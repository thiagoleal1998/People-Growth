"use client";

import { useState, type ReactNode } from "react";

export type KanbanColumn<S extends string> = {
  id: S;
  label: string;
  color: string;
};

export function KanbanBoard<T, S extends string>({
  columns,
  items,
  getId,
  getStatus,
  onMove,
  renderCard,
  onCardClick,
  emptyLabel = "Nenhum chamado aqui.",
}: {
  columns: KanbanColumn<S>[];
  items: T[];
  getId: (item: T) => string;
  getStatus: (item: T) => S;
  onMove: (item: T, status: S) => void;
  renderCard: (item: T) => ReactNode;
  onCardClick?: (item: T) => void;
  emptyLabel?: string;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<S | null>(null);
  const byId = new Map(items.map((it) => [getId(it), it]));

  return (
    <div style={{ display: "flex", gap: "1rem", overflowX: "auto", alignItems: "flex-start", paddingBottom: "0.5rem" }}>
      {columns.map((col, i) => {
        const colItems = items.filter((it) => getStatus(it) === col.id);
        const isOver = overColumn === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.id);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setOverColumn(null);
              const id = e.dataTransfer.getData("text/plain");
              const item = byId.get(id);
              if (item && getStatus(item) !== col.id) onMove(item, col.id);
              setDraggingId(null);
            }}
            style={{
              flex: "1 1 270px",
              minWidth: "270px",
              backgroundColor: isOver ? "var(--admin-surface-alt)" : "transparent",
              borderRadius: "0.75rem",
              padding: "0.375rem",
              transition: "background-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.5rem 0.75rem" }}>
              <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: col.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)" }}>{col.label}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)", fontWeight: 700 }}>({colItems.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", minHeight: "90px" }}>
              {colItems.length === 0 ? (
                <div style={{ padding: "1.5rem 0.75rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{emptyLabel}</div>
              ) : (
                colItems.map((item) => {
                  const id = getId(item);
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => onCardClick?.(item)}
                      style={{
                        backgroundColor: "var(--admin-surface)",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "0.75rem",
                        padding: "0.875rem",
                        cursor: onCardClick ? "pointer" : "grab",
                        opacity: draggingId === id ? 0.4 : 1,
                      }}
                    >
                      {renderCard(item)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }).reduce<ReactNode[]>((acc, col, i) => {
        if (i > 0) acc.push(<div key={`sep-${i}`} style={{ width: "1px", alignSelf: "stretch", backgroundColor: "var(--admin-border)", flexShrink: 0 }} />);
        acc.push(col);
        return acc;
      }, [])}
    </div>
  );
}
