"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, resolveActorName } from "@/lib/auth/profile";
import type { InternalTicket } from "@/types/database.types";

// RLS (migration 022) only lets this insert with created_by = auth.uid()
// and only lets the author read back rows they created.

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

  revalidatePath("/autor/chamados");
  revalidatePath("/admin/chamados");
  return created as InternalTicket;
}

// Authors can only comment on tickets they created themselves (migration
// 036's RLS enforces this at the database level too).
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
  revalidatePath("/autor/chamados");
  revalidatePath("/admin/chamados");
}
