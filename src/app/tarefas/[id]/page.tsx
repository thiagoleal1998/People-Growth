import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, panelBasePath } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/server";
import { formatTaskId } from "@/lib/display-id";

// Same name-resolution rule as the "people" picker in ../admin/tarefas/
// page.tsx (columnist's real name when linked, their login email
// otherwise) — duplicated rather than imported since that file's query
// builds the full admin/equipe roster, while this one only needs the
// handful of people actually on this one card.
async function fetchTaskPreview(id: string) {
  const admin = await createAdminClient();
  const { data: task } = await admin.from("tasks").select("title, task_number, created_at").eq("id", id).single();
  if (!task) return null;

  const { data: assigneeRows } = await admin.from("task_assignees").select("user_profile_id").eq("task_id", id);
  const userIds = (assigneeRows ?? []).map((a) => a.user_profile_id);

  let assigneeNames: string[] = [];
  if (userIds.length > 0) {
    const { data: profiles } = await admin.from("user_profiles").select("id, email, columnist_id").in("id", userIds);
    const columnistIds = (profiles ?? []).map((p) => p.columnist_id).filter((v): v is string => !!v);
    const { data: columnists } = columnistIds.length > 0 ? await admin.from("columnists").select("id, name").in("id", columnistIds) : { data: [] };
    const nameById = new Map((columnists ?? []).map((c) => [c.id, c.name]));
    assigneeNames = (profiles ?? []).map((p) => (p.columnist_id && nameById.get(p.columnist_id)) || p.email);
  }

  return { ...task, assigneeNames };
}

// A real session redirects before this ever runs, so the only caller who
// sees it is someone without the session cookie — overwhelmingly a link-
// preview crawler (WhatsApp/Slack/Telegram), never a logged-in person.
// Admin client bypasses RLS on purpose: this is exactly what a share-link
// preview is for, same exposure level as the link itself.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const task = await fetchTaskPreview(id);
  if (!task) return {};
  const title = `Nova tarefa: ${task.title}`;
  const forLine = task.assigneeNames.length > 0 ? `Para: ${task.assigneeNames.join(", ")}` : null;
  const description = [forLine, formatTaskId(task.task_number, task.created_at)].filter(Boolean).join(" · ");
  return { title, description, openGraph: { title, description } };
}

// Shareable per-card link (copied from TaskModal's "Copiar link" button).
// A logged-in visitor always redirects straight to their own panel with
// that card open — this component only renders real HTML for the
// unauthenticated case, so a crawler gets the og:title/description above
// instead of a bare 3xx it can't read.
export default async function TaskLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (profile) {
    // Columnists are never assignable to a task (the "people" picker only
    // ever lists admin/equipe logins), so there's nothing for them to see.
    if (profile.role === "columnist") redirect("/colunista");
    redirect(`${panelBasePath(profile.role)}/tarefas?task=${id}`);
  }

  const task = await fetchTaskPreview(id);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0d1b2a", color: "white", padding: "1.5rem" }}>
      <div style={{ textAlign: "center", maxWidth: "28rem" }}>
        <p style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "0.375rem" }}>{task ? `Nova tarefa: ${task.title}` : "Tarefa"}</p>
        {task && (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {task.assigneeNames.length > 0 && <>Para: {task.assigneeNames.join(", ")} · </>}
            {formatTaskId(task.task_number, task.created_at)}
          </p>
        )}
        <Link href="/admin/login" style={{ color: "#8ab4f8", fontWeight: 700, fontSize: "0.9375rem" }}>
          Entrar para ver os detalhes →
        </Link>
      </div>
    </div>
  );
}
