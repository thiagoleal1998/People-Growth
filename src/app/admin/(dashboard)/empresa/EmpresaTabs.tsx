"use client";

import { useState } from "react";
import { OrganogramaCard } from "@/components/OrganogramaCard";
import { RoleProfilesTable } from "./RoleProfilesTable";
import type { Columnist, RoleProfile } from "@/types/database.types";

const tabs = [
  { id: "organograma", label: "Organograma" },
  { id: "cargos", label: "Cargos e Funções" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function EmpresaTabs({
  columnists,
  roleProfiles,
  initialTab,
}: {
  columnists: Columnist[];
  roleProfiles: RoleProfile[];
  initialTab?: string;
}) {
  const [active, setActive] = useState<TabId>(initialTab === "cargos" ? "cargos" : "organograma");
  // Built client-side rather than passed down as a prop — a Map isn't
  // serializable across the server/client boundary, only plain data is.
  const columnistNameById = new Map(columnists.map((c) => [c.id, c.name]));

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: "0.875rem 1.25rem",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: active === tab.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2px solid #315E9C" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "organograma" ? (
        <OrganogramaCard columnists={columnists} />
      ) : (
        <RoleProfilesTable profiles={roleProfiles} columnistNameById={columnistNameById} />
      )}
    </div>
  );
}
