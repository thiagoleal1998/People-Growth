"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: lead } = await client.from("leads").select("name").eq("id", id).single();
  await client.from("leads").update({ status }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "lead", entityLabel: `${lead?.name} → ${status}` });
  }
  revalidatePath("/admin/leads");
}

export async function updateLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: lead } = await client.from("leads").select("name").eq("id", id).single();
  await client.from("leads").update({ notes }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "lead", entityLabel: `Notas: ${lead?.name}` });
  }
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: lead } = await client.from("leads").select("name").eq("id", id).single();
  await client.from("leads").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "lead", entityLabel: lead?.name });
  }
  revalidatePath("/admin/leads");
}
