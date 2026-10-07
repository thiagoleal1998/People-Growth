"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Announcement } from "@/types/database.types";

// Thrown rather than redirected — called directly from AnnouncementsClient
// (a list that lives on its own page, not inside a bigger form).

export async function createAnnouncement(title: string, body: string): Promise<Announcement> {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle || !cleanBody) throw new Error("Preencha o título e a mensagem.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data, error } = await client
    .from("announcements")
    .insert({ title: cleanTitle, body: cleanBody, created_by: actor?.id ?? null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: "comunicado", entityLabel: cleanTitle });

  revalidatePath("/admin/comunicados");
  revalidatePath("/autor");
  revalidatePath("/autor/comunicados");
  return data as Announcement;
}

export async function updateAnnouncement(id: string, title: string, body: string): Promise<void> {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle || !cleanBody) throw new Error("Preencha o título e a mensagem.");

  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client.from("announcements").update({ title: cleanTitle, body: cleanBody, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "comunicado", entityLabel: cleanTitle });

  revalidatePath("/admin/comunicados");
  revalidatePath("/autor");
  revalidatePath("/autor/comunicados");
}

export async function deleteAnnouncement(id: string, title: string): Promise<void> {
  const actor = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (actor) await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "comunicado", entityLabel: title });

  revalidatePath("/admin/comunicados");
  revalidatePath("/autor");
  revalidatePath("/autor/comunicados");
}
