"use client";

import { useState } from "react";
import { ErrorReportsClient } from "./ErrorReportsClient";
import { InternalTicketsClient } from "@/components/tickets/InternalTicketsClient";
import { createInternalTicket, updateInternalTicket, deleteInternalTicket } from "./actions";
import type { ErrorReport, InternalTicket } from "@/types/database.types";

const tabs = [
  { id: "erros", label: "Erros reportados" },
  { id: "internos", label: "Chamados internos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ChamadosTabs({ reports, tickets }: { reports: ErrorReport[]; tickets: InternalTicket[] }) {
  const [active, setActive] = useState<TabId>("erros");

  const counts: Record<TabId, number> = {
    erros: reports.filter((r) => r.status === "new").length,
    internos: tickets.filter((t) => t.status !== "resolved").length,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: active === tab.id ? "#4361EE" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #4361EE" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span
                style={{
                  backgroundColor: active === tab.id ? "#4361EE" : "var(--admin-border-strong)",
                  color: active === tab.id ? "white" : "var(--admin-muted)",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  minWidth: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.3rem",
                }}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {active === "erros" ? (
        <ErrorReportsClient reports={reports} />
      ) : (
        <InternalTicketsClient
          tickets={tickets}
          canManage
          createAction={createInternalTicket}
          updateAction={updateInternalTicket}
          deleteAction={deleteInternalTicket}
        />
      )}
    </div>
  );
}
