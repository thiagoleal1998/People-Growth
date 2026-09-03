"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Resource } from "@/types/database.types";

export async function upsertResource(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const title_pt = String(formData.get("title_pt") ?? "");

  const payload: Omit<Resource, "id" | "created_at" | "updated_at" | "download_count"> = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    description_pt: String(formData.get("description_pt") ?? "") || null,
    description_en: String(formData.get("description_en") ?? "") || null,
    type: (String(formData.get("type") ?? "ebook")) as Resource["type"],
    file_url: String(formData.get("file_url") ?? "") || null,
    cover_image: String(formData.get("cover_image") ?? "") || null,
    lead_required: formData.get("lead_required") === "on",
    status: (String(formData.get("status") ?? "active")) as Resource["status"],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const isNew = !id;
  if (id) {
    await client.from("resources").update(payload).eq("id", id);
  } else {
    await client.from("resources").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "recurso", entityLabel: title_pt });
  }

  revalidatePath("/admin/recursos");
  redirect("/admin/recursos?saved=1");
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: resource } = await client.from("resources").select("title_pt").eq("id", id).single();
  await client.from("resources").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "recurso", entityLabel: resource?.title_pt });
  }
  revalidatePath("/admin/recursos");
}
