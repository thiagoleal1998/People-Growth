"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteConfig(formData: FormData) {
  const supabase = await createClient();

  const entries = Array.from(formData.entries()).filter(([key]) => key !== "" && key !== "is_live");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  await client.from("site_config").upsert({ key: "is_live", value: formData.get("is_live") === "on" ? "true" : "false" });

  for (const [key, value] of entries) {
    await client.from("site_config").upsert({ key, value: String(value) });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/[locale]", "layout");
  redirect("/admin/configuracoes?saved=1");
}
