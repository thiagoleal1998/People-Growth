import { Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database.types";

export async function MostRead({ excludeId, limit = 5 }: { excludeId?: string; limit?: number }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client
    .from("articles")
    .select("id, slug, title_pt, views")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(limit + (excludeId ? 1 : 0));

  let items = (data ?? []) as Pick<Article, "id" | "slug" | "title_pt" | "views">[];
  if (excludeId) items = items.filter((a) => a.id !== excludeId);
  items = items.slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div style={{ backgroundColor: "var(--site-surface-alt)", borderRadius: "1rem", padding: "1.5rem" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 800, fontSize: "0.9375rem", color: "var(--site-text)", marginBottom: "1.125rem" }}>
        <Flame size={16} color="#FFB703" /> Mais lidos
      </h3>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {items.map((a, i) => (
          <li key={a.id}>
            <Link
              href={{ pathname: "/conteudo/[slug]", params: { slug: a.slug } }}
              style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", textDecoration: "none" }}
            >
              <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "rgba(67,97,238,0.35)", lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--site-text)", lineHeight: 1.4 }}>{a.title_pt}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
