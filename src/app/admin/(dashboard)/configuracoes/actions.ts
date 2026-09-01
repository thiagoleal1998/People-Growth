"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/supabase/storage";

export async function updateSiteConfig(formData: FormData) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { url: logoUrl, error: logoError } = await uploadPublicImage(formData.get("logo_file"), "logos");
  if (logoUrl) {
    await client.from("site_config").upsert({ key: "logo_url", value: logoUrl });
  }

  const { url: faviconUrl, error: faviconError } = await uploadPublicImage(formData.get("favicon_file"), "favicons");
  if (faviconUrl) {
    await client.from("site_config").upsert({ key: "favicon_url", value: faviconUrl });
  }

  const entries = Array.from(formData.entries()).filter(
    ([key]) => key !== "" && key !== "is_live" && key !== "logo_file" && key !== "favicon_file"
  );

  await client.from("site_config").upsert({ key: "is_live", value: formData.get("is_live") === "on" ? "true" : "false" });

  for (const [key, value] of entries) {
    await client.from("site_config").upsert({ key, value: String(value) });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/[locale]", "layout");
  const errorParams = [
    logoError ? `logoError=${encodeURIComponent(logoError)}` : "",
    faviconError ? `faviconError=${encodeURIComponent(faviconError)}` : "",
  ].filter(Boolean).join("&");
  redirect(`/admin/configuracoes?saved=1${errorParams ? `&${errorParams}` : ""}`);
}
