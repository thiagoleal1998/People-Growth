import { createClient } from "@/lib/supabase/server";
import { AdBannerClient } from "./AdBannerClient";
import type { AdSlot } from "@/types/database.types";

export async function AdBanner({ slotKey, style }: { slotKey: string; style?: React.CSSProperties }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("ad_slots").select("*").eq("key", slotKey).eq("active", true).single();
  const slot = data as AdSlot | null;

  if (!slot || !slot.image_url) return null;

  return <AdBannerClient slot={slot} style={style} />;
}
