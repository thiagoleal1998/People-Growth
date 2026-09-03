"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { MediaItem } from "@/types/database.types";

export async function upsertMediaItem(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const title = String(formData.get("title") ?? "");

  const payload: Omit<MediaItem, "id" | "created_at"> = {
    title,
    url: String(formData.get("url") ?? "") || null,
    date: String(formData.get("date") ?? "") || null,
    type: (String(formData.get("type") ?? "article")) as MediaItem["type"],
    thumbnail: String(formData.get("thumbnail") ?? "") || null,
    outlet: String(formData.get("outlet") ?? "") || null,
    order: Number(formData.get("order") ?? 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const isNew = !id;
  if (id) {
    await client.from("media_items").update(payload).eq("id", id);
  } else {
    await client.from("media_items").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "matéria na mídia", entityLabel: title });
  }

  revalidatePath("/admin/midia");
  redirect("/admin/midia?saved=1");
}

export async function deleteMediaItem(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: item } = await client.from("media_items").select("title").eq("id", id).single();
  await client.from("media_items").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "matéria na mídia", entityLabel: item?.title });
  }
  revalidatePath("/admin/midia");
}
