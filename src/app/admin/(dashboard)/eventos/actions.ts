"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

function numberOrNull(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function upsertEvent(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const state = String(formData.get("state") ?? "RJ") as EventInsert["state"];
  const payload: Partial<EventInsert> = {
    name: String(formData.get("name") ?? "").trim(),
    state,
    city: String(formData.get("city") ?? "").trim() || null,
    date_start: String(formData.get("date_start") ?? "").trim() || null,
    date_end: String(formData.get("date_end") ?? "").trim() || null,
    interest_description: String(formData.get("interest_description") ?? "").trim() || null,
    decision: (String(formData.get("decision") ?? "a_decidir")) as EventInsert["decision"],
    attendees: String(formData.get("attendees") ?? "").trim() || null,
    ticket_url: String(formData.get("ticket_url") ?? "").trim() || null,
    base_price: numberOrNull(formData, "base_price"),
    price_notes: String(formData.get("price_notes") ?? "").trim() || null,
    travel_cost: numberOrNull(formData, "travel_cost"),
    travel_notes: String(formData.get("travel_notes") ?? "").trim() || null,
    food_cost: numberOrNull(formData, "food_cost"),
    other_cost: numberOrNull(formData, "other_cost"),
    other_cost_notes: String(formData.get("other_cost_notes") ?? "").trim() || null,
    source_urls: String(formData.get("source_urls") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    order: Number(formData.get("order") ?? 0),
  };

  const isNew = !id;
  if (id) {
    await client.from("events").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await client.from("events").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "evento", entityLabel: payload.name ?? "" });
  }

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?tab=${state}&saved=1`);
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("events").select("name, state").eq("id", id).single();
  await client.from("events").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "evento", entityLabel: item?.name ?? "" });
  }
  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?tab=${item?.state ?? "RJ"}`);
}
