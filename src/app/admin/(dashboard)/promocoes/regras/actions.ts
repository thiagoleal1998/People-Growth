"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSearchRule(formData: FormData) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const query = String(formData.get("query") ?? "").trim();
  const minDiscountPct = Number(formData.get("min_discount_pct") ?? 20) || 20;
  if (!query) redirect("/admin/promocoes/regras");

  await client.from("promo_search_rules").insert({ query, min_discount_pct: minDiscountPct, active: true });

  revalidatePath("/admin/promocoes/regras");
  redirect("/admin/promocoes/regras");
}

export async function toggleSearchRuleActive(id: string, active: boolean) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("promo_search_rules").update({ active }).eq("id", id);
  revalidatePath("/admin/promocoes/regras");
}

export async function deleteSearchRule(id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("promo_search_rules").delete().eq("id", id);
  revalidatePath("/admin/promocoes/regras");
}
