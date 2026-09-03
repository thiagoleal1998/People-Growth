"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];

function linesToArray(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export async function upsertService(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();

  const payload: ServiceInsert = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    description_pt: String(formData.get("description_pt") ?? ""),
    description_en: String(formData.get("description_en") ?? "") || null,
    methodology_pt: String(formData.get("methodology_pt") ?? "") || null,
    methodology_en: String(formData.get("methodology_en") ?? "") || null,
    benefits: linesToArray(String(formData.get("benefits") ?? "")),
    results_pt: String(formData.get("results_pt") ?? "") || null,
    results_en: String(formData.get("results_en") ?? "") || null,
    icon: String(formData.get("icon") ?? "") || null,
    order: Number(formData.get("order") ?? 0),
    status: (String(formData.get("status") ?? "active")) as ServiceInsert["status"],
  };

  const isNew = !id;
  if (id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("services").update(payload).eq("id", id);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("services").insert(payload);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "serviço", entityLabel: title_pt });
  }

  revalidatePath("/admin/servicos");
  revalidatePath("/[locale]/servicos", "page");
  redirect("/admin/servicos?saved=1");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: service } = await client.from("services").select("title_pt").eq("id", id).single();
  await client.from("services").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "serviço", entityLabel: service?.title_pt });
  }
  revalidatePath("/admin/servicos");
}
