"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Course } from "@/types/database.types";

export async function upsertCourse(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");

  const payload: Omit<Course, "id" | "created_at" | "updated_at"> = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    description_pt: String(formData.get("description_pt") ?? "") || null,
    description_en: String(formData.get("description_en") ?? "") || null,
    category: String(formData.get("category") ?? "") || null,
    status: (String(formData.get("status") ?? "coming_soon")) as Course["status"],
    cover_image: String(formData.get("cover_image") ?? "") || null,
    price: priceRaw ? Number(priceRaw) : null,
    order: Number(formData.get("order") ?? 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const isNew = !id;
  if (id) {
    await client.from("courses").update(payload).eq("id", id);
  } else {
    await client.from("courses").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "curso", entityLabel: title_pt });
  }

  revalidatePath("/admin/cursos");
  redirect("/admin/cursos?saved=1");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: course } = await client.from("courses").select("title_pt").eq("id", id).single();
  await client.from("courses").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "curso", entityLabel: course?.title_pt });
  }
  revalidatePath("/admin/cursos");
}
