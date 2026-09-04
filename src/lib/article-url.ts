import type { Article } from "@/types/database.types";

// Used both in the URL (/conteudo/noticia/categoria/... vs
// /conteudo/mea-sententia/categoria/...) and to validate that a URL's
// [format] segment actually matches the article it claims to be.
export const FORMAT_SEGMENT: Record<Article["format"], string> = {
  noticia: "noticia",
  opiniao: "mea-sententia",
};

export const FORMAT_FROM_SEGMENT: Record<string, Article["format"]> = {
  noticia: "noticia",
  "mea-sententia": "opiniao",
};

// Categories are optional on an article; uncategorized ones fall back to
// this fixed segment rather than breaking the URL shape.
export const UNCATEGORIZED_SEGMENT = "geral";

export function articleHref(article: Pick<Article, "slug" | "format">, categorySlug?: string | null) {
  return {
    pathname: "/conteudo/[format]/categoria/[category]/[slug]" as const,
    params: {
      format: FORMAT_SEGMENT[article.format],
      category: categorySlug || UNCATEGORIZED_SEGMENT,
      slug: article.slug,
    },
  };
}

export function articlePath(article: Pick<Article, "slug" | "format">, categorySlug: string | null | undefined, locale: "pt" | "en") {
  const category = categorySlug || UNCATEGORIZED_SEGMENT;
  const format = FORMAT_SEGMENT[article.format];
  return locale === "en"
    ? `/en/content/${format}/category/${category}/${article.slug}`
    : `/pt/conteudo/${format}/categoria/${category}/${article.slug}`;
}
