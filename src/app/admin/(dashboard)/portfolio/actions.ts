"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import type { PortfolioCase } from "@/types/database.types";

function linesToArray(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export async function upsertPortfolioCase(id: string | null, formData: FormData) {
  const supabase = await createClient();

  const title_pt = String(formData.get("title_pt") ?? "");
  const slugInput = String(formData.get("slug") ?? "").trim();

  const payload: Omit<PortfolioCase, "id" | "created_at" | "updated_at"> = {
    title_pt,
    title_en: String(formData.get("title_en") ?? "") || null,
    slug: slugInput || slugify(title_pt, { lower: true, strict: true }),
    category: String(formData.get("category") ?? "marketing") as PortfolioCase["category"],
    challenge_pt: String(formData.get("challenge_pt") ?? "") || null,
    challenge_en: String(formData.get("challenge_en") ?? "") || null,
    solution_pt: String(formData.get("solution_pt") ?? "") || null,
    solution_en: String(formData.get("solution_en") ?? "") || null,
    tools: linesToArray(String(formData.get("tools") ?? "")),
    results_pt: String(formData.get("results_pt") ?? "") || null,
    results_en: String(formData.get("results_en") ?? "") || null,
    cover_image: String(formData.get("cover_image") ?? "") || null,
    status: (String(formData.get("status") ?? "active")) as PortfolioCase["status"],
    order: Number(formData.get("order") ?? 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  if (id) {
    await client.from("portfolio_cases").update(payload).eq("id", id);
  } else {
    await client.from("portfolio_cases").insert(payload);
  }

  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function deletePortfolioCase(id: string) {
  const supabase = await createClient();
  await supabase.from("portfolio_cases").delete().eq("id", id);
  revalidatePath("/admin/portfolio");
}
