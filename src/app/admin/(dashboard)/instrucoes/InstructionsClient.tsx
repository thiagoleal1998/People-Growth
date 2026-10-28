"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ui";
import { createInstructionItem, updateInstructionItem, deleteInstructionItem, moveInstructionItem } from "./actions";
import type { InstructionItem } from "@/types/database.types";

const TABS: { id: InstructionItem["kind"]; label: string; itemLabel: string; titleLabel: string; bodyLabel: string }[] = [
  { id: "step", label: "Etapas", itemLabel: "etapa", titleLabel: "Título da etapa", bodyLabel: "O que o colunista deve fazer" },
  { id: "faq", label: "FAQ", itemLabel: "pergunta", titleLabel: "Pergunta", bodyLabel: "Resposta" },
];

function InstructionRow({
  item,
  position,
  isFirst,
  isLast,
  onSaved,
  onDeleted,
  onMoved,
}: {
  item: InstructionItem;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onSaved: (i: InstructionItem) => void;
  onDeleted: () => void;
  onMoved: (direction: "up" | "down") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [pending, startTransition] = useTransition();
  const [movePending, startMove] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div style={{ padding: "1.125rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", minWidth: 0 }}>
            {item.kind === "step" && (
              <div style={{ flexShrink: 0, width: "1.75rem", height: "1.75rem", borderRadius: "50%", backgroundColor: "rgba(49, 94, 156,0.1)", color: "#315E9C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8125rem" }}>
                {position}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{item.title}</div>
              <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", marginTop: "0.375rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{item.body}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
            <button type="button" disabled={isFirst || movePending} onClick={() => startMove(() => onMoved("up"))} title="Mover para cima" style={{ width: "1.875rem", height: "1.875rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.4 : 1 }}>
              <ArrowUp size={14} />
            </button>
            <button type="button" disabled={isLast || movePending} onClick={() => startMove(() => onMoved("down"))} title="Mover para baixo" style={{ width: "1.875rem", height: "1.875rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.4 : 1 }}>
              <ArrowDown size={14} />
            </button>
            <button type="button" onClick={() => setEditing(true)} style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
              Editar
            </button>
            <ConfirmDeleteButton confirmText={`Excluir "${item.title}"? Some do painel do autor.`} onDelete={async () => { await deleteInstructionItem(item.id, item.title); onDeleted(); }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.125rem 1.25rem", borderTop: "1px solid var(--admin-border)" }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", fontWeight: 700, backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", marginBottom: "0.625rem" }} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", resize: "vertical" }} />
      {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.625rem" }}>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await updateInstructionItem(item.id, title, body);
                onSaved({ ...item, title: title.trim(), body: body.trim() });
                setEditing(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao salvar.");
              }
            });
          }}
          style={{ backgroundColor: "#315E9C", color: "white", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={() => { setEditing(false); setTitle(item.title); setBody(item.body); setError(null); }} style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.8125rem", border: "1px solid var(--admin-border-strong)", cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function InstructionsClient({ items: initialItems }: { items: InstructionItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<InstructionItem["kind"]>("step");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tabConfig = TABS.find((t) => t.id === tab)!;
  const visibleItems = useMemo(() => items.filter((i) => i.kind === tab).sort((a, b) => a.sort_order - b.sort_order), [items, tab]);

  function send() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createInstructionItem(tab, title, body);
        setItems((prev) => [...prev, created]);
        setTitle("");
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  async function handleMove(item: InstructionItem, direction: "up" | "down") {
    // Optimistic local swap — moveInstructionItem does the real swap
    // server-side; revalidatePath will reconcile on next full navigation.
    const ordered = items.filter((i) => i.kind === item.kind).sort((a, b) => a.sort_order - b.sort_order);
    const index = ordered.findIndex((i) => i.id === item.id);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= ordered.length) return;
    const neighbor = ordered[neighborIndex];

    await moveInstructionItem(item.id, direction);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) return { ...i, sort_order: neighbor.sort_order };
        if (i.id === neighbor.id) return { ...i, sort_order: item.sort_order };
        return i;
      })
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.5rem" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: tab === t.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #315E9C" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: "1.5rem", alignItems: "start" }} className="instructions-grid">
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Nova {tabConfig.itemLabel}</h2>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{tabConfig.titleLabel}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", marginBottom: "1rem" }} />
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{tabConfig.bodyLabel}</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", resize: "vertical", marginBottom: "1rem" }} />
          {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</div>}
          <button
            type="button"
            disabled={pending || !title.trim() || !body.trim()}
            onClick={send}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: pending || !title.trim() || !body.trim() ? "default" : "pointer", opacity: pending || !title.trim() || !body.trim() ? 0.6 : 1 }}
          >
            <Plus size={15} /> {pending ? "Salvando..." : `Adicionar ${tabConfig.itemLabel}`}
          </button>
        </div>

        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
          {visibleItems.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.9rem" }}>Nenhuma {tabConfig.itemLabel} cadastrada ainda.</div>
          ) : (
            visibleItems.map((item, index) => (
              <InstructionRow
                key={item.id}
                item={item}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === visibleItems.length - 1}
                onSaved={(updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))}
                onDeleted={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                onMoved={(direction) => handleMove(item, direction)}
              />
            ))
          )}
        </div>

        <style>{`
          @media (max-width: 860px) {
            .instructions-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
