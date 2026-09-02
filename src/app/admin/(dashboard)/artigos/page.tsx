import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, PrimaryLinkButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ArticlesTabs } from "./ArticlesTabs";
import type { Article } from "@/types/database.types";

export default async function ArtigosAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const [{ data }, profile] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("articles").select("*").order("created_at", { ascending: false }),
    getCurrentProfile(),
  ]);
  const articles = (data ?? []) as Article[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Artigos"
        subtitle={`${articles.length} artigo${articles.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/artigos/novo"><Plus size={16} /> Novo artigo</PrimaryLinkButton>}
      />

      <ArticlesTabs articles={articles} currentAuthorId={profile?.author_id ?? null} />
    </div>
  );
}
