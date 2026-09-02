import { createClient } from "@/lib/supabase/server";
import { AdBannerClient } from "./AdBannerClient";
import type { Ad } from "@/types/database.types";

export async function AdBanner({ slotKey, articleId, style }: { slotKey: string; articleId?: string; style?: React.CSSProperties }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: allAdsData } = await client
    .from("ads")
    .select("*")
    .eq("slot_key", slotKey)
    .eq("active", true)
    .eq("target_mode", "all")
    .order("updated_at", { ascending: false });
  const allAds = (allAdsData ?? []) as Ad[];

  let specificAds: Ad[] = [];
  if (articleId) {
    const { data: targets } = await client.from("ad_targets").select("ad_id").eq("article_id", articleId);
    const adIds = ((targets ?? []) as { ad_id: string }[]).map((t) => t.ad_id);
    if (adIds.length > 0) {
      const { data: specificData } = await client
        .from("ads")
        .select("*")
        .eq("slot_key", slotKey)
        .eq("active", true)
        .eq("target_mode", "specific")
        .in("id", adIds)
        .order("updated_at", { ascending: false });
      specificAds = (specificData ?? []) as Ad[];
    }
  }

  // A specific-article ad is more relevant than a site-wide one; only one
  // ad ever shows per slot so they never collide in the same spot.
  const ad = specificAds[0] ?? allAds[0];

  if (!ad || !ad.image_url) return null;

  return <AdBannerClient ad={ad} style={style} />;
}
