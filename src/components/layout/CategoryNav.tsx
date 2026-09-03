import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database.types";

const order = ["negocios", "marketing", "ia", "politica", "esporte", "economia", "cultura", "meio-ambiente"];

export async function CategoryNav() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("categories").select("*");
  const categories = (data ?? []) as Category[];

  const sorted = order
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));

  if (sorted.length === 0) return null;

  return (
    <nav style={{ backgroundColor: "var(--site-surface-alt)", borderBottom: "1px solid var(--site-border)" }}>
      <div
        className="container-xl"
        style={{ display: "flex", justifyContent: "center", gap: "1.75rem", overflowX: "auto", padding: "0.75rem 0" }}
      >
        {sorted.map((category) => (
          <Link
            key={category.id}
            href={{ pathname: "/mea-sententia/categoria/[slug]", params: { slug: category.slug } }}
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
            {category.name_pt}
          </Link>
        ))}
        <Link
          href="/mea-sententia/colunistas"
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
          Colunistas
        </Link>
      </div>
    </nav>
  );
}
