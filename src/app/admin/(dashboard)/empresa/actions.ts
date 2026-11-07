"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type RoleProfileInsert = Database["public"]["Tables"]["role_profiles"]["Insert"];

export async function upsertRoleProfile(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const columnistId = String(formData.get("columnist_id") ?? "").trim() || null;
  const { data: columnist } = columnistId ? await client.from("columnists").select("name").eq("id", columnistId).single() : { data: null };

  const payload: Partial<RoleProfileInsert> = {
    columnist_id: columnistId,
    acronym: String(formData.get("acronym") ?? "").trim() || null,
    title: String(formData.get("title") ?? "").trim() || null,
    function_summary: String(formData.get("function_summary") ?? "").trim() || null,
    general_responsibilities: String(formData.get("general_responsibilities") ?? "").trim() || null,
    primary_responsibilities: String(formData.get("primary_responsibilities") ?? "").trim() || null,
    secondary_responsibilities: String(formData.get("secondary_responsibilities") ?? "").trim() || null,
    tertiary_responsibilities: String(formData.get("tertiary_responsibilities") ?? "").trim() || null,
    order: Number(formData.get("order") ?? 0),
  };

  const isNew = !id;
  if (id) {
    await client.from("role_profiles").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await client.from("role_profiles").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "cargo e função", entityLabel: columnist?.name ?? payload.title ?? "" });
  }

  revalidatePath("/admin/empresa");
  redirect("/admin/empresa?tab=cargos&saved=1");
}

// Swaps this row's `order` with its neighbor's, so the up/down buttons in
// the table move it one place at a time — simpler than editing a raw
// number, and doesn't require renumbering every other row to stay
// consistent.
export async function reorderRoleProfile(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: rows } = await client.from("role_profiles").select("id, order").order("order");
  const list = (rows ?? []) as { id: string; order: number }[];
  const index = list.findIndex((r) => r.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) {
    revalidatePath("/admin/empresa");
    return;
  }

  const current = list[index];
  const neighbor = list[swapIndex];
  await Promise.all([
    client.from("role_profiles").update({ order: neighbor.order }).eq("id", current.id),
    client.from("role_profiles").update({ order: current.order }).eq("id", neighbor.id),
  ]);

  revalidatePath("/admin/empresa");
}

export async function deleteRoleProfile(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("role_profiles").select("title, columnist_id").eq("id", id).single();
  await client.from("role_profiles").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "cargo e função", entityLabel: item?.title ?? "" });
  }
  revalidatePath("/admin/empresa");
  redirect("/admin/empresa?tab=cargos");
}
