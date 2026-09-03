import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ArticlePreviewFrame } from "@/components/ArticlePreviewFrame";
import type { Article, Author, Category } from "@/types/database.types";

export default async function AdminArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: article } = await client.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  const [{ data: author }, { data: category }] = await Promise.all([
    article.author_id ? client.from("authors").select("*").eq("id", article.author_id).single() : Promise.resolve({ data: null }),
    article.category_id ? client.from("categories").select("*").eq("id", article.category_id).single() : Promise.resolve({ data: null }),
  ]);

  return (
    <div style={{ maxWidth: "900px" }}>
      <Link href={`/admin/artigos/${id}`} style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.25rem" }}>
        <ArrowLeft size={14} /> Voltar para edição
      </Link>
      <ArticlePreviewFrame article={article as Article} author={(author as Author) ?? null} category={(category as Category) ?? null} />
    </div>
  );
}
