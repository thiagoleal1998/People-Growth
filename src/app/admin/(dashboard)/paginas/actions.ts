"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import { INSTITUTIONAL_PAGES } from "./pages";

export async function upsertInstitutionalPage(slug: string, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const payload = {
    slug,
    title_pt: String(formData.get("title_pt") ?? ""),
    title_en: String(formData.get("title_en") ?? "") || null,
    body_pt: String(formData.get("body_pt") ?? ""),
    body_en: String(formData.get("body_en") ?? "") || null,
  };

  await client.from("institutional_pages").upsert(payload, { onConflict: "slug" });

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "página institucional", entityLabel: payload.title_pt });
  }

  revalidatePath("/admin/paginas");
  revalidatePath(`/admin/paginas/${slug}`);
  const page = INSTITUTIONAL_PAGES.find((p) => p.slug === slug);
  if (page) {
    revalidatePath(`/[locale]${page.path}`, "page");
  }

  redirect("/admin/paginas?saved=1");
}
