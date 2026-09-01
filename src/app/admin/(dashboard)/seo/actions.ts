"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateSeoConfig(formData: FormData) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const entries = Array.from(formData.entries()).filter(([key]) => key !== "");

  for (const [key, value] of entries) {
    await client.from("site_config").upsert({ key, value: String(value) });
  }

  revalidatePath("/admin/seo");
  revalidatePath("/[locale]", "layout");
  redirect("/admin/seo?saved=1");
}
