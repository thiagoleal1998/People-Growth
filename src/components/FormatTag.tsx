import type { Article } from "@/types/database.types";

// Takes locale as a prop (rather than calling useLocale() itself) because
// this component is rendered from both plain Server Component pages and
// the "use client" ArticlesExplorer — a hook here would break wherever
// there's no client boundary above it. Every caller already has locale in
// scope (getLocale() server-side, useLocale() client-side).
const FORMAT_STYLE: Record<Article["format"], { color: string; background: string }> = {
  noticia: { color: "#315E9C", background: "rgba(49, 94, 156,0.1)" },
  analise: { color: "#2f7a4f", background: "rgba(47,122,79,0.12)" },
  opiniao: { color: "#b8860b", background: "rgba(255,183,3,0.15)" },
};

const FORMAT_LABEL: Record<Article["format"], { pt: string; en: string }> = {
  noticia: { pt: "Notícia", en: "News" },
  analise: { pt: "Análise", en: "Analysis" },
  opiniao: { pt: "Mea Sententia", en: "Mea Sententia" },
};

export function FormatTag({ format, locale }: { format: Article["format"]; locale: string }) {
  const { color, background } = FORMAT_STYLE[format];
  const label = locale === "en" ? FORMAT_LABEL[format].en : FORMAT_LABEL[format].pt;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color,
        backgroundColor: background,
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
      }}
    >
      {label}
    </span>
  );
}
