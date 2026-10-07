import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ArticlePreviewFrame } from "@/components/ArticlePreviewFrame";
import type { Article, Author, Category } from "@/types/database.types";

export default async function AuthorArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile?.author_id) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: article } = await client.from("articles").select("*").eq("id", id).eq("author_id", profile.author_id).single();
  if (!article) notFound();

  const [{ data: author }, { data: category }, { data: coauthorRows }] = await Promise.all([
    client.from("authors").select("*").eq("id", profile.author_id).single(),
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
    client.from("article_coauthors").select("author_id, authors(*)").eq("article_id", id),
  ]);
  const coauthors = ((coauthorRows ?? []) as { authors: Author | null }[]).map((row) => row.authors).filter((a): a is Author => Boolean(a));

  return (
    <div style={{ maxWidth: "900px" }}>
      <Link href={`/autor/artigos/${id}`} style={{ color: "#64748b", fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.25rem" }}>
        <ArrowLeft size={14} /> Voltar para edição
      </Link>
      <ArticlePreviewFrame article={article as Article} author={(author as Author) ?? null} coauthors={coauthors} category={(category as Category) ?? null} />
    </div>
  );
}
