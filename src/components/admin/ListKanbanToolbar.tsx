"use client";

import { Search, LayoutGrid, List as ListIcon } from "lucide-react";
import { Input, Select, fieldControlStyle } from "@/components/admin/ui";

export type BoardView = "kanban" | "lista";

type UserOption = { value: string; label: string };

export function ListKanbanToolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder = "Pesquisar...",
  userOptions,
  userValue,
  onUserChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: {
  view: BoardView;
  onViewChange: (v: BoardView) => void;
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  userOptions?: UserOption[];
  userValue?: string;
  onUserChange?: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "inline-flex", alignSelf: "flex-start", border: "1px solid var(--admin-border-strong)", borderRadius: "0.625rem", overflow: "hidden" }}>
        {(["kanban", "lista"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              backgroundColor: view === v ? "#4361EE" : "var(--admin-surface)",
              color: view === v ? "white" : "var(--admin-muted)",
            }}
          >
            {v === "kanban" ? <LayoutGrid size={15} /> : <ListIcon size={15} />}
            {v === "kanban" ? "Kanban" : "Lista"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)", pointerEvents: "none" }} />
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} style={{ paddingLeft: "2.25rem" }} />
        </div>

        {userOptions && onUserChange && (
          <Select value={userValue} onChange={(e) => onUserChange(e.target.value)} style={{ width: "auto", minWidth: "180px" }}>
            <option value="">Todos os usuários</option>
            {userOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} style={{ ...fieldControlStyle, width: "auto" }} />
          <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)" }}>até</span>
          <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} style={{ ...fieldControlStyle, width: "auto" }} />
        </div>
      </div>
    </div>
  );
}
