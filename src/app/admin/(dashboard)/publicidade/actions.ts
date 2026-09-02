"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/supabase/storage";

export async function upsertAdSlot(key: string, formData: FormData) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { url: imageUrl, error: imageError } = await uploadPublicImage(formData.get("image_file"), "ads");

  const payload: Record<string, unknown> = {
    key,
    link_url: String(formData.get("link_url") ?? "").trim() || null,
    alt_text: String(formData.get("alt_text") ?? "").trim() || null,
    active: formData.get("active") === "on",
  };
  if (imageUrl) payload.image_url = imageUrl;

  const { error } = await client.from("ad_slots").upsert(payload);
  if (error) throw error;

  revalidatePath("/admin/publicidade");
  revalidatePath("/[locale]", "layout");

  const errorParam = imageError ? `&imageError=${encodeURIComponent(imageError)}` : "";
  redirect(`/admin/publicidade/${key}?saved=1${errorParam}`);
}
