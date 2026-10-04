import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import type { Category } from "@/types/database.types";

const order = ["negocios", "marketing", "ia", "politica", "esporte", "economia", "cultura", "meio-ambiente"];

export async function CategoryNav() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("categories").select("*");
  const categories = (data ?? []) as Category[];

  const sorted = order
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));

  if (sorted.length === 0) return null;

  return (
    <nav className="category-nav" style={{ backgroundColor: "var(--site-surface-alt)", borderBottom: "1px solid var(--site-border)" }}>
      <div className="category-nav-wrap">
      <div
        className="container-xl category-nav-row"
        style={{ display: "flex", justifyContent: "safe center", gap: "1.75rem", overflowX: "auto", padding: "0.75rem 0" }}
      >
        {sorted.map((category) => (
          <Link
            key={category.id}
            href={{ pathname: "/conteudo/categoria/[slug]", params: { slug: category.slug } }}
            style={{
              flexShrink: 0,
              fontSize: "0.8125rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--site-text-secondary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {pickLocale(locale, category.name_pt, category.name_en)}
          </Link>
        ))}
        <Link
          href="/conteudo/colunistas"
          style={{
            flexShrink: 0,
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "#4361EE",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {locale === "en" ? "Columnists" : "Colunistas"}
        </Link>
      </div>
      </div>
      {/* The row scrolls sideways on phones. The wrapper clips its scrollbar
          (the row is taller than the wrapper by the scrollbar height), so no
          grey bar shows in any browser, and the right-edge fade signals there
          is more to swipe to. "safe center" keeps the first item reachable. */}
      <style>{`
        .category-nav-wrap { overflow: hidden; position: relative; }
        .category-nav-row { scrollbar-width: none; scroll-padding-inline: 1rem; margin-bottom: -20px; padding-bottom: calc(0.75rem + 20px) !important; }
        .category-nav-row::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .category-nav-row { gap: 0.5rem !important; padding-left: 1rem !important; padding-right: 1rem !important; }
          .category-nav-row a {
            padding: 0.4375rem 0.875rem;
            border-radius: 9999px;
            background: var(--site-surface);
            border: 1px solid var(--site-border);
            font-size: 0.75rem !important;
          }
          .category-nav-wrap::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 2.5rem;
            background: linear-gradient(to right, transparent, var(--site-surface-alt));
            pointer-events: none;
          }
        }
        /* Wide desktops: the categories become a fixed column on the left, in
           the space beside the content, so they stay in view while scrolling.
           Narrower screens keep the horizontal row. */
        @media (min-width: 1600px) {
          .category-nav {
            position: fixed;
            top: 7.5rem;
            left: 0.75rem;
            width: 170px;
            z-index: 40;
            border: 1px solid var(--site-border) !important;
            border-radius: 0.75rem;
            padding: 0.5rem;
            background-color: var(--site-surface) !important;
          }
          .category-nav .category-nav-wrap { overflow: visible; }
          .category-nav .category-nav-row {
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start !important;
            overflow: visible !important;
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .category-nav .category-nav-row a {
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.75rem !important;
          }
          .category-nav .category-nav-row a:hover { background: rgba(67,97,238,0.08); color: #4361EE !important; }
        }
      `}</style>
    </nav>
  );
}
