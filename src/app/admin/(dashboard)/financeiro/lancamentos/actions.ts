"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type FinanceEntryInsert = Database["public"]["Tables"]["finance_entries"]["Insert"];

export async function upsertFinanceEntry(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0").trim());

  const payload: Partial<FinanceEntryInsert> = {
    type: String(formData.get("type") ?? "expense") as FinanceEntryInsert["type"],
    amount,
    description,
    category: String(formData.get("category") ?? "").trim() || null,
    client_id: String(formData.get("client_id") ?? "").trim() || null,
    recurrence: String(formData.get("recurrence") ?? "one_time") as FinanceEntryInsert["recurrence"],
    entry_date: String(formData.get("entry_date") ?? "").trim() || new Date().toISOString().slice(0, 10),
  };

  const isNew = !id;
  if (id) {
    await client.from("finance_entries").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await client.from("finance_entries").insert({ ...payload, created_by: actor?.id ?? null });
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "lançamento financeiro", entityLabel: description });
  }

  revalidatePath("/admin/financeiro/lancamentos");
  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro/lancamentos?saved=1");
}

export async function deleteFinanceEntry(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("finance_entries").select("description").eq("id", id).single();
  await client.from("finance_entries").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "lançamento financeiro", entityLabel: item?.description ?? "" });
  }
  revalidatePath("/admin/financeiro/lancamentos");
  revalidatePath("/admin/financeiro");
}
