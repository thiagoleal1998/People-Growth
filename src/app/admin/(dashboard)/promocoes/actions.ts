"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/supabase/storage";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";
import type { Database } from "@/types/database.types";

type PromoInsert = Database["public"]["Tables"]["promos"]["Insert"];

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export async function upsertPromo(id: string | null, formData: FormData) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { url: imageUrl, error: imageError } = await uploadPublicImage(formData.get("image_file"), "promos");

  const productName = String(formData.get("product_name") ?? "").trim();

  const payload: Partial<PromoInsert> = {
    source: "manual",
    currency: "BRL",
    product_name: productName,
    old_price: numberOrNull(formData.get("old_price")),
    new_price: numberOrNull(formData.get("new_price")) ?? 0,
    pix_price: numberOrNull(formData.get("pix_price")),
    payment_terms: String(formData.get("payment_terms") ?? "").trim() || null,
    coupon_code: String(formData.get("coupon_code") ?? "").trim() || null,
    sizes_available: String(formData.get("sizes_available") ?? "").trim() || null,
    product_link: String(formData.get("product_link") ?? "").trim(),
    affiliate_link: String(formData.get("affiliate_link") ?? "").trim() || null,
    intro_emoji: String(formData.get("intro_emoji") ?? "").trim() || null,
    intro_text: String(formData.get("intro_text") ?? "").trim() || null,
  };
  if (imageUrl) payload.image_url = imageUrl;

  const isNew = !id;
  let promoId = id;
  if (promoId) {
    // A promo found automatically (Mercado Livre/eBay) keeps its "source",
    // "external_id" and "currency" when edited — only manual
    // field-completion should change here, not what created the row or
    // what currency its price fields are actually in (an eBay promo is USD;
    // overwriting that back to "BRL" here would mislabel its prices).
    delete payload.source;
    delete payload.currency;
    const { error } = await client.from("promos").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", promoId);
    if (error) throw error;
  } else {
    payload.created_by = actor?.id ?? null;
    const { data, error } = await client.from("promos").insert(payload).select("id").single();
    if (error) throw error;
    promoId = data.id;
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: isNew ? "create" : "update", entityType: "promoção", entityLabel: productName });
  }

  revalidatePath("/admin/promocoes");

  if (imageError) {
    redirect(`/admin/promocoes/${promoId}?imageError=${encodeURIComponent(imageError)}`);
  }
  redirect("/admin/promocoes?saved=1");
}

export async function deletePromo(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentProfile();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: promo } = await client.from("promos").select("product_name").eq("id", id).single();
  await client.from("promos").delete().eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "promoção", entityLabel: promo?.product_name });
  }
  revalidatePath("/admin/promocoes");
}

export async function toggleSent(id: string, sent: boolean) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client.from("promos").update({ sent_at: sent ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/admin/promocoes");
}
