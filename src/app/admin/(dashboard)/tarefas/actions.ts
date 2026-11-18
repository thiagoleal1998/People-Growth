"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile, resolveActorName } from "@/lib/auth/profile";
import { insertNotification } from "@/lib/notify";
import { formatTaskId } from "@/lib/display-id";

function revalidateTarefas() {
  revalidatePath("/admin/tarefas");
  revalidatePath("/equipe/tarefas");
}

// ===== Columns (admin only — also enforced by RLS) =====

export async function createColumn(label: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("Só admin pode criar colunas.");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: existing } = await client.from("task_columns").select("order").order("order", { ascending: false }).limit(1);
  const order = ((existing?.[0]?.order as number | undefined) ?? -1) + 1;
  await client.from("task_columns").insert({ label, order });
  revalidateTarefas();
}

export async function renameColumn(id: string, label: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("Só admin pode renomear colunas.");
  const supabase = await createClient();
  await (supabase as any).from("task_columns").update({ label }).eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

export async function deleteColumn(id: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("Só admin pode excluir colunas.");
  const supabase = await createClient();
  await (supabase as any).from("task_columns").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

// ===== Tasks =====

export async function createTask(columnId: string, title: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado.");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: existing } = await client.from("tasks").select("order").eq("column_id", columnId).order("order", { ascending: false }).limit(1);
  const order = ((existing?.[0]?.order as number | undefined) ?? -1) + 1;

  const { data: created, error } = await client.from("tasks").insert({ column_id: columnId, title, created_by: profile.id, order }).select().single();
  if (error) throw error;

  // Auto-assign the creator — a card someone just made should never
  // disappear on them, which the visibility rule would otherwise do if
  // nobody (including them) is on it yet. seen_at is set immediately:
  // they just made it, so it shouldn't count against their own unread badge.
  await client.from("task_assignees").insert({ task_id: created.id, user_profile_id: profile.id, seen_at: new Date().toISOString() });

  revalidateTarefas();
  return created;
}

export async function updateTask(id: string, fields: { title?: string; description?: string | null; priority?: "baixa" | "media" | "alta"; due_date?: string | null }) {
  const supabase = await createClient();
  await (supabase as any).from("tasks").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

export async function moveTask(id: string, columnId: string) {
  const supabase = await createClient();
  await (supabase as any).from("tasks").update({ column_id: columnId, updated_at: new Date().toISOString() }).eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  await (supabase as any).from("tasks").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

// ===== Assignees =====

export async function addAssignee(taskId: string, userProfileId: string) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("task_assignees").insert({ task_id: taskId, user_profile_id: userProfileId });
  revalidateTarefas();

  // Notify the person being asked — not when adding yourself.
  if (profile && userProfileId !== profile.id) {
    const { data: task } = await client.from("tasks").select("title, task_number, created_at").eq("id", taskId).single();
    if (task) {
      const admin = await createAdminClient();
      const assignerName = await resolveActorName(profile);
      await insertNotification(
        admin,
        userProfileId,
        "task_assigned",
        { assigner: assignerName, task_code: formatTaskId(task.task_number, task.created_at), title: task.title },
        `/tarefas/${taskId}`
      );
    }
  }
}

export async function removeAssignee(taskId: string, userProfileId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("task_assignees").delete().eq("task_id", taskId).eq("user_profile_id", userProfileId);
  revalidateTarefas();
}

// ===== Checklist =====

export async function addChecklistItem(taskId: string, label: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: existing } = await client.from("task_checklist_items").select("order").eq("task_id", taskId).order("order", { ascending: false }).limit(1);
  const order = ((existing?.[0]?.order as number | undefined) ?? -1) + 1;
  await client.from("task_checklist_items").insert({ task_id: taskId, label, order });
  revalidateTarefas();
}

export async function toggleChecklistItem(id: string, done: boolean) {
  const supabase = await createClient();
  await (supabase as any).from("task_checklist_items").update({ done }).eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

export async function deleteChecklistItem(id: string) {
  const supabase = await createClient();
  await (supabase as any).from("task_checklist_items").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

// ===== Comments =====

export async function addComment(taskId: string, body: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado.");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const authorName = await resolveActorName(profile);
  await client.from("task_comments").insert({ task_id: taskId, author_id: profile.id, author_name: authorName, body });
  revalidateTarefas();

  // Only the card's own participants (creator + assignees) hear about a new
  // comment — never a broadcast to everyone, and never back to its own author.
  const { data: task } = await client.from("tasks").select("title, task_number, created_at, created_by").eq("id", taskId).single();
  const { data: assigneeRows } = await client.from("task_assignees").select("user_profile_id").eq("task_id", taskId);
  if (task) {
    const participantIds = new Set<string>([task.created_by, ...((assigneeRows ?? []) as { user_profile_id: string }[]).map((a) => a.user_profile_id)]);
    participantIds.delete(profile.id);
    if (participantIds.size > 0) {
      const admin = await createAdminClient();
      const vars = { author: authorName, task_code: formatTaskId(task.task_number, task.created_at), title: task.title, preview: body.slice(0, 80) };
      await Promise.all([...participantIds].map((userId) => insertNotification(admin, userId, "task_comment_added", vars, `/tarefas/${taskId}`)));
    }
  }
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  await (supabase as any).from("task_comments").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}

// ===== Seen tracking (Equipe's unread badge) =====

export async function markTaskSeen(taskId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("task_assignees")
    .update({ seen_at: new Date().toISOString() })
    .eq("task_id", taskId)
    .eq("user_profile_id", profile.id)
    .is("seen_at", null);
  revalidateTarefas();
}

// ===== Attachments =====

export async function addAttachment(taskId: string, url: string, name: string, contentType: string | null) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado.");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("task_attachments").insert({ task_id: taskId, url, name, content_type: contentType, uploaded_by: profile.id });
  revalidateTarefas();
}

export async function deleteAttachment(id: string) {
  const supabase = await createClient();
  await (supabase as any).from("task_attachments").delete().eq("id", id); // eslint-disable-line @typescript-eslint/no-explicit-any
  revalidateTarefas();
}
