"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ui";
import { createCategory, updateCategory, deleteCategory } from "./category-actions";
import type { Category } from "@/types/database.types";

type Draft = { name_pt: string; name_en: string; slug: string; color: string };

function toDraft(c: Category): Draft {
  return { name_pt: c.name_pt, name_en: c.name_en ?? "", slug: c.slug, color: c.color ?? "#4361EE" };
}

const cellStyle = { padding: "0.625rem 0.875rem" } as const;
const inputStyle = { width: "100%", padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" };

function CategoryRow({ category, articleCount, onSaved, onDeleted }: { category: Category; articleCount: number; onSaved: (c: Category) => void; onDeleted: () => void }) {
  const [draft, setDraft] = useState<Draft>(toDraft(category));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateCategory(category.id, draft);
        onSaved({ ...category, name_pt: draft.name_pt.trim(), name_en: draft.name_en.trim() || null, slug: draft.slug.trim() || category.slug, color: draft.color.trim() || null });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <tr style={{ borderTop: "1px solid var(--admin-border)" }}>
      <td style={cellStyle}>
        <input type="color" value={draft.color} onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))} style={{ width: "2rem", height: "1.75rem", padding: 0, border: "1px solid var(--admin-border-strong)", borderRadius: "0.375rem", cursor: "pointer" }} />
      </td>
      <td style={cellStyle}>
        <input value={draft.name_pt} onChange={(e) => setDraft((d) => ({ ...d, name_pt: e.target.value }))} style={inputStyle} />
      </td>
      <td style={cellStyle}>
        <input value={draft.name_en} onChange={(e) => setDraft((d) => ({ ...d, name_en: e.target.value }))} style={inputStyle} placeholder="(opcional)" />
      </td>
      <td style={cellStyle}>
        <input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} style={inputStyle} />
      </td>
      <td style={{ ...cellStyle, color: "var(--admin-muted)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
        {articleCount} artigo{articleCount === 1 ? "" : "s"}
      </td>
      <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
        <button
          type="button"
          disabled={pending}
          onClick={save}
          style={{ backgroundColor: "var(--admin-surface-alt)", color: "var(--admin-text)", border: "1px solid var(--admin-border-strong)", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.8125rem", fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1, marginRight: "0.5rem" }}
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <ConfirmDeleteButton
          confirmText={
            articleCount > 0
              ? `Excluir "${category.name_pt}"? ${articleCount} artigo${articleCount === 1 ? "" : "s"} ${articleCount === 1 ? "que usa essa categoria como principal fica" : "que usam essa categoria como principal ficam"} sem categoria — eles continuam publicados, só saem dessa listagem.`
              : `Excluir "${category.name_pt}"? Nenhum artigo usa essa categoria hoje.`
          }
          onDelete={async () => {
            await deleteCategory(category.id, category.name_pt);
            onDeleted();
          }}
        />
      </td>
      {error && (
        <td colSpan={6} style={{ padding: "0 0.875rem 0.625rem", color: "#dc2626", fontSize: "0.75rem" }}>
          {error}
        </td>
      )}
    </tr>
  );
}

export function CategoriesManager({ categories, articleCounts }: { categories: Category[]; articleCounts: Record<string, number> }) {
  const [items, setItems] = useState(categories);
  const [newDraft, setNewDraft] = useState<Draft>({ name_pt: "", name_en: "", slug: "", color: "#4361EE" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createCategory(newDraft);
        setItems((prev) => [...prev, created].sort((a, b) => a.name_pt.localeCompare(b.name_pt, "pt-BR")));
        setNewDraft({ name_pt: "", name_en: "", slug: "", color: "#4361EE" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar.");
      }
    });
  }

  return (
    <div>
      <div style={{ overflowX: "auto", borderRadius: "0.75rem", border: "1px solid var(--admin-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Cor", "Nome (PT)", "Nome (EN)", "URL (slug)", "", ""].map((h) => (
                <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>
                  Nenhuma categoria cadastrada ainda.
                </td>
              </tr>
            ) : (
              items.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  articleCount={articleCounts[category.id] ?? 0}
                  onSaved={(updated) => setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)).sort((a, b) => a.name_pt.localeCompare(b.name_pt, "pt-BR")))}
                  onDeleted={() => setItems((prev) => prev.filter((c) => c.id !== category.id))}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.25rem", padding: "1rem 1.125rem", borderRadius: "0.75rem", border: "1px dashed var(--admin-border-strong)" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.75rem" }}>Nova categoria</div>
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
          <input type="color" value={newDraft.color} onChange={(e) => setNewDraft((d) => ({ ...d, color: e.target.value }))} style={{ width: "2rem", height: "1.75rem", padding: 0, border: "1px solid var(--admin-border-strong)", borderRadius: "0.375rem", cursor: "pointer" }} />
          <input placeholder="Nome em português" value={newDraft.name_pt} onChange={(e) => setNewDraft((d) => ({ ...d, name_pt: e.target.value }))} style={{ ...inputStyle, width: "200px" }} />
          <input placeholder="Nome em inglês (opcional)" value={newDraft.name_en} onChange={(e) => setNewDraft((d) => ({ ...d, name_en: e.target.value }))} style={{ ...inputStyle, width: "200px" }} />
          <input placeholder="URL (opcional, gerada automaticamente)" value={newDraft.slug} onChange={(e) => setNewDraft((d) => ({ ...d, slug: e.target.value }))} style={{ ...inputStyle, width: "220px" }} />
          <button
            type="button"
            disabled={pending || !newDraft.name_pt.trim()}
            onClick={add}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: "#4361EE", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.8125rem", border: "none", cursor: pending || !newDraft.name_pt.trim() ? "default" : "pointer", opacity: pending || !newDraft.name_pt.trim() ? 0.6 : 1 }}
          >
            <Plus size={15} /> {pending ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
        {error && <div style={{ color: "#dc2626", fontSize: "0.8125rem", marginTop: "0.625rem" }}>{error}</div>}
      </div>
    </div>
  );
}
