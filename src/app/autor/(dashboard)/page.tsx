import Link from "next/link";
import { FileText, Eye, Clock, MessageCircle, Megaphone, Newspaper, Share2, Video, Instagram, Linkedin, Youtube } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { XIcon } from "@/components/icons/XIcon";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { articlePath } from "@/lib/article-url";
import type { Announcement, Article, Author, Category } from "@/types/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

const cardStyle = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" } as const;
const cardHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" } as const;

export default async function AutorHomePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: ownArticlesData }, { data: announcementsData }, { data: newsData }, { data: authorsData }, { data: categoriesData }, { data: configData }] = await Promise.all([
    profile?.author_id ? client.from("articles").select("*").eq("author_id", profile.author_id) : Promise.resolve({ data: [] }),
    client.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
    client.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(6),
    client.from("authors").select("id, name"),
    client.from("categories").select("id, slug"),
    client.from("site_config").select("*"),
  ]);

  const ownArticles = (ownArticlesData ?? []) as Article[];
  const announcements = (announcementsData ?? []) as Announcement[];
  const news = (newsData ?? []) as Article[];
  const authorNameById = new Map(((authorsData ?? []) as Pick<Author, "id" | "name">[]).map((a) => [a.id, a.name]));
  const categorySlugById = new Map(((categoriesData ?? []) as Pick<Category, "id" | "slug">[]).map((c) => [c.id, c.slug]));
  const ownName = profile?.author_id ? authorNameById.get(profile.author_id) : undefined;
  const config = Object.fromEntries(((configData ?? []) as { key: string; value: string | null }[]).map((c) => [c.key, c.value ?? ""]));

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

  // Only the channels actually configured in Configurações — no fabricated
  // links for accounts that don't exist, same rule as the public SocialSidebar.
  const socials = [
    config.instagram && { label: "Instagram", href: config.instagram, Icon: Instagram, color: "#E1306C" },
    config.linkedin && { label: "LinkedIn", href: config.linkedin, Icon: Linkedin, color: "#0A66C2" },
    config.whatsapp && { label: "WhatsApp", href: `https://wa.me/${config.whatsapp.replace(/\D/g, "")}`, Icon: WhatsAppIcon, color: "#25D366" },
    config.youtube && { label: "YouTube", href: config.youtube, Icon: Youtube, color: "#FF0000" },
    config.x && { label: "X", href: config.x, Icon: XIcon, color: "#0d1b2a" },
  ].filter((s): s is { label: string; href: string; Icon: typeof Instagram; color: string } => Boolean(s));

  const featuredVideoUrl = config.featured_video_url ? toYouTubeEmbedUrl(config.featured_video_url) : "";
  const shortsVideoUrl = config.shorts_video_url ? toYouTubeEmbedUrl(config.shorts_video_url) : "";

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.25rem" }}>
          {ownName ? `Olá, ${ownName.split(" ")[0]}!` : "Painel do autor"}
        </h1>
        <p style={{ color: "var(--admin-muted)", fontSize: "0.9375rem" }}>O resumo do seu trabalho e as novidades da People &amp; Growth.</p>
      </div>

      {profile?.author_id && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }} className="autor-home-grid">
        {/* Comunicados */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
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

        {/* Nossas redes */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Share2 size={17} color="#06D6A0" /> Nossas redes
            </h2>
          </div>
          {socials.length === 0 ? (
            <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhuma rede cadastrada em Configurações.</div>
          ) : (
            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {socials.map(({ label, href, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="autor-social-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "9999px",
                    border: "1px solid var(--admin-border-strong)",
                    color: "var(--admin-text)",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={16} color={color} /> {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos vídeos */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <div style={cardHeaderStyle}>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Video size={17} color="#4361EE" /> Últimos vídeos
          </h2>
        </div>
        <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 220px", gap: "1.25rem" }} className="autor-videos-grid">
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>Vídeo em destaque</div>
            {featuredVideoUrl ? (
              <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "#000" }}>
                <iframe src={featuredVideoUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div style={{ aspectRatio: "16/9", borderRadius: "0.75rem", backgroundColor: "var(--admin-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-faint)", fontSize: "0.875rem", fontWeight: 600 }}>
                Em breve
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>Shorts</div>
            {shortsVideoUrl ? (
              <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "#000" }}>
                <iframe src={shortsVideoUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div style={{ aspectRatio: "9/16", borderRadius: "0.75rem", backgroundColor: "var(--admin-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-faint)", fontSize: "0.8125rem", fontWeight: 600, textAlign: "center", padding: "1rem" }}>
                Em breve
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimos posts */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Newspaper size={17} color="#06D6A0" /> Últimos posts
          </h2>
          <Link href="/conteudo" target="_blank" style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Ver no site →</Link>
        </div>
        {news.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum artigo publicado ainda.</div>
        ) : (
          <div style={{ padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "1.25rem" }}>
            {news.map((item) => (
              <a
                key={item.id}
                href={articlePath(item, item.category_id ? categorySlugById.get(item.category_id) : undefined, "pt")}
                target="_blank"
                rel="noopener noreferrer"
                className="autor-post-card"
                style={{ display: "block", textDecoration: "none", borderRadius: "0.875rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}
              >
                <div style={{ height: "120px", background: item.cover_image ? `url(${item.cover_image}) center/cover` : "linear-gradient(135deg, #0d1b2a, #1a1f3e)" }} />
                <div style={{ padding: "0.875rem 1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "0.375rem" }}>
                    {item.title_pt}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)" }}>
                    {item.author_id && authorNameById.get(item.author_id) ? `${authorNameById.get(item.author_id)} · ` : ""}
                    {item.published_at && formatDate(item.published_at)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .autor-home-grid { grid-template-columns: 1fr !important; }
          .autor-videos-grid { grid-template-columns: 1fr !important; }
        }
        .autor-social-link:hover { border-color: #4361EE !important; color: #4361EE !important; }
        .autor-post-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); transition: all 0.15s; }
      `}</style>
    </div>
  );
}
