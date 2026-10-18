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
// through everyone (same grid/swipe-row CSS as before, defined in page.tsx's
// own <style> block) via the shared PagedCarousel. pageSize is 3, not 4 —
// with exactly 4 "complete enough to show" profiles right now (the only
// count isAuthorPubliclyVisible currently lets through), a page of 4 would
// mean a single page with nothing to ever transition to, which is exactly
// what made the auto-advance/fade look like it wasn't there at all.
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
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "0.5rem",
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
              }}
            >
              {author.blurb}
            </div>
          </div>
        </Link>
      ))}
      pageSize={3}
      accentColor="#315E9C"
      controlColor="#315E9C"
      controlBorderColor="var(--site-border)"
      dotInactiveColor="var(--site-border)"
      pageClassName="columnist-grid"
    />
  );
}
