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
          className="category-nav-columnists"
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
        /* Wide desktops: a card fixed on the left, starting at the same height
           as the social icons on the right, so the two columns line up. */
        @media (min-width: 1600px) {
          .category-nav {
            position: fixed;
            top: 10rem;
            left: 1.25rem;
            width: 180px;
            z-index: 40;
            border: 1px solid var(--site-border) !important;
            border-radius: 1rem;
            padding: 0.875rem 0.625rem 0.625rem;
            background-color: var(--site-surface) !important;
            box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.25);
          }
          .category-nav .category-nav-wrap { overflow: visible; }
          .category-nav .category-nav-row {
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start !important;
            overflow: visible !important;
            gap: 0.125rem !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .category-nav .category-nav-row a {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.5rem 0.625rem;
            border-radius: 0.5rem;
            font-size: 0.75rem !important;
            color: var(--site-text-secondary) !important;
            transition: background-color 0.15s, color 0.15s;
          }
          .category-nav .category-nav-row a::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #4361EE, #06D6A0);
            flex-shrink: 0;
          }
          .category-nav .category-nav-row a:hover { background: rgba(67, 97, 238, 0.09); color: #4361EE !important; }
          .category-nav .category-nav-row a.category-nav-columnists {
            margin-top: 0.5rem;
            background: #4361EE;
            color: white !important;
            font-weight: 800 !important;
          }
          .category-nav .category-nav-row a.category-nav-columnists::before { background: white; }
          .category-nav .category-nav-row a.category-nav-columnists:hover { background: #3651d4; color: white !important; }
        }
      `}</style>
    </nav>
  );
}
