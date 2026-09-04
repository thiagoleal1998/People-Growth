import { notFound, permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { articlePath } from "@/lib/article-url";

// The real article route now lives at
// /conteudo/[format]/categoria/[category]/[slug] (see the sibling [segment]
// folder — named the same as this one because Next.js requires sibling
// dynamic routes at the same level to share one param name). This flat
// route only existed briefly and redirects any old link to the canonical
// URL instead of rendering content at two different addresses.
//
// Deliberately no loading.tsx anywhere above this route (checked all the
// way up through conteudo/) — a loading.tsx boundary in the ancestor chain
// silently swallows permanentRedirect()/notFound() here in this Next.js
// version, making the page just render as a 200 with no redirect at all.
// Confirmed by isolated reproduction; not worth a loading skeleton on a
// page that never renders anything itself.
export default async function LegacyArticleRedirect({
  params,
}: {
  params: Promise<{ segment: string; locale: string }>;
}) {
  const { segment: slug, locale } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: article } = await client
    .from("articles")
    .select("slug, format, categories(slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  permanentRedirect(articlePath(article, article.categories?.slug, locale === "en" ? "en" : "pt"));
}
