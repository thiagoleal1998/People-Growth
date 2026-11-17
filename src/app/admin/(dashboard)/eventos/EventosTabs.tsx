"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Ticket, Car, UtensilsCrossed, CircleDollarSign, Users, ExternalLink } from "lucide-react";
import { PrimaryLinkButton, Badge, EmptyState, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteEvent } from "./actions";
import type { Event } from "@/types/database.types";

const STATES = [
  { id: "RJ" as const, label: "Rio de Janeiro" },
  { id: "SP" as const, label: "São Paulo" },
  { id: "MG" as const, label: "Minas Gerais" },
];

const DECISION_LABEL: Record<Event["decision"], { label: string; tone: "success" | "danger" | "neutral" }> = {
  sim: { label: "Vamos", tone: "success" },
  nao: { label: "Não vamos", tone: "danger" },
  a_decidir: { label: "A decidir", tone: "neutral" },
};

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const startLabel = new Date(`${start}T00:00:00`).toLocaleDateString("pt-BR", opts);
  if (!end || end === start) return startLabel;
  const endDate = new Date(`${end}T00:00:00`);
  const endLabel = endDate.toLocaleDateString("pt-BR", { ...opts, year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function CostRow({ icon, label, value, notes }: { icon: React.ReactNode; label: string; value: number | null; notes?: string | null }) {
  if (value === null && !notes) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}>
      <span style={{ color: "var(--admin-muted)", flexShrink: 0, marginTop: "0.125rem" }}>{icon}</span>
      <div>
        <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{label}:</span> {value !== null ? formatMoney(value) : "—"}
        {notes && <div style={{ color: "var(--admin-faint)", fontSize: "0.75rem", marginTop: "0.125rem" }}>{notes}</div>}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const total = [event.base_price, event.travel_cost, event.food_cost, event.other_cost].reduce((sum: number | null, v) => (v === null ? sum : (sum ?? 0) + v), null as number | null);
  const decision = DECISION_LABEL[event.decision];
  const dateRange = formatDateRange(event.date_start, event.date_end);
  const sources = (event.source_urls ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean);

  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>{event.name}</h3>
          <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: "0.125rem" }}>
            {[event.city, dateRange].filter(Boolean).join(" · ")}
          </div>
        </div>
        <Badge tone={decision.tone}>{decision.label}</Badge>
      </div>

      {event.interest_description && <p style={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)", margin: 0, lineHeight: 1.5 }}>{event.interest_description}</p>}

      {event.attendees && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}>
          <Users size={15} color="var(--admin-muted)" /> {event.attendees}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.875rem", backgroundColor: "var(--admin-surface-alt)", borderRadius: "0.625rem" }}>
        <CostRow icon={<Ticket size={15} />} label="Ingresso (total p/ quem vai)" value={event.base_price} notes={event.price_notes} />
        <CostRow icon={<Car size={15} />} label="Deslocamento" value={event.travel_cost} notes={event.travel_notes} />
        <CostRow icon={<UtensilsCrossed size={15} />} label="Alimentação" value={event.food_cost} />
        <CostRow icon={<CircleDollarSign size={15} />} label="Outros" value={event.other_cost} notes={event.other_cost_notes} />
        {total !== null && (
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid var(--admin-border)", fontSize: "0.875rem", fontWeight: 800, color: "var(--admin-text)" }}>
            <span>Total estimado</span>
            <span>{formatMoney(total)}</span>
          </div>
        )}
      </div>

      {event.notes && <p style={{ fontSize: "0.75rem", color: "var(--admin-faint)", margin: 0, fontStyle: "italic" }}>{event.notes}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
        {event.ticket_url && (
          <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#315E9C", textDecoration: "none", fontWeight: 600 }}>
            <ExternalLink size={13} /> Ingressos
          </a>
        )}
        {sources.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--admin-muted)", textDecoration: "none" }}>
            <ExternalLink size={13} /> Fonte {sources.length > 1 ? i + 1 : ""}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", borderTop: "1px solid var(--admin-border)", paddingTop: "0.75rem" }}>
        <Link href={`/admin/eventos/${event.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#315E9C", textDecoration: "none", fontWeight: 600 }}>
          <Edit size={14} /> Editar
        </Link>
        <ConfirmDeleteButton confirmText={`Excluir o evento "${event.name}"?`} onDelete={deleteEvent.bind(null, event.id)} />
      </div>
    </div>
  );
}

export function EventosTabs({ events, initialTab }: { events: Event[]; initialTab?: string }) {
  const [state, setState] = useState<(typeof STATES)[number]["id"]>(STATES.some((s) => s.id === initialTab) ? (initialTab as (typeof STATES)[number]["id"]) : "RJ");
  const stateCounts = new Map<string, number>();
  for (const e of events) stateCounts.set(e.state, (stateCounts.get(e.state) ?? 0) + 1);
  const visible = events.filter((e) => e.state === state);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATES.map((s) => {
            const isActive = state === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setState(s.id)}
                style={{
                  padding: "0.5rem 0.875rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: isActive ? "white" : "var(--admin-text-secondary)",
                  backgroundColor: isActive ? "#315E9C" : "var(--admin-surface)",
                  border: `1px solid ${isActive ? "#315E9C" : "var(--admin-border-strong)"}`,
                  borderRadius: "9999px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                {s.id}
                <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: isActive ? "white" : "var(--admin-muted)", backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "var(--admin-border)", borderRadius: "9999px", padding: "0 0.4375rem" }}>
                  {stateCounts.get(s.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <PrimaryLinkButton href={`/admin/eventos/novo?state=${state}`}>
          <Plus size={16} /> Novo evento
        </PrimaryLinkButton>
      </div>

      {visible.length === 0 ? (
        <EmptyState text="Nenhum evento cadastrado nesse estado ainda." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))", gap: "1.25rem" }}>
          {visible.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
