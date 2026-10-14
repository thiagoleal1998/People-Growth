"use client";

import { Link } from "@/i18n/navigation";
import { PagedCarousel } from "@/components/PagedCarousel";

export type ColumnistCard = {
  id: string;
  slug: string;
  name: string;
  photoUrl: string | null;
  blurb: string | null | undefined;
};

// The home page's columnist strip used to be a fixed random 4 with no way
// to see anyone else short of leaving for /conteudo/colunistas — this pages
// through everyone (4 at a time, same grid/swipe-row CSS as before, defined
// in page.tsx's own <style> block) via the shared PagedCarousel.
export function ColumnistCarousel({ cards }: { cards: ColumnistCard[] }) {
  return (
    <PagedCarousel
      items={cards.map((author) => (
        <Link
          key={author.id}
          href={{ pathname: "/conteudo/autor/[slug]", params: { slug: author.slug } }}
          className="columnist-hover columnist-card"
          style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", textDecoration: "none" }}
        >
          <div
            className="columnist-photo"
            style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "0.375rem",
              flexShrink: 0,
              background: author.photoUrl ? `url("${author.photoUrl}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
            }}
          />
          <div className="columnist-text">
            <div style={{ fontWeight: 800, fontSize: "0.8125rem", color: "#315E9C", marginBottom: "0.25rem" }}>{author.name}</div>
            <div
              style={{
                color: "var(--site-text-secondary)",
                fontSize: "0.75rem",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {author.blurb}
            </div>
          </div>
        </Link>
      ))}
      pageSize={4}
      accentColor="#315E9C"
      controlColor="#315E9C"
      controlBorderColor="var(--site-border)"
      dotInactiveColor="var(--site-border)"
      pageClassName="columnist-grid"
    />
  );
}
