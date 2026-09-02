"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/supabase/storage";
import type { Database } from "@/types/database.types";

type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];

export async function upsertAd(id: string | null, formData: FormData) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { url: imageUrl, error: imageError } = await uploadPublicImage(formData.get("image_file"), "ads");

  const slotKey = String(formData.get("slot_key") ?? "home-top");
  const targetMode = slotKey === "home-top" ? "all" : (String(formData.get("target_mode") ?? "all") as "all" | "specific");

  const payload: Partial<AdInsert> = {
    slot_key: slotKey,
    title: String(formData.get("title") ?? "").trim(),
    link_url: String(formData.get("link_url") ?? "").trim() || null,
    alt_text: String(formData.get("alt_text") ?? "").trim() || null,
    target_mode: targetMode,
    active: formData.get("active") === "on",
  };
  if (imageUrl) payload.image_url = imageUrl;

  let adId = id;
  if (adId) {
    const { error } = await client.from("ads").update(payload).eq("id", adId);
    if (error) throw error;
  } else {
    const { data, error } = await client.from("ads").insert(payload).select("id").single();
    if (error) throw error;
    adId = data.id;
  }

  await client.from("ad_targets").delete().eq("ad_id", adId);
  if (targetMode === "specific") {
    const articleIds = formData.getAll("article_ids").map(String).filter(Boolean);
    if (articleIds.length > 0) {
      await client.from("ad_targets").insert(articleIds.map((articleId) => ({ ad_id: adId, article_id: articleId })));
    }
  }

  revalidatePath("/admin/publicidade");
  revalidatePath("/[locale]", "layout");

  const errorParam = imageError ? `&imageError=${encodeURIComponent(imageError)}` : "";
  redirect(`/admin/publicidade?saved=1${errorParam}`);
}

export async function deleteAd(id: string) {
  const supabase = await createClient();
  await supabase.from("ads").delete().eq("id", id);
  revalidatePath("/admin/publicidade");
  revalidatePath("/[locale]", "layout");
}
