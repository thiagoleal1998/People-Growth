"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { alertDialog, confirmDialog } from "@/components/admin/dialog-store";
import { saveMenuOrder, resetMenuOrder } from "./menu-actions";

export type MenuEditorItem = { id: string; label: string; href?: string };

export function MenuEditor({ panel, title, items }: { panel: "admin" | "autor"; title: string; items: MenuEditorItem[] }) {
  const [list, setList] = useState(items);
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    setList((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function renameAt(index: number, label: string) {
    setList((prev) => prev.map((item, i) => (i === index ? { ...item, label } : item)));
  }

  function handleSave() {
    startTransition(async () => {
      await saveMenuOrder(panel, list.map(({ id, label }) => ({ id, label })));
      await alertDialog("Menu salvo.");
    });
  }

  async function handleReset() {
    if (!(await confirmDialog("Restaurar a ordem e os nomes padrão desse menu? As personalizações atuais são perdidas.", { danger: true, confirmText: "Restaurar" }))) return;
    startTransition(async () => {
      await resetMenuOrder(panel);
      // Simplest way to show the restored defaults: this component's own
      // state was seeded once from server props, so a full reload re-reads
      // them instead of having to duplicate the default list client-side.
      window.location.reload();
    });
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)" }}>{title}</h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={pending}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", background: "none", border: "none", cursor: pending ? "default" : "pointer" }}
        >
          <RotateCcw size={13} /> Restaurar padrão
        </button>
      </div>

      <div style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {list.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderTop: i > 0 ? "1px solid var(--admin-border)" : "none",
              backgroundColor: "var(--admin-surface)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Mover para cima"
                style={{ background: "none", border: "none", padding: "0.125rem", cursor: i === 0 ? "default" : "pointer", color: i === 0 ? "var(--admin-faint)" : "var(--admin-muted)" }}
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                title="Mover para baixo"
                style={{ background: "none", border: "none", padding: "0.125rem", cursor: i === list.length - 1 ? "default" : "pointer", color: i === list.length - 1 ? "var(--admin-faint)" : "var(--admin-muted)" }}
              >
                <ArrowDown size={14} />
              </button>
            </div>
            <input
              value={item.label}
              onChange={(e) => renameAt(i, e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--admin-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "11rem" }}>
              {item.href ?? "(submenu)"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          style={{
            backgroundColor: "#315E9C",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.125rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
