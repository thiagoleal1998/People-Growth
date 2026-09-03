"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

export async function updateSeoConfig(formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const entries = Array.from(formData.entries()).filter(([key]) => key !== "");

  for (const [key, value] of entries) {
    await client.from("site_config").upsert({ key, value: String(value) });
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "SEO" });
  }

  revalidatePath("/admin/seo");
  revalidatePath("/[locale]", "layout");
  redirect("/admin/seo?saved=1");
}
