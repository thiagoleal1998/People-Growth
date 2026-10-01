// Pure month-grid math for the admin content calendar. The 42-cell,
// Sunday-first layout mirrors src/components/admin/DateTimePicker.tsx's
// buildMonthCells — duplicated here (rather than imported) because that
// file is a "use client" component and this needs to run in a Server
// Component.
//
// Grid cells are plain calendar days (year/month/day), not moments in
// time, so their dateKey is built straight from those integer components
// — no timeZone conversion needed, and mixing local Date getters with a
// timeZone-aware formatter here would risk an off-by-one-day bug depending
// on the server's own local timezone. dateKeySaoPaulo (date-key.ts) is for
// the one case that *is* timezone-sensitive: converting a real
// TIMESTAMPTZ (like an article's scheduled_for) into the São Paulo
// calendar day it falls on, so it can be matched against these keys.

export type CalendarCell = { date: Date; dateKey: string; inMonth: boolean };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function cellKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const startOffset = new Date(year, month, 1).getDay();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - startOffset + i);
    cells.push({ date, dateKey: cellKey(date), inMonth: date.getMonth() === month });
  }
  return cells;
}

export function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  // Default to "today" in América/São Paulo, not the server's own clock —
  // same reasoning as dateKeySaoPaulo elsewhere in this app.
  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const [y, m] = todayKey.split("-").map(Number);
  return { year: y, month: m - 1 };
}

export function monthParamKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
