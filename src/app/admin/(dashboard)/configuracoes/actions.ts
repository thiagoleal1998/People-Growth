"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteConfig(formData: FormData) {
  const supabase = await createClient();

  const entries = Array.from(formData.entries()).filter(([key]) => key !== "");

  for (const [key, value] of entries) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("site_config").upsert({ key, value: String(value) });
  }

  revalidatePath("/admin/configuracoes");
}
