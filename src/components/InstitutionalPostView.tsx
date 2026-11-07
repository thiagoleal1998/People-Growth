import { Calendar } from "lucide-react";
import { ArticleBody } from "@/components/ArticleBody";
import { ShareButtons } from "@/components/ShareButtons";
import { renderMarkdownLite, stripMarkdownLite } from "@/lib/markdown-lite";
import { pickLocale } from "@/lib/locale-content";
import type { Columnist, InstitutionalPost } from "@/types/database.types";

/** Renders an institutional post — used as-is by the public post page and,
 * wrapped with `preview`, by the admin preview route, so a draft always
 * looks exactly like it will once published (same rule the article preview
 * follows, see ArticlePreviewFrame). */
export function InstitutionalPostView({
  post,
  columnist,
  locale = "pt",
  preview = false,
}: {
  post: InstitutionalPost;
  columnist: Columnist | null;
  locale?: string;
  preview?: boolean;
}) {
  const title = pickLocale(locale, post.title_pt, post.title_en);
  const body = pickLocale(locale, post.body_pt, post.body_en);
  const byline = columnist?.name ?? "Grupo Festina";
  const role = columnist ? pickLocale(locale, columnist.role_pt, columnist.role_en) || columnist.org_chart_role : null;
  const dateLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "Rascunho — ainda não publicado";

  return (
    <div>
      {preview && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
          <span>Modo de visualização — {post.status === "published" ? "Publicado" : "Rascunho"}. Esta página não é pública.</span>
        </div>
      )}

      <div style={{ backgroundColor: "#0d1b2a", borderRadius: "1rem 1rem 0 0", padding: "2.5rem 2.5rem 2rem", color: "white" }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: "rgba(200,154,74,0.18)",
            color: "#C89A4A",
            padding: "0.25rem 0.875rem",
            borderRadius: "9999px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
          }}
        >
          Institucional
        </span>

        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>
          {title || "Sem título ainda"}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Calendar size={14} /> {dateLabel}
          </span>
          <span>
            Por {byline}
            {role ? ` · ${role}` : ""}
          </span>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--site-bg)", borderRadius: "0 0 1rem 1rem", padding: "2.5rem", border: "1px solid var(--site-border)", borderTop: "none" }}>
        {columnist && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 0",
              marginBottom: "1.75rem",
              borderTop: "1px solid var(--site-border)",
              borderBottom: "1px solid var(--site-border)",
            }}
          >
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                flexShrink: 0,
                background: columnist.photo_url ? `url("${columnist.photo_url}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
              }}
            />
            <div>
              <div style={{ fontWeight: 800, color: "var(--site-text)", fontSize: "0.9375rem" }}>{columnist.name}</div>
              {role && <div style={{ color: "#315E9C", fontWeight: 700, fontSize: "0.8125rem" }}>{role}</div>}
            </div>
          </div>
        )}

        <ShareButtons title={title || ""} compact />

        <ArticleBody
          title={title || ""}
          summary={pickLocale(locale, post.excerpt_pt, post.excerpt_en)}
          speechText={stripMarkdownLite(body || "")}
          bodyHtml={renderMarkdownLite(body || "*Ainda sem conteúdo.*")}
          coverImage={post.cover_image}
          coverImageCaption={post.cover_image_caption}
          coverImageCredit={post.cover_image_credit}
          videoEmbedUrl={null}
          sources={null}
          aiDisclosure={null}
          locale={locale}
        />

        <ShareButtons title={title || ""} />
      </div>
    </div>
  );
}
