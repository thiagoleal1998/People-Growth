"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type FinanceClientInsert = Database["public"]["Tables"]["finance_clients"]["Insert"];

export async function upsertFinanceClient(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const name = String(formData.get("name") ?? "").trim();
  const contractValueInput = String(formData.get("contract_value") ?? "").trim();

  const payload: Partial<FinanceClientInsert> = {
    name,
    status: String(formData.get("status") ?? "active") as FinanceClientInsert["status"],
    contract_value: contractValueInput ? Number(contractValueInput) : null,
    start_date: String(formData.get("start_date") ?? "").trim() || null,
    end_date: String(formData.get("end_date") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  const isNew = !id;
  if (id) {
    await client.from("finance_clients").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await client.from("finance_clients").insert({ ...payload, created_by: actor?.id ?? null });
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "cliente financeiro", entityLabel: name });
  }

  revalidatePath("/admin/financeiro/clientes");
  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro/clientes?saved=1");
}

export async function deleteFinanceClient(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("finance_clients").select("name").eq("id", id).single();
  await client.from("finance_clients").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "cliente financeiro", entityLabel: item?.name ?? "" });
  }
  revalidatePath("/admin/financeiro/clientes");
  revalidatePath("/admin/financeiro");
}
