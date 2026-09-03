import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { Card, EmptyState, Badge } from "@/components/admin/ui";
import { timeAgo } from "@/lib/time-ago";
import type { Article, Comment } from "@/types/database.types";

const statusConfig: Record<Comment["status"], { label: string; tone: "success" | "warning" | "neutral" }> = {
  pending: { label: "Pendente", tone: "warning" },
  approved: { label: "Aprovado", tone: "success" },
  rejected: { label: "Rejeitado", tone: "neutral" },
};

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: string | number; color: string }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid #f1f5f9", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d1b2a" }}>{value}</div>
    </div>
  );
}

export default async function EstatisticasArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile?.author_id) notFound();

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data: article } = await client.from("articles").select("*").eq("id", id).eq("author_id", profile.author_id).single();
  if (!article) notFound();
  const typedArticle = article as Article;

  const { data: commentsData } = await client.from("comments").select("*").eq("article_id", id).order("created_at", { ascending: false });
  const comments = (commentsData ?? []) as Comment[];

  const topLevel = comments.filter((c) => !c.parent_id);
  const totalLikes = comments.reduce((sum, c) => sum + c.likes, 0);
  const totalReports = comments.reduce((sum, c) => sum + c.reports, 0);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/autor" style={{ color: "#64748b", fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <ArrowLeft size={14} /> Meus artigos
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d1b2a", marginTop: "0.5rem" }}>{typedArticle.title_pt}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <StatCard icon={Eye} label="Visualizações" value={typedArticle.views.toLocaleString("pt-BR")} color="#4361EE" />
        <StatCard icon={MessageCircle} label="Comentários" value={comments.length} color="#06D6A0" />
        <StatCard icon={ThumbsUp} label="Curtidas em comentários" value={totalLikes} color="#FFB703" />
        <StatCard icon={Flag} label="Denúncias" value={totalReports} color="#dc2626" />
      </div>

      <Card>
        <div style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a", marginBottom: "1.25rem" }}>Comentários</h2>
          {topLevel.length === 0 ? (
            <EmptyState text="Nenhum comentário neste artigo ainda." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((c) => (
                <div key={c.id} style={{ backgroundColor: "#f8fafc", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginLeft: c.parent_id ? "1.5rem" : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0d1b2a" }}>
                      {c.parent_id && "↳ "}{c.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <Badge tone={statusConfig[c.status].tone}>{statusConfig[c.status].label}</Badge>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }} suppressHydrationWarning>{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: "0.5rem" }}>{c.body}</p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><ThumbsUp size={12} /> {c.likes}</span>
                    {c.reports > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#dc2626" }}><Flag size={12} /> {c.reports}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
