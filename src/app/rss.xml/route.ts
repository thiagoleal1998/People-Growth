import { createClient } from "@/lib/supabase/server";
import { articlePath } from "@/lib/article-url";
import type { Article } from "@/types/database.types";

export const revalidate = 300;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("articles")
    .select("title_pt, slug, format, excerpt_pt, published_at, categories(slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br";
  type FeedItem = Pick<Article, "title_pt" | "slug" | "format" | "excerpt_pt" | "published_at"> & { categories: { slug: string } | null };

  const items = ((data ?? []) as FeedItem[])
    .map((a) => {
      const link = `${baseUrl}${articlePath(a, a.categories?.slug, "pt")}`;
      return `
    <item>
      <title>${escapeXml(a.title_pt)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(a.excerpt_pt ?? "")}</description>
      <pubDate>${new Date(a.published_at ?? Date.now()).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>People &amp; Growth — Mea Sententia</title>
    <link>${baseUrl}/pt/conteudo</link>
    <description>Artigos e opiniões da People &amp; Growth.</description>
    <language>pt-BR</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
