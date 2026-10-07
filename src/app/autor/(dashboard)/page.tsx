import Link from "next/link";
import { FileText, Eye, Clock, MessageCircle, Megaphone, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { Announcement, Article, Author } from "@/types/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

export default async function AutorHomePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: ownArticlesData }, { data: announcementsData }, { data: newsData }, { data: authorsData }] = await Promise.all([
    profile?.author_id ? client.from("articles").select("*").eq("author_id", profile.author_id) : Promise.resolve({ data: [] }),
    client.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(6),
    client.from("authors").select("id, name"),
  ]);

  const ownArticles = (ownArticlesData ?? []) as Article[];
  const announcements = (announcementsData ?? []) as Announcement[];
  const news = (newsData ?? []) as Article[];
  const authorNameById = new Map(((authorsData ?? []) as Pick<Author, "id" | "name">[]).map((a) => [a.id, a.name]));
  const ownName = profile?.author_id ? authorNameById.get(profile.author_id) : undefined;

  let pendingComments = 0;
  if (ownArticles.length > 0) {
    const { count } = await client
      .from("comments")
      .select("id", { count: "exact", head: true })
      .in("article_id", ownArticles.map((a) => a.id))
      .eq("status", "pending");
    pendingComments = count ?? 0;
  }

  const published = ownArticles.filter((a) => a.status === "published");
  const totalViews = ownArticles.reduce((sum, a) => sum + a.views, 0);
  const drafting = ownArticles.filter((a) => a.status === "draft" || a.status === "pending").length;

  const stats = [
    { label: "Artigos publicados", value: published.length, icon: FileText, color: "#4361EE" },
    { label: "Visualizações totais", value: totalViews, icon: Eye, color: "#06D6A0" },
    { label: "Rascunhos e pendentes", value: drafting, icon: Clock, color: "#FFB703" },
    { label: "Comentários a revisar", value: pendingComments, icon: MessageCircle, color: "#4361EE" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.25rem" }}>
          {ownName ? `Olá, ${ownName.split(" ")[0]}!` : "Painel do autor"}
        </h1>
        <p style={{ color: "var(--admin-muted)", fontSize: "0.9375rem" }}>O resumo do seu trabalho e as novidades da People &amp; Growth.</p>
      </div>

      {profile?.author_id && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--admin-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontWeight: 900, fontSize: "2rem", color: "var(--admin-text)", lineHeight: 1, marginBottom: "0.25rem" }}>{value.toLocaleString("pt-BR")}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="autor-home-grid">
        {/* Comunicados */}
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Megaphone size={17} color="#4361EE" /> Comunicados
            </h2>
            <Link href="/autor/comunicados" style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Ver todos →</Link>
          </div>
          {announcements.length === 0 ? (
            <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum comunicado por enquanto.</div>
          ) : (
            <div>
              {announcements.map((item) => (
                <div key={item.id} style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)" }}>{item.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginTop: "0.25rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.body}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.375rem" }}>{formatDate(item.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Site news */}
        <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Newspaper size={17} color="#06D6A0" /> Novidades no site
            </h2>
          </div>
          {news.length === 0 ? (
            <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum artigo publicado ainda.</div>
          ) : (
            <div>
              {news.map((item) => (
                <div key={item.id} style={{ padding: "0.875rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title_pt}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>
                    {item.author_id && authorNameById.get(item.author_id) ? `${authorNameById.get(item.author_id)} · ` : ""}
                    {item.published_at && formatDate(item.published_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .autor-home-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
