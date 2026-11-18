import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, panelBasePath } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/server";
import { formatTaskId } from "@/lib/display-id";

async function fetchTaskPreview(id: string) {
  const admin = await createAdminClient();
  const { data } = await admin.from("tasks").select("title, task_number, created_at").eq("id", id).single();
  return data as { title: string; task_number: number; created_at: string } | null;
}

// A real session redirects before this ever runs, so the only caller who
// sees it is someone without the session cookie — overwhelmingly a link-
// preview crawler (WhatsApp/Slack/Telegram), never a logged-in person.
// Admin client bypasses RLS on purpose: a title/number is exactly what a
// share-link preview is for, same exposure level as the link itself.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const task = await fetchTaskPreview(id);
  if (!task) return {};
  const title = `Nova tarefa: ${task.title}`;
  const description = formatTaskId(task.task_number, task.created_at);
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
        {task && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{formatTaskId(task.task_number, task.created_at)}</p>}
        <Link href="/admin/login" style={{ color: "#8ab4f8", fontWeight: 700, fontSize: "0.9375rem" }}>
          Entrar para ver os detalhes →
        </Link>
      </div>
    </div>
  );
}
