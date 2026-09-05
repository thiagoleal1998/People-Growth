// Human-friendly sequential IDs shown in the UI (e.g. "CPG-0124",
// "IDPG-0007") — backed by the ticket_number/display_id SERIAL columns
// (migration 035), never the row's real UUID.
export function formatTicketId(ticketNumber: number): string {
  return `CPG-${String(ticketNumber).padStart(4, "0")}`;
}

export function formatUserId(displayId: number): string {
  return `IDPG-${String(displayId).padStart(4, "0")}`;
}
