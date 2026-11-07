import type { InstitutionalPost } from "@/types/database.types";

export function institucionalHref(post: Pick<InstitutionalPost, "slug">) {
  return { pathname: "/institucional/[slug]" as const, params: { slug: post.slug } };
}

export function institucionalPath(post: Pick<InstitutionalPost, "slug">, locale: "pt" | "en") {
  return locale === "en" ? `/en/institutional/${post.slug}` : `/pt/institucional/${post.slug}`;
}
