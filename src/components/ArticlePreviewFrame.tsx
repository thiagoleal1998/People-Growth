import { Calendar, Clock } from "lucide-react";
import { FormatTag } from "@/components/FormatTag";
import { ArticleBody } from "@/components/ArticleBody";
import { renderMarkdownLite, stripMarkdownLite } from "@/lib/markdown-lite";
import { aiDisclosureText } from "@/lib/ai-disclosure";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { aboutAuthorLabel, joinAuthorNames } from "@/lib/founder-data";
import type { Article, Category, Author } from "@/types/database.types";

const statusLabel: Record<Article["status"], string> = {
  draft: "Rascunho",
  pending: "Aguardando aprovação",
  scheduled: "Agendado",
  published: "Publicado",
};

/** Renders a draft/pending article exactly the way it'll look on the
 * public site, reusing the same ArticleBody component — so what the
 * author/admin sees here is what actually ships, not an approximation. */
export function ArticlePreviewFrame({ article, author, coauthors, category }: { article: Article; author: Author | null; coauthors?: Author[]; category: Category | null }) {
  const previewAiText = aiDisclosureText(article.ai_usage, "pt");
  const previewAiDisclosure = previewAiText ? { title: "Declaração sobre o uso de inteligência artificial", text: previewAiText } : null;
  const allAuthors = [author, ...(coauthors ?? [])].filter((a): a is Author => Boolean(a));
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.75rem 1.25rem",
          backgroundColor: "rgba(255,183,3,0.12)",
          border: "1px solid rgba(255,183,3,0.35)",
          borderRadius: "0.625rem",
          marginBottom: "1.5rem",
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#cc9200",
        }}
      >
        <span>Modo de visualização — {statusLabel[article.status]}. Esta página não é pública.</span>
      </div>

      <div style={{ backgroundColor: "#0d1b2a", borderRadius: "1rem 1rem 0 0", padding: "2.5rem 2.5rem 2rem", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <FormatTag format={article.format} locale="pt" />
          {category && (
            <span
              style={{
                display: "inline-block",
                backgroundColor: `${category.color ?? "#4361EE"}25`,
                color: category.color ?? "#4361EE",
                padding: "0.25rem 0.875rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              {category.name_pt}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>
          {article.title_pt || "Sem título ainda"}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Calendar size={14} /> {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          {article.read_time && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Clock size={14} /> {article.read_time} min de leitura
            </span>
          )}
          {allAuthors.length > 0 && <span>Por {joinAuthorNames(allAuthors.map((a) => a.name), "pt")}</span>}
        </div>
      </div>

      <div style={{ backgroundColor: "var(--site-bg)", borderRadius: "0 0 1rem 1rem", padding: "2.5rem", border: "1px solid var(--site-border)", borderTop: "none" }}>
        {allAuthors.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.75rem",
              flexWrap: "wrap",
              padding: "1rem 0",
              marginBottom: "1.75rem",
              borderTop: "1px solid var(--site-border)",
              borderBottom: "1px solid var(--site-border)",
            }}
          >
            {allAuthors.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: a.photo_url ? `url(${a.photo_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--site-text)", fontSize: "0.9375rem" }}>{a.name}</div>
                  <div style={{ color: "#4361EE", fontWeight: 700, fontSize: "0.8125rem" }}>
                    {aboutAuthorLabel(a.gender, "pt")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ArticleBody
          title={article.title_pt}
          summary={article.summary_pt}
          speechText={stripMarkdownLite(article.content_pt || "")}
          bodyHtml={renderMarkdownLite(article.content_pt || "*Ainda sem conteúdo.*")}
          coverImage={article.cover_image}
          coverImageCaption={article.cover_image_caption}
          coverImageCredit={article.cover_image_credit}
          videoEmbedUrl={article.video_url ? toYouTubeEmbedUrl(article.video_url) : null}
          sources={article.sources}
          aiDisclosure={previewAiDisclosure}
        />
      </div>
    </div>
  );
}
