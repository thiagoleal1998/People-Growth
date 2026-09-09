// Returns the calendar day (YYYY-MM-DD) for an ISO timestamp, always in
// America/Sao_Paulo — matches the value format of <input type="date">, so
// date-range filters compare like-for-like regardless of the browser's own
// timezone (same reasoning as the timeZone fixes elsewhere in this app).
export function dateKeySaoPaulo(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}
