import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ConfiguracoesTabs } from "./ConfiguracoesTabs";
import type { Category } from "@/types/database.types";

type SiteConfigRow = { key: string; value: string | null };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ saved?: string; logoError?: string; faviconError?: string }> }) {
  const { saved, logoError, faviconError } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data }, { data: categoriesData }, { data: articlesData }, { data: extraCategoriesData }] = await Promise.all([
    client.from("site_config").select("*") as Promise<{ data: SiteConfigRow[] | null }>,
    client.from("categories").select("*").order("name_pt"),
    client.from("articles").select("id, category_id"),
    client.from("article_categories").select("article_id, category_id"),
  ]);
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));
  const categories = (categoriesData ?? []) as Category[];

  // How many articles sit under each category — shown so deleting one isn't a
  // guess, and counting both an article's primary category and any additional
  // ones, same as the public category pages. Every article counts here, not
  // only published ones, since this is about what a delete would affect.
  const articleCounts: Record<string, number> = {};
  const counted = new Map<string, Set<string>>();
  const bump = (categoryId: string, articleId: string) => {
    if (!counted.has(categoryId)) counted.set(categoryId, new Set());
    counted.get(categoryId)!.add(articleId);
  };
  for (const article of (articlesData ?? []) as { id: string; category_id: string | null }[]) {
    if (article.category_id) bump(article.category_id, article.id);
  }
  for (const row of (extraCategoriesData ?? []) as { article_id: string; category_id: string }[]) {
    bump(row.category_id, row.article_id);
  }
  for (const [categoryId, ids] of counted) articleCounts[categoryId] = ids.size;

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Configurações" subtitle="Identidade visual, contato e conteúdo exibido no site público" />

      <ConfiguracoesTabs values={values} categories={categories} articleCounts={articleCounts} logoError={logoError} faviconError={faviconError} />
    </div>
  );
}
