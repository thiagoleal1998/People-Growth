"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function updateLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("leads").update({ notes }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
