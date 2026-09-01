"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/types/database.types";

export async function upsertMediaItem(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const payload: Omit<MediaItem, "id" | "created_at"> = {
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? "") || null,
    date: String(formData.get("date") ?? "") || null,
    type: (String(formData.get("type") ?? "article")) as MediaItem["type"],
    thumbnail: String(formData.get("thumbnail") ?? "") || null,
    outlet: String(formData.get("outlet") ?? "") || null,
    order: Number(formData.get("order") ?? 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    await client.from("media_items").update(payload).eq("id", id);
  } else {
    await client.from("media_items").insert(payload);
  }

  revalidatePath("/admin/midia");
  redirect("/admin/midia?saved=1");
}

export async function deleteMediaItem(id: string) {
  const supabase = await createClient();
  await supabase.from("media_items").delete().eq("id", id);
  revalidatePath("/admin/midia");
}
