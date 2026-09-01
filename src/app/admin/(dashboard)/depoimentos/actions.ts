"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/database.types";

export async function upsertTestimonial(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const ratingRaw = String(formData.get("rating") ?? "");

  const payload: Omit<Testimonial, "id" | "created_at"> = {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? "") || null,
    company: String(formData.get("company") ?? "") || null,
    text_pt: String(formData.get("text_pt") ?? ""),
    text_en: String(formData.get("text_en") ?? "") || null,
    avatar_url: String(formData.get("avatar_url") ?? "") || null,
    rating: ratingRaw ? Number(ratingRaw) : null,
    status: (String(formData.get("status") ?? "active")) as Testimonial["status"],
    order: Number(formData.get("order") ?? 0),
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    await client.from("testimonials").update(payload).eq("id", id);
  } else {
    await client.from("testimonials").insert(payload);
  }

  revalidatePath("/admin/depoimentos");
  redirect("/admin/depoimentos?saved=1");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/admin/depoimentos");
}
