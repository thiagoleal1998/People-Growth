"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { InternalTicket } from "@/types/database.types";

// RLS (migration 022) only lets this insert with created_by = auth.uid()
// and only lets the author read back rows they created.

export async function createInternalTicket(data: { type: InternalTicket["type"]; title: string; description: string }) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Não autenticado");

  const supabase = await createClient();
  let createdByName = profile.email;
  if (profile.author_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: author } = await (supabase as any).from("authors").select("name").eq("id", profile.author_id).single();
    if (author?.name) createdByName = author.name;
  }

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
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/autor/chamados");
  revalidatePath("/admin/chamados");
  return created as InternalTicket;
}
