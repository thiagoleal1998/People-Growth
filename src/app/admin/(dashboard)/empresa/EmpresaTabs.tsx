"use client";

import { useState } from "react";
import { OrganogramaCard } from "@/components/OrganogramaCard";
import { RoleProfilesTable } from "./RoleProfilesTable";
import { ROLE_LEVELS, type RoleLevel } from "@/lib/role-levels";
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
  const [level, setLevel] = useState<RoleLevel>("c_level");
  // Built client-side rather than passed down as a prop — a Map isn't
  // serializable across the server/client boundary, only plain data is.
  const columnistNameById = new Map(columnists.map((c) => [c.id, c.name]));
  const levelCounts = new Map<string, number>();
  for (const p of roleProfiles) levelCounts.set(p.level, (levelCounts.get(p.level) ?? 0) + 1);

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
        <div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {ROLE_LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                style={{
                  padding: "0.5rem 0.875rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: level === l.id ? "white" : "var(--admin-text-secondary)",
                  backgroundColor: level === l.id ? "#315E9C" : "var(--admin-surface)",
                  border: "1px solid var(--admin-border-strong)",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                {l.label}
                {(levelCounts.get(l.id) ?? 0) > 0 && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      color: level === l.id ? "white" : "var(--admin-muted)",
                      backgroundColor: level === l.id ? "rgba(255,255,255,0.25)" : "var(--admin-border)",
                      borderRadius: "9999px",
                      padding: "0 0.4375rem",
                    }}
                  >
                    {levelCounts.get(l.id)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <RoleProfilesTable profiles={roleProfiles.filter((p) => p.level === level)} columnistNameById={columnistNameById} defaultLevel={level} />
        </div>
      )}
    </div>
  );
}
