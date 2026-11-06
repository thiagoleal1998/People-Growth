"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { monthParamKey, parseMonthParam } from "@/lib/calendar-grid";
import type { Database } from "@/types/database.types";

type CalendarItemInsert = Database["public"]["Tables"]["content_calendar_items"]["Insert"];

// Shared by the standalone edit page (upsertCalendarItem, below — redirects
// back to the grid, the no-JS/direct-link fallback) and the slide-over
// panel (upsertCalendarItemInline — same write, but returns instead of
// redirecting, since the panel stays on the calendar page itself).
async function saveCalendarItem(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const title = String(formData.get("title") ?? "").trim();
  const { year, month } = parseMonthParam(String(formData.get("month") ?? ""));
  const monthKey = monthParamKey(year, month);

  const payload: Partial<CalendarItemInsert> = {
    type: String(formData.get("type") ?? "article_topic") as CalendarItemInsert["type"],
    title,
    notes: String(formData.get("notes") ?? "").trim() || null,
    platform: (String(formData.get("platform") ?? "").trim() || null) as CalendarItemInsert["platform"],
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    scheduled_date: String(formData.get("scheduled_date") ?? ""),
    status: String(formData.get("status") ?? "planned") as CalendarItemInsert["status"],
    published_channels: formData.getAll("published_channels").map(String),
  };

  const isNew = !id;
  if (id) {
    await client.from("content_calendar_items").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    payload.created_by = actor?.id ?? null;
    await client.from("content_calendar_items").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "item do calendário", entityLabel: title });
  }

  revalidatePath("/admin/calendario");
  return { monthKey };
}

export async function upsertCalendarItem(id: string | null, formData: FormData) {
  const { monthKey } = await saveCalendarItem(id, formData);
  redirect(`/admin/calendario?month=${monthKey}&saved=1`);
}

export async function upsertCalendarItemInline(id: string | null, formData: FormData) {
  await saveCalendarItem(id, formData);
  return { ok: true as const };
}

async function removeCalendarItem(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("content_calendar_items").select("title").eq("id", id).single();
  await client.from("content_calendar_items").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "item do calendário", entityLabel: item?.title });
  }
  revalidatePath("/admin/calendario");
}

export async function deleteCalendarItem(id: string, month: string) {
  await removeCalendarItem(id);
  const { year, month: m } = parseMonthParam(month);
  redirect(`/admin/calendario?month=${monthParamKey(year, m)}`);
}

export async function deleteCalendarItemInline(id: string) {
  await removeCalendarItem(id);
  return { ok: true as const };
}
