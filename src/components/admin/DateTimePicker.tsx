"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { fieldControlStyle } from "./ui";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(date: Date) {
  return date.toISOString();
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthCells(viewYear: number, viewMonth: number): Date[] {
  const startOffset = new Date(viewYear, viewMonth, 1).getDay();
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(viewYear, viewMonth, 1 - startOffset + i));
  }
  return cells;
}

/** A small hand-rolled date+time picker, styled to match the admin UI kit —
 * replaces the native datetime-local widget, whose popup calendar can't be
 * restyled at all via CSS in any browser. */
export function DateTimePicker({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [selected, setSelected] = useState<Date | null>(() => (defaultValue ? new Date(defaultValue) : null));
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());

  const hour = selected ? selected.getHours() : 0;
  const minute = selected ? Math.round(selected.getMinutes() / 5) * 5 : 0;

  function commit(date: Date) {
    setSelected(date);
  }

  function handleDayClick(day: Date) {
    const next = new Date(day);
    next.setHours(selected?.getHours() ?? 0, selected?.getMinutes() ?? 0, 0, 0);
    commit(next);
    setViewDate(next);
  }

  function handleTimeChange(nextHour: number, nextMinute: number) {
    const base = selected ?? viewDate;
    const next = new Date(base);
    next.setHours(nextHour, nextMinute, 0, 0);
    commit(next);
  }

  function handleOutsideMouseDown(e: React.MouseEvent) {
    // The popover is rendered inside containerRef too, so a click on the
    // trigger button or the panel itself never reaches this handler target.
    if (e.target === e.currentTarget) setOpen(false);
  }

  const cells = buildMonthCells(viewDate.getFullYear(), viewDate.getMonth());
  const today = new Date();

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ ...fieldControlStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ color: selected ? "var(--admin-text)" : "var(--admin-faint)" }}>
          {selected
            ? `${pad(selected.getDate())}/${pad(selected.getMonth() + 1)}/${selected.getFullYear()} às ${pad(selected.getHours())}:${pad(selected.getMinutes())}`
            : "Selecionar data e hora"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {selected && (
            <X
              size={14}
              style={{ color: "var(--admin-faint)" }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
            />
          )}
          <CalendarIcon size={15} style={{ color: "var(--admin-faint)" }} />
        </span>
      </button>
      <input type="hidden" name={name} value={selected ? toIso(selected) : ""} />

      {open && (
        <>
          <div
            onMouseDown={handleOutsideMouseDown}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: 0,
              zIndex: 50,
              backgroundColor: "var(--admin-surface)",
              border: "1px solid var(--admin-border-strong)",
              borderRadius: "0.75rem",
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.25)",
              padding: "1rem",
              width: "18.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--admin-muted)", padding: "0.25rem" }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)" }}>
                {MONTHS[viewDate.getMonth()]} de {viewDate.getFullYear()}
              </div>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--admin-muted)", padding: "0.25rem" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.125rem", marginBottom: "0.25rem" }}>
              {WEEKDAYS.map((w, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: "var(--admin-faint)", padding: "0.25rem 0" }}>
                  {w}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.125rem" }}>
              {cells.map((day, i) => {
                const inMonth = day.getMonth() === viewDate.getMonth();
                const isToday = sameDay(day, today);
                const isSelected = selected != null && sameDay(day, selected);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    style={{
                      aspectRatio: "1",
                      border: isToday && !isSelected ? "1px solid #4361EE" : "1px solid transparent",
                      borderRadius: "0.5rem",
                      background: isSelected ? "#4361EE" : "none",
                      color: isSelected ? "white" : inMonth ? "var(--admin-text)" : "var(--admin-faint)",
                      fontWeight: isSelected || isToday ? 700 : 500,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid var(--admin-border)" }}>
              <select
                value={hour}
                onChange={(e) => handleTimeChange(Number(e.target.value), minute)}
                style={{ ...fieldControlStyle, padding: "0.375rem 0.5rem", fontSize: "0.8125rem", width: "auto", cursor: "pointer" }}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>{pad(h)}h</option>
                ))}
              </select>
              <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
                style={{ ...fieldControlStyle, padding: "0.375rem 0.5rem", fontSize: "0.8125rem", width: "auto", cursor: "pointer" }}
              >
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <option key={m} value={m}>{pad(m)}min</option>
                ))}
              </select>

              <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setOpen(false);
                  }}
                  style={{ border: "none", background: "none", color: "var(--admin-muted)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ border: "none", background: "none", color: "#4361EE", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
