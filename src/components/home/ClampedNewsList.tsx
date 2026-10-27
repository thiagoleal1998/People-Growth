"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pickLocale } from "@/lib/locale-content";
import { articleHref } from "@/lib/article-url";
import { FormatTag } from "@/components/FormatTag";
import { PeopleGrowthBadge } from "@/components/PeopleGrowthBadge";
import { PontoDeReplicaBadge } from "@/components/PontoDeReplicaBadge";
import type { ArticleWithCategory } from "@/app/[locale]/(public)/page";

// The sidebar next to this list (live box, featured video, sports, shorts)
// is a stack of fixed-aspect-ratio video embeds whose combined height
// depends on which of those are turned on in Configurações — there's no
// single article count that lines up with every combination, so instead of
// guessing one, this measures the sidebar's real rendered height in the
// browser and shows exactly as many rows as fit it, recomputing on resize.
// Server-rendered with every article already in the markup (so it still
// reads fine with JS off or before hydration) — the clamp only kicks in
// once the measurement runs.
export function ClampedNewsList({
  articles,
  authorNames,
  locale,
  byLabel,
  sidebarId,
}: {
  articles: ArticleWithCategory[];
  authorNames: Record<string, string>;
  locale: string;
  byLabel: string;
  sidebarId: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(articles.length);

  useLayoutEffect(() => {
    function recompute() {
      const sidebar = document.getElementById(sidebarId);
      const list = listRef.current;
      if (!sidebar || !list) return;
      // Side-by-side only above the layout's own 900px breakpoint — below
      // that the columns stack, so there's nothing to line up against.
      if (window.innerWidth <= 900) {
        setVisibleCount(articles.length);
        return;
      }
      // Not just the sidebar's own height: this list sits lower in its own
      // column than the sidebar starts in its (the featured/secondary
      // article cards and the newsletter box come first, above "Mais
      // notícias"), so what has to match is the gap from where THIS list
      // begins down to where the sidebar ends, not the sidebar's full height.
      const target = sidebar.getBoundingClientRect().bottom - list.getBoundingClientRect().top;
      const rows = Array.from(list.children) as HTMLElement[];
      let used = 0;
      let count = 0;
      for (const row of rows) {
        const rowHeight = row.getBoundingClientRect().height;
        if (count > 0 && used + rowHeight > target) break;
        used += rowHeight;
        count += 1;
      }
      setVisibleCount(Math.max(1, count));
    }
    recompute();
    // The sidebar's own iframes/images (YouTube embeds, the sports crest)
    // can still be loading at mount time and grow the sidebar afterwards —
    // "load" catches that; the short delay catches late web-font swaps
    // nudging text (and so row/sidebar heights) by a few pixels.
    window.addEventListener("resize", recompute);
    window.addEventListener("load", recompute);
    const lateRecheck = setTimeout(recompute, 800);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("load", recompute);
      clearTimeout(lateRecheck);
    };
  }, [articles.length, sidebarId]);

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <h2 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--site-muted)", marginTop: "1.5rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Mais notícias
      </h2>
      <div ref={listRef}>
        {articles.map((article, i) => (
          <Link
            key={article.id}
            href={articleHref(article, article.categories?.slug)}
            className="more-news-row"
            style={{
              display: i < visibleCount ? "flex" : "none",
              gap: "1rem",
              alignItems: "flex-start",
              textDecoration: "none",
              padding: "1rem 0",
              borderTop: "1px solid var(--site-border)",
            }}
          >
            {article.cover_image && (
              <div
                className="more-news-img"
                style={{ width: "110px", height: "80px", flexShrink: 0, borderRadius: "0.375rem", background: `url("${article.cover_image}") center/cover` }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "0.375rem" }}>
                <FormatTag format={article.format} locale={locale} />
                {article.categories?.is_people_growth && <PeopleGrowthBadge />}
                {article.categories?.is_ponto_de_replica && <PontoDeReplicaBadge />}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: i % 2 === 0 ? "1rem" : "0.9375rem", color: "var(--site-text)", lineHeight: 1.35, marginBottom: "0.25rem" }}>
                {pickLocale(locale, article.title_pt, article.title_en)}
              </h4>
              {i % 2 === 0 && article.excerpt_pt && (
                <p style={{ color: "var(--site-muted)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "0.25rem" }}>
                  {pickLocale(locale, article.excerpt_pt, article.excerpt_en)}
                </p>
              )}
              <span style={{ fontSize: "0.75rem", color: "var(--site-faint)" }}>
                {article.author_id && authorNames[article.author_id] && <>{byLabel} {authorNames[article.author_id]} · </>}
                {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/conteudo"
        className="hover-cta"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: "0.625rem",
          border: "1px solid var(--site-border-strong)",
          color: "var(--site-text)",
          fontWeight: 700,
          fontSize: "0.875rem",
          textDecoration: "none",
        }}
      >
        Ver todas as notícias <ArrowRight size={16} />
      </Link>
    </div>
  );
}
