import { redirect } from "next/navigation";
import { getCurrentProfile, panelBasePath } from "@/lib/auth/profile";

// Shareable per-card link (copied from TaskModal's "Copiar link" button).
// Always redirects to the visitor's own panel — never renders anything
// itself, so it needs no <html>/<body> of its own beyond the bare root
// layout (src/app/layout.tsx just returns children).
export default async function TaskLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");

  // Columnists are never assignable to a task (the "people" picker only
  // ever lists admin/equipe logins), so there's nothing for them to see.
  if (profile.role === "columnist") redirect("/colunista");

  redirect(`${panelBasePath(profile.role)}/tarefas?task=${id}`);
}
