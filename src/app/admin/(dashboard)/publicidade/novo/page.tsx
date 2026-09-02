import { createClient } from "@/lib/supabase/server";
import { AdForm } from "../AdForm";
import type { Article, Ad } from "@/types/database.types";

export default async function NovoAnuncioPage({ searchParams }: { searchParams: Promise<{ imageError?: string }> }) {
  const { imageError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: articlesData }, { data: adsData }, { data: targetsData }] = await Promise.all([
    client.from("articles").select("id, title_pt").order("created_at", { ascending: false }),
    client.from("ads").select("id, title, slot_key, target_mode").eq("active", true),
    client.from("ad_targets").select("ad_id, article_id"),
  ]);

  const articles = (articlesData ?? []) as Pick<Article, "id" | "title_pt">[];
  const otherAds = (adsData ?? []) as Pick<Ad, "id" | "title" | "slot_key" | "target_mode">[];
  const targetsByAd: Record<string, string[]> = {};
  for (const t of (targetsData ?? []) as { ad_id: string; article_id: string }[]) {
    (targetsByAd[t.ad_id] ??= []).push(t.article_id);
  }

  return (
    <AdForm
      articles={articles}
      targetedArticleIds={[]}
      otherAds={otherAds}
      targetsByAd={targetsByAd}
      imageError={imageError}
    />
  );
}
