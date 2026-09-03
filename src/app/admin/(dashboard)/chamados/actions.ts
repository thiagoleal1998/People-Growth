"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { ErrorReport, InternalTicket } from "@/types/database.types";

export async function updateErrorReportStatus(id: string, status: ErrorReport["status"]) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("error_reports").update({ status }).eq("id", id);
  revalidatePath("/admin/chamados");
}

export async function deleteErrorReport(id: string) {
  const supabase = await createClient();
  await supabase.from("error_reports").delete().eq("id", id);
  revalidatePath("/admin/chamados");
}

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

  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
  return created as InternalTicket;
}

export async function updateInternalTicket(id: string, data: { status: InternalTicket["status"]; admin_response: string }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("internal_tickets")
    .update({ status: data.status, admin_response: data.admin_response || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/chamados");
  revalidatePath("/autor/chamados");
}

export async function deleteInternalTicket(id: string) {
  const supabase = await createClient();
  await supabase.from("internal_tickets").delete().eq("id", id);
  revalidatePath("/admin/chamados");
}
