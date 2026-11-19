"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X, Check, Calendar } from "lucide-react";
import { KanbanBoard, type KanbanColumn } from "@/components/admin/KanbanBoard";
import { promptDialog, confirmDialog, alertDialog } from "@/components/admin/dialog-store";
import { formatTaskId } from "@/lib/display-id";
import { TaskModal } from "./TaskModal";
import { createColumn, renameColumn, deleteColumn, createTask, moveTask, markTaskSeen } from "./actions";
import type { TaskColumn, TaskChecklistItem, TaskComment, TaskAttachment } from "@/types/database.types";

export type Person = { id: string; name: string };
export type TaskWithDetails = {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "baixa" | "media" | "alta";
  due_date: string | null;
  created_by: string;
  order: number;
  task_number: number;
  created_at: string;
  updated_at: string;
  assignees: Person[];
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
};

const PRIORITY_CONFIG: Record<TaskWithDetails["priority"], { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "#16A34A" },
  media: { label: "Média", color: "#cc9200" },
  alta: { label: "Alta", color: "#dc2626" },
};

const COLUMN_COLORS = ["#315E9C", "#A07B3B", "#16A34A", "#7c3aed", "#dc2626", "#0EA5E9"];

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function TarefasBoard({
  columns,
  tasks,
  people,
  currentUserId,
  canManageColumns,
}: {
  columns: TaskColumn[];
  tasks: TaskWithDetails[];
  people: Person[];
  currentUserId: string;
  canManageColumns: boolean;
}) {
  const [items, setItems] = useState(tasks);
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Shareable per-card link (/tarefas/[id]) lands here with ?task=ID — open
  // it right away if that task is in the visible set (RLS already decided
  // whether it belongs there).
  const taskParam = searchParams.get("task");
  const initialTaskFromUrl = taskParam && tasks.some((t) => t.id === taskParam) ? taskParam : null;
  const [openTaskId, setOpenTaskId] = useState<string | null>(initialTaskFromUrl);
  const openTask = items.find((t) => t.id === openTaskId) ?? null;

  useEffect(() => {
    if (initialTaskFromUrl) markTaskSeen(initialTaskFromUrl).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCardClick(task: TaskWithDetails) {
    setOpenTaskId(task.id);
    markTaskSeen(task.id).then(() => router.refresh());
  }

  const kanbanColumns: KanbanColumn<string>[] = columns.map((c, i) => ({ id: c.id, label: c.label, color: COLUMN_COLORS[i % COLUMN_COLORS.length] }));

  async function handleMove(task: TaskWithDetails, columnId: string) {
    const prev = items;
    setItems((cur) => cur.map((t) => (t.id === task.id ? { ...t, column_id: columnId } : t)));
    try {
      await moveTask(task.id, columnId);
    } catch {
      setItems(prev);
      await alertDialog("Não foi possível mover a tarefa. Tente novamente.");
    }
  }

  async function handleNewTask() {
    if (columns.length === 0) return;
    const title = await promptDialog("Título da nova tarefa");
    if (!title) return;
    const created = await createTask(columns[0].id, title);
    setItems((cur) => [...cur, { ...created, assignees: people.filter((p) => p.id === currentUserId), checklist: [], comments: [], attachments: [] }]);
  }

  async function handleNewColumn() {
    const label = await promptDialog("Nome da nova coluna");
    if (!label) return;
    await createColumn(label);
  }

  async function handleRenameColumn(col: TaskColumn) {
    const label = await promptDialog("Novo nome da coluna", col.label);
    if (!label || label === col.label) return;
    await renameColumn(col.id, label);
  }

  async function handleDeleteColumn(col: TaskColumn) {
    const tasksInColumn = items.filter((t) => t.column_id === col.id).length;
    const warning = tasksInColumn > 0 ? ` As ${tasksInColumn} tarefa(s) dela também serão excluídas.` : "";
    if (!(await confirmDialog(`Excluir a coluna "${col.label}"?${warning}`, { danger: true, confirmText: "Excluir" }))) return;
    await deleteColumn(col.id);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleNewTask}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
          >
            <Plus size={16} /> Nova tarefa
          </button>
          {canManageColumns && (
            <button
              type="button"
              onClick={handleNewColumn}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "1px solid var(--admin-border-strong)", cursor: "pointer" }}
            >
              <Plus size={16} /> Nova coluna
            </button>
          )}
        </div>
      </div>

      {canManageColumns && columns.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {columns.map((col) => (
            <div key={col.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem", backgroundColor: "var(--admin-surface-alt)", borderRadius: "9999px", padding: "0.25rem 0.25rem 0.25rem 0.75rem", fontSize: "0.75rem", color: "var(--admin-muted)" }}>
              <button type="button" onClick={() => handleRenameColumn(col)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }} title="Renomear coluna">
                {col.label}
              </button>
              <button type="button" onClick={() => handleDeleteColumn(col)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.25rem", height: "1.25rem", borderRadius: "9999px", background: "none", border: "none", cursor: "pointer", color: "var(--admin-faint)" }} title="Excluir coluna">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <KanbanBoard
        columns={kanbanColumns}
        items={items}
        getId={(t) => t.id}
        getStatus={(t) => t.column_id}
        onMove={handleMove}
        onCardClick={handleCardClick}
        emptyLabel="Nenhuma tarefa aqui."
        renderCard={(t) => {
          const doneCount = t.checklist.filter((c) => c.done).length;
          return (
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--admin-faint)", marginBottom: "0.25rem" }}>{formatTaskId(t.task_number, t.created_at)}</div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: "0.5rem" }}>{t.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", fontWeight: 700, color: PRIORITY_CONFIG[t.priority].color }}>
                  <span style={{ width: "0.4375rem", height: "0.4375rem", borderRadius: "9999px", backgroundColor: PRIORITY_CONFIG[t.priority].color }} />
                  {PRIORITY_CONFIG[t.priority].label}
                </span>
                {t.due_date && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: isOverdue(t.due_date) ? "#dc2626" : "var(--admin-faint)", fontWeight: isOverdue(t.due_date) ? 700 : 400 }}>
                    <Calendar size={11} /> {new Date(`${t.due_date}T00:00:00`).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {t.checklist.length > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem", color: "var(--admin-faint)" }}>
                    <Check size={11} /> {doneCount}/{t.checklist.length}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--admin-faint)", marginTop: "0.625rem" }}>
                Solicitante: <span style={{ fontWeight: 700, color: "var(--admin-text-secondary)" }}>{peopleById.get(t.created_by)?.name ?? "—"}</span>
              </div>
              {t.assignees.length > 0 && (
                <div style={{ fontSize: "0.6875rem", color: "var(--admin-faint)", marginTop: "0.375rem" }}>
                  Solicitado: <span style={{ fontWeight: 700, color: "#315E9C" }}>{t.assignees.map((p) => p.name).join(", ")}</span>
                </div>
              )}
            </div>
          );
        }}
      />

      {openTask && (
        <TaskModal
          task={openTask}
          people={people}
          columns={columns}
          currentUserId={currentUserId}
          onClose={() => setOpenTaskId(null)}
          onChange={(updated) => setItems((cur) => cur.map((t) => (t.id === updated.id ? updated : t)))}
          onDeleted={() => {
            setItems((cur) => cur.filter((t) => t.id !== openTask.id));
            setOpenTaskId(null);
          }}
        />
      )}
    </div>
  );
}
