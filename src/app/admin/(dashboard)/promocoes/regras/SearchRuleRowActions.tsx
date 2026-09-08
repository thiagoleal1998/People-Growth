"use client";

import { useTransition } from "react";
import { ConfirmDeleteButton } from "@/components/admin/ui";
import { toggleSearchRuleActive, deleteSearchRule } from "./actions";
import type { PromoSearchRule } from "@/types/database.types";

export function SearchRuleRowActions({ rule }: { rule: PromoSearchRule }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <button
        onClick={() => startTransition(() => toggleSearchRuleActive(rule.id, !rule.active))}
        disabled={pending}
        style={{
          padding: "0.3rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          border: "none",
          cursor: pending ? "default" : "pointer",
          backgroundColor: rule.active ? "rgba(6,214,160,0.1)" : "rgba(148,163,184,0.15)",
          color: rule.active ? "#04a87d" : "var(--admin-muted)",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {rule.active ? "Ativa" : "Inativa"}
      </button>
      <ConfirmDeleteButton confirmText={`Excluir a regra "${rule.query}"?`} onDelete={deleteSearchRule.bind(null, rule.id)} />
    </div>
  );
}
