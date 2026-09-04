import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { articlePath } from "@/lib/article-url";
import type { Article } from "@/types/database.types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peopleandgrowth.com.br";

const routes = [
  { path: "/", priority: 1.0 },
  { path: "/sobre", priority: 0.9 },
  { path: "/curriculo", priority: 0.8 },
  { path: "/portfolio", priority: 0.8 },
  { path: "/servicos", priority: 0.9 },
  { path: "/conteudo", priority: 0.9 },
  { path: "/cursos", priority: 0.7 },
  { path: "/laboratorio-ia", priority: 0.8 },
  { path: "/recursos", priority: 0.8 },
  { path: "/na-midia", priority: 0.6 },
  { path: "/ferramentas", priority: 0.6 },
  { path: "/depoimentos", priority: 0.7 },
  { path: "/contato", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["pt", "en"];

  const staticEntries: MetadataRoute.Sitemap = routes.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    }))
  );

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("articles")
    .select("slug, format, updated_at, published_at, categories(slug)")
    .eq("status", "published");

  type ArticleRow = Pick<Article, "slug" | "format" | "updated_at" | "published_at"> & { categories: { slug: string } | null };
  const articleEntries: MetadataRoute.Sitemap = ((data ?? []) as ArticleRow[]).flatMap((a) =>
    (locales as ("pt" | "en")[]).map((locale) => ({
      url: `${baseUrl}${articlePath(a, a.categories?.slug, locale)}`,
      lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...articleEntries];
}
