import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickLocale } from "@/lib/locale-content";
import type { Category } from "@/types/database.types";

// How many categories the bar shows at once — kept at today's count on purpose,
// so adding more categories later doesn't widen the bar. The rest become reachable
// through "Outras categorias" instead.
const MAX_SHOWN = 8;

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function CategoryNav() {
  const locale = await getLocale();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: categoriesData }, { data: articlesData }] = await Promise.all([
    client.from("categories").select("*"),
    client.from("articles").select("category_id").eq("status", "published").not("category_id", "is", null),
  ]);
  const categories = (categoriesData ?? []) as Category[];
  // A category with no published article yet has nothing to show, so it stays hidden.
  const categoryIdsWithArticles = new Set((articlesData ?? []).map((a: { category_id: string }) => a.category_id));
  const eligible = categories.filter((c) => categoryIdsWithArticles.has(c.id));

  if (eligible.length === 0) return null;

  // A different random pick and order each time the bar renders — only once there
  // are more eligible categories than fit does the rest need "Outras categorias".
  const sorted = shuffled(eligible).slice(0, MAX_SHOWN);
  const hasMore = eligible.length > MAX_SHOWN;

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
        {hasMore && (
          <Link
            href="/conteudo/categorias"
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
            {locale === "en" ? "Other categories" : "Outras categorias"}
          </Link>
        )}
        {/* Fixed on purpose: unlike the categories above, this one never moves or gets shuffled out. */}
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
        /* Wide desktops: the categories become separate call-to-action buttons,
           stacked on the left and sliding in from outside the screen one after
           another. They sit at the vertical middle, like the social icons. */
        @keyframes category-cta-in {
          from { opacity: 0; transform: translateX(-160%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (min-width: 1600px) {
          .category-nav {
            position: fixed;
            top: 50%;
            left: 1.25rem;
            width: 190px;
            z-index: 40;
            border: none !important;
            border-radius: 0;
            padding: 0;
            background: none !important;
            box-shadow: none;
          }
          .category-nav .category-nav-wrap { overflow: visible; }
          .category-nav .category-nav-row {
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start !important;
            overflow: visible !important;
            gap: 0.5rem !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .category-nav .category-nav-row a {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.45rem 0.9rem;
            border-radius: 9999px;
            background: rgba(13, 27, 42, 0.92) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 22px -10px rgba(15, 23, 42, 0.55);
            font-size: 0.75rem !important;
            color: rgba(255, 255, 255, 0.9) !important;
            animation: category-cta-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
            transition: transform 0.2s, background-color 0.2s, color 0.2s;
          }
          .category-nav .category-nav-row a:nth-child(1) { animation-delay: 0.25s; }
          .category-nav .category-nav-row a:nth-child(2) { animation-delay: 0.37s; }
          .category-nav .category-nav-row a:nth-child(3) { animation-delay: 0.49s; }
          .category-nav .category-nav-row a:nth-child(4) { animation-delay: 0.61s; }
          .category-nav .category-nav-row a:nth-child(5) { animation-delay: 0.73s; }
          .category-nav .category-nav-row a:nth-child(6) { animation-delay: 0.85s; }
          .category-nav .category-nav-row a:nth-child(7) { animation-delay: 0.97s; }
          .category-nav .category-nav-row a:nth-child(8) { animation-delay: 1.0899999999999999s; }
          .category-nav .category-nav-row a:nth-child(9) { animation-delay: 1.21s; }
          .category-nav .category-nav-row a::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #4361EE, #06D6A0);
            flex-shrink: 0;
          }
          .category-nav .category-nav-row a:hover { background: #4361EE !important; color: white !important; transform: translateX(4px); }
          .category-nav .category-nav-row a.category-nav-columnists {
            background: #4361EE !important;
            border-color: transparent;
            color: white !important;
            font-weight: 800 !important;
          }
          .category-nav .category-nav-row a.category-nav-columnists::before { background: white; }
          .category-nav .category-nav-row a.category-nav-columnists:hover { background: #3651d4 !important; }
        }
      `}</style>
    </nav>
  );
}
