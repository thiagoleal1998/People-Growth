"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/database.types";

export async function upsertAuthor(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();

  const payload: Omit<Author, "id" | "created_at" | "updated_at"> = {
    name,
    slug: slugInput || slugify(name, { lower: true, strict: true }),
    role_pt: String(formData.get("role_pt") ?? "") || null,
    role_en: String(formData.get("role_en") ?? "") || null,
    bio_pt: String(formData.get("bio_pt") ?? "") || null,
    bio_en: String(formData.get("bio_en") ?? "") || null,
    photo_url: String(formData.get("photo_url") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    instagram_url: String(formData.get("instagram_url") ?? "") || null,
    status: (String(formData.get("status") ?? "active")) as Author["status"],
    order: Number(formData.get("order") ?? 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    await client.from("authors").update(payload).eq("id", id);
  } else {
    await client.from("authors").insert(payload);
  }

  revalidatePath("/admin/autores");
  revalidatePath("/[locale]/mea-sententia", "page");
  redirect("/admin/autores");
}

export async function deleteAuthor(id: string) {
  const supabase = await createClient();
  await supabase.from("authors").delete().eq("id", id);
  revalidatePath("/admin/autores");
}
