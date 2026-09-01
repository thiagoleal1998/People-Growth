"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/database.types";

export async function upsertResource(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const payload: Omit<Resource, "id" | "created_at" | "updated_at" | "download_count"> = {
    title_pt: String(formData.get("title_pt") ?? ""),
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
  if (id) {
    await client.from("resources").update(payload).eq("id", id);
  } else {
    await client.from("resources").insert(payload);
  }

  revalidatePath("/admin/recursos");
  redirect("/admin/recursos");
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  await supabase.from("resources").delete().eq("id", id);
  revalidatePath("/admin/recursos");
}
