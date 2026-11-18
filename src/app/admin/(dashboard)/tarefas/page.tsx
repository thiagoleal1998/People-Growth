import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader } from "@/components/admin/ui";
import { TarefasBoard, type TaskWithDetails, type Person } from "./TarefasBoard";
import type { TaskColumn, Task, TaskAssignee, TaskChecklistItem, TaskComment, TaskAttachment, Columnist } from "@/types/database.types";

export default async function TarefasAdminPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: columnsData }, { data: tasksData }, { data: assigneesData }, { data: checklistData }, { data: commentsData }, { data: attachmentsData }] = await Promise.all([
    client.from("task_columns").select("*").order("order"),
    client.from("tasks").select("*").order("order"),
    client.from("task_assignees").select("*"),
    client.from("task_checklist_items").select("*").order("order"),
    client.from("task_comments").select("*").order("created_at"),
    client.from("task_attachments").select("*").order("created_at"),
  ]);

  const columns = (columnsData ?? []) as TaskColumn[];
  const tasks = (tasksData ?? []) as Task[];
  const assignees = (assigneesData ?? []) as TaskAssignee[];
  const checklist = (checklistData ?? []) as TaskChecklistItem[];
  const comments = (commentsData ?? []) as TaskComment[];
  const attachments = (attachmentsData ?? []) as TaskAttachment[];

  // "Pessoas atribuíveis": every admin/equipe login, named via their
  // columnist profile when linked. RLS on user_profiles only lets each
  // person read their own row, so this cross-user listing needs the
  // admin client — same reasoning as /admin/usuarios (CLAUDE.md).
  const admin = await createAdminClient();
  const [{ data: userProfilesData }, { data: columnistsData }] = await Promise.all([
    admin.from("user_profiles").select("id, email, role, columnist_id").in("role", ["admin", "equipe"]),
    admin.from("columnists").select("id, name"),
  ]);
  const columnistNameById = new Map(((columnistsData ?? []) as Pick<Columnist, "id" | "name">[]).map((c) => [c.id, c.name]));
  const people: Person[] = ((userProfilesData ?? []) as { id: string; email: string; columnist_id: string | null }[]).map((u) => ({
    id: u.id,
    name: (u.columnist_id && columnistNameById.get(u.columnist_id)) || u.email,
  }));
  const peopleById = new Map(people.map((p) => [p.id, p]));

  const assigneesByTask = new Map<string, Person[]>();
  for (const a of assignees) {
    const person = peopleById.get(a.user_profile_id);
    if (!person) continue;
    assigneesByTask.set(a.task_id, [...(assigneesByTask.get(a.task_id) ?? []), person]);
  }
  const checklistByTask = new Map<string, TaskChecklistItem[]>();
  for (const c of checklist) checklistByTask.set(c.task_id, [...(checklistByTask.get(c.task_id) ?? []), c]);
  const commentsByTask = new Map<string, TaskComment[]>();
  for (const c of comments) commentsByTask.set(c.task_id, [...(commentsByTask.get(c.task_id) ?? []), c]);
  const attachmentsByTask = new Map<string, TaskAttachment[]>();
  for (const a of attachments) attachmentsByTask.set(a.task_id, [...(attachmentsByTask.get(a.task_id) ?? []), a]);

  const tasksWithDetails: TaskWithDetails[] = tasks.map((t) => ({
    ...t,
    assignees: assigneesByTask.get(t.id) ?? [],
    checklist: checklistByTask.get(t.id) ?? [],
    comments: commentsByTask.get(t.id) ?? [],
    attachments: attachmentsByTask.get(t.id) ?? [],
  }));

  return (
    <div>
      <PageHeader title="Tarefas" subtitle="Quadro compartilhado entre o Admin e a Equipe." />
      <TarefasBoard columns={columns} tasks={tasksWithDetails} people={people} currentUserId={profile?.id ?? ""} canManageColumns={profile?.role === "admin"} />
    </div>
  );
}
