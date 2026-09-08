"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile, resolveActorName } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { formatTicketId } from "@/lib/display-id";
import type { ErrorReport, InternalTicket } from "@/types/database.types";

const STATUS_LABEL: Record<InternalTicket["status"], string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
};

export async function updateErrorReportStatus(id: string, status: ErrorReport["status"]) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: report } = await client.from("error_reports").select("page_url").eq("id", id).single();
  await client.from("error_reports").update({ status }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "chamado", entityLabel: `${report?.page_url} → ${status}` });
  }
  revalidatePath("/admin/chamados");
}

export async function deleteErrorReport(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: report } = await client.from("error_reports").select("page_url").eq("id", id).single();
  await client.from("error_reports").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "chamado", entityLabel: report?.page_url });
  }
  revalidatePath("/admin/chamados");
}

export async function createInternalTicket(data: { type: InternalTicket["type"]; title: string; description: string; page?: string }) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado");

  const createdByName = await resolveActorName(profile);
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error } = await (supabase as any)
    .from("internal_tickets")
    .insert({
      created_by: profile.id,
      created_by_name: createdByName,
      created_by_role: profile.role,
      type: data.type,
      title: data.title,
      description: data.description,
      page_path: data.page || null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({ userId: profile.id, userEmail: profile.email, action: "create", entityType: "chamado interno", entityLabel: data.title });

  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
  return created as InternalTicket;
}

export async function updateTicketStatus(id: string, status: InternalTicket["status"]) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  if (!actor) throw new Error("Não autenticado");
  const actorName = await resolveActorName(actor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: ticket } = await client.from("internal_tickets").select("title, status").eq("id", id).single();
  if (!ticket) return;

  await client.from("internal_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  if (ticket.status !== status) {
    await client.from("ticket_events").insert({
      ticket_id: id,
      event_type: "status_changed",
      actor_name: actorName,
      detail: `Status alterado de "${STATUS_LABEL[ticket.status as InternalTicket["status"]]}" para "${STATUS_LABEL[status]}"`,
    });
  }

  await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "chamado interno", entityLabel: `${ticket.title} → ${status}` });
  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
}

export async function assignTicket(id: string, userId: string | null) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  if (!actor) throw new Error("Não autenticado");
  const actorName = await resolveActorName(actor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  // user_profiles only has a "read own row" RLS policy — reading someone
  // else's profile to resolve their name needs the admin client.
  let assigneeName = "ninguém";
  if (userId) {
    const admin = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assigneeProfile } = await (admin as any).from("user_profiles").select("*").eq("id", userId).single();
    if (assigneeProfile) assigneeName = await resolveActorName(assigneeProfile);
  }

  const { data: ticket } = await client.from("internal_tickets").select("status").eq("id", id).single();
  // Being assigned to someone is a real signal that work has started — move
  // a freshly-opened ticket into "in progress" automatically instead of
  // leaving it sitting in "open" until someone remembers to flip it by hand.
  const startsProgress = Boolean(userId) && ticket?.status === "open";

  await client
    .from("internal_tickets")
    .update({
      assigned_to: userId,
      assigned_to_name: userId ? assigneeName : null,
      ...(startsProgress ? { status: "in_progress" } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await client.from("ticket_events").insert({
    ticket_id: id,
    event_type: "assigned",
    actor_name: actorName,
    detail: userId ? `Atribuído a ${assigneeName}` : "Atribuição removida",
  });

  if (startsProgress) {
    await client.from("ticket_events").insert({
      ticket_id: id,
      event_type: "status_changed",
      actor_name: actorName,
      detail: `Status alterado de "${STATUS_LABEL.open}" para "${STATUS_LABEL.in_progress}"`,
    });
  }

  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
}

export async function notifyTicketMember(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  if (!actor) throw new Error("Não autenticado");
  const actorName = await resolveActorName(actor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: ticket } = await client.from("internal_tickets").select("ticket_number, title, assigned_to").eq("id", id).single();
  if (!ticket?.assigned_to) return;

  // Same reasoning as assignTicket above — needs the admin client.
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assigneeProfile } = await (admin as any).from("user_profiles").select("*").eq("id", ticket.assigned_to).single();
  if (!assigneeProfile) return;
  const assigneeName = await resolveActorName(assigneeProfile);

  const ticketCode = formatTicketId(ticket.ticket_number);
  await client.from("notifications").insert({
    user_id: ticket.assigned_to,
    title: `Você foi notificado no chamado ${ticketCode}`,
    body: ticket.title,
    link: assigneeProfile.role === "admin" ? "/admin/chamados" : "/autor/chamados",
  });
  await client.from("ticket_events").insert({
    ticket_id: id,
    event_type: "notified",
    actor_name: actorName,
    detail: `Notificou ${assigneeName}`,
  });

  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
}

export async function addTicketComment(id: string, body: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado");
  const authorName = await resolveActorName(profile);
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("ticket_comments").insert({
    ticket_id: id,
    author_id: profile.id,
    author_name: authorName,
    body,
  });
  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
}

export async function deleteInternalTicket(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: ticket } = await client.from("internal_tickets").select("title").eq("id", id).single();
  await client.from("internal_tickets").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "chamado interno", entityLabel: ticket?.title });
  }
  revalidatePath("/admin/chamados");
}
