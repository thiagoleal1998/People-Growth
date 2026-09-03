"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Testimonial } from "@/types/database.types";

export async function upsertTestimonial(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const ratingRaw = String(formData.get("rating") ?? "");
  const name = String(formData.get("name") ?? "");

  const payload: Omit<Testimonial, "id" | "created_at"> = {
    name,
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
  const isNew = !id;
  if (id) {
    await client.from("testimonials").update(payload).eq("id", id);
  } else {
    await client.from("testimonials").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "depoimento", entityLabel: name });
  }

  revalidatePath("/admin/depoimentos");
  redirect("/admin/depoimentos?saved=1");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: testimonial } = await client.from("testimonials").select("name").eq("id", id).single();
  await client.from("testimonials").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "depoimento", entityLabel: testimonial?.name });
  }
  revalidatePath("/admin/depoimentos");
}
