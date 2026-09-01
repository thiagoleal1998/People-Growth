"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type SubStatus = Database["public"]["Tables"]["newsletter_subs"]["Row"]["status"];

export async function updateSubStatus(id: string, status: SubStatus) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("newsletter_subs").update({ status }).eq("id", id);
  revalidatePath("/admin/newsletter");
}

export async function deleteSub(id: string) {
  const supabase = await createClient();
  await supabase.from("newsletter_subs").delete().eq("id", id);
  revalidatePath("/admin/newsletter");
}
