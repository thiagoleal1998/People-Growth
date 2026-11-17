"use client";

import { useState, useTransition } from "react";
import { X, Plus, Trash2, Send } from "lucide-react";
import { confirmDialog } from "@/components/admin/dialog-store";
import {
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  addComment,
  deleteComment,
} from "./actions";
import type { TaskWithDetails, Person } from "./TarefasBoard";

const PRIORITY_OPTIONS: { value: TaskWithDetails["priority"]; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function TaskModal({
  task,
  people,
  currentUserId,
  onClose,
  onChange,
  onDeleted,
}: {
  task: TaskWithDetails;
  people: Person[];
  currentUserId: string;
  onClose: () => void;
  onChange: (task: TaskWithDetails) => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [newComment, setNewComment] = useState("");
  const [, startTransition] = useTransition();
  const canDelete = task.created_by === currentUserId;

  function commit(patch: Partial<TaskWithDetails>) {
    onChange({ ...task, ...patch });
  }

  function handleTitleBlur() {
    if (title.trim() && title !== task.title) {
      commit({ title });
      startTransition(() => updateTask(task.id, { title }));
    } else {
      setTitle(task.title);
    }
  }

  function handleDescriptionBlur() {
    if (description !== (task.description ?? "")) {
      commit({ description: description || null });
      startTransition(() => updateTask(task.id, { description: description || null }));
    }
  }

  function handlePriorityChange(priority: TaskWithDetails["priority"]) {
    commit({ priority });
    startTransition(() => updateTask(task.id, { priority }));
  }

  function handleDueDateChange(due_date: string) {
    commit({ due_date: due_date || null });
    startTransition(() => updateTask(task.id, { due_date: due_date || null }));
  }

  function toggleAssignee(person: Person) {
    const isAssigned = task.assignees.some((p) => p.id === person.id);
    if (isAssigned) {
      commit({ assignees: task.assignees.filter((p) => p.id !== person.id) });
      startTransition(() => removeAssignee(task.id, person.id));
    } else {
      commit({ assignees: [...task.assignees, person] });
      startTransition(() => addAssignee(task.id, person.id));
    }
  }

  async function handleAddChecklistItem() {
    const label = newChecklistLabel.trim();
    if (!label) return;
    setNewChecklistLabel("");
    await addChecklistItem(task.id, label);
    commit({ checklist: [...task.checklist, { id: `temp-${Date.now()}`, task_id: task.id, label, done: false, order: task.checklist.length, created_at: new Date().toISOString() }] });
  }

  function handleToggleChecklistItem(id: string, done: boolean) {
    commit({ checklist: task.checklist.map((c) => (c.id === id ? { ...c, done } : c)) });
    startTransition(() => toggleChecklistItem(id, done));
  }

  function handleDeleteChecklistItem(id: string) {
    commit({ checklist: task.checklist.filter((c) => c.id !== id) });
    startTransition(() => deleteChecklistItem(id));
  }

  async function handleAddComment() {
    const body = newComment.trim();
    if (!body) return;
    setNewComment("");
    await addComment(task.id, body);
    commit({ comments: [...task.comments, { id: `temp-${Date.now()}`, task_id: task.id, author_id: currentUserId, author_name: "Você", body, created_at: new Date().toISOString() }] });
  }

  function handleDeleteComment(id: string) {
    commit({ comments: task.comments.filter((c) => c.id !== id) });
    startTransition(() => deleteComment(id));
  }

  async function handleDeleteTask() {
    if (!(await confirmDialog(`Excluir a tarefa "${task.title}"?`, { danger: true, confirmText: "Excluir" }))) return;
    await deleteTask(task.id);
    onDeleted();
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,27,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", zIndex: 400 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", borderRadius: "1rem", maxWidth: "640px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div style={{ padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            style={{ fontSize: "1.0625rem", fontWeight: 800, border: "none", background: "none", color: "var(--admin-text)", flex: 1, outline: "none" }}
          />
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-scroll" style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Descrição..."
            rows={3}
            style={{ width: "100%", border: "1px solid var(--admin-border)", borderRadius: "0.625rem", padding: "0.75rem", fontSize: "0.875rem", color: "var(--admin-text)", backgroundColor: "var(--admin-surface-alt)", resize: "vertical", fontFamily: "inherit" }}
          />

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)" }}>
              Prioridade
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskWithDetails["priority"])}
                style={{ padding: "0.375rem 0.625rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", cursor: "pointer" }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)" }}>
              Prazo
              <input
                type="date"
                value={task.due_date ?? ""}
                onChange={(e) => handleDueDateChange(e.target.value)}
                style={{ padding: "0.375rem 0.625rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
              />
            </label>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>RESPONSÁVEIS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {people.map((p) => {
                const checked = task.assignees.some((a) => a.id === p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      backgroundColor: checked ? "rgba(49,94,156,0.12)" : "var(--admin-surface-alt)",
                      color: checked ? "#315E9C" : "var(--admin-text-secondary)",
                      fontWeight: checked ? 700 : 500,
                    }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleAssignee(p)} style={{ margin: 0 }} />
                    {p.name}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>CHECKLIST</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {task.checklist.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" checked={item.done} onChange={(e) => handleToggleChecklistItem(item.id, e.target.checked)} />
                  <span style={{ flex: 1, fontSize: "0.875rem", color: item.done ? "var(--admin-faint)" : "var(--admin-text)", textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
                  <button type="button" onClick={() => handleDeleteChecklistItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", display: "flex" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <input
                  value={newChecklistLabel}
                  onChange={(e) => setNewChecklistLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Novo item..."
                  style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
                />
                <button type="button" onClick={handleAddChecklistItem} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", background: "none", cursor: "pointer", color: "var(--admin-text)" }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>COMENTÁRIOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {task.comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: "0.625rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{c.author_name}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", whiteSpace: "pre-wrap" }}>{c.body}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>{formatDateTime(c.created_at)}</div>
                  </div>
                  {c.author_id === currentUserId && (
                    <button type="button" onClick={() => handleDeleteComment(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)", display: "flex", height: "fit-content" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--admin-border)", padding: "1rem 1.5rem", display: "flex", gap: "0.625rem", alignItems: "center" }}>
          {canDelete && (
            <button type="button" onClick={handleDeleteTask} title="Excluir tarefa" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "none", cursor: "pointer", color: "#dc2626" }}>
              <Trash2 size={16} />
            </button>
          )}
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddComment();
              }
            }}
            placeholder="Escreva um comentário..."
            style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.8125rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
          />
          <button type="button" onClick={handleAddComment} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#315E9C", cursor: "pointer", color: "white" }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
