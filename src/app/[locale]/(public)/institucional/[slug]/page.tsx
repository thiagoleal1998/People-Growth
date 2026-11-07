import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import { InstitutionalPostView } from "@/components/InstitutionalPostView";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

export const revalidate = 300;

async function getPost(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("institutional_posts").select("*").eq("slug", slug).eq("status", "published").single();
  if (!data) return null;
  const post = data as InstitutionalPost;
  const columnist = post.author_columnist_id
    ? ((await client.from("columnists").select("*").eq("id", post.author_columnist_id).single()).data as Columnist | null)
    : null;
  return { ...post, columnist };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Não encontrado" };
  return {
    title: `${pickLocale(locale, post.title_pt, post.title_en)} | Grupo Festina`,
    description: pickLocale(locale, post.excerpt_pt, post.excerpt_en) ?? undefined,
  };
}

export default async function InstitucionalPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--site-bg)", paddingTop: "6rem" }}>
      <div className="container-xl" style={{ maxWidth: "760px" }}>
        <InstitutionalPostView post={post} columnist={post.columnist} locale={locale} />
      </div>
    </section>
  );
}
