import { Flame } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { articleHref } from "@/lib/article-url";
import { pickLocale } from "@/lib/locale-content";
import type { Article, Category } from "@/types/database.types";

type Item = Pick<Article, "id" | "slug" | "title_pt" | "title_en" | "views" | "format"> & { categories: Pick<Category, "slug"> | null };

export async function MostRead({ excludeId, limit = 5 }: { excludeId?: string; limit?: number }) {
  const locale = await getLocale();
  const t = await getTranslations("newsletter");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client
    .from("articles")
    .select("id, slug, title_pt, title_en, views, format, categories(slug)")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(limit + (excludeId ? 1 : 0));

  let items = (data ?? []) as Item[];
  if (excludeId) items = items.filter((a) => a.id !== excludeId);
  items = items.slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div style={{ backgroundColor: "var(--site-surface-alt)", borderRadius: "1rem", padding: "1.5rem" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 800, fontSize: "0.9375rem", color: "var(--site-text)", marginBottom: "1.125rem" }}>
        <Flame size={16} color="#FFB703" /> {t("mostRead")}
      </h3>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {items.map((a, i) => (
          <li key={a.id}>
            <Link
              href={articleHref(a, a.categories?.slug)}
              style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", textDecoration: "none" }}
            >
              <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "rgba(67,97,238,0.35)", lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--site-text)", lineHeight: 1.4 }}>{pickLocale(locale, a.title_pt, a.title_en)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
