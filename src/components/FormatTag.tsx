import type { Article } from "@/types/database.types";

// Takes locale as a prop (rather than calling useLocale() itself) because
// this component is rendered from both plain Server Component pages and
// the "use client" ArticlesExplorer — a hook here would break wherever
// there's no client boundary above it. Every caller already has locale in
// scope (getLocale() server-side, useLocale() client-side).
export function FormatTag({ format, locale }: { format: Article["format"]; locale: string }) {
  const isOpinion = format === "opiniao";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color: isOpinion ? "#b8860b" : "#4361EE",
        backgroundColor: isOpinion ? "rgba(255,183,3,0.15)" : "rgba(67,97,238,0.1)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
      }}
    >
      {isOpinion ? "Mea Sententia" : locale === "en" ? "News" : "Notícia"}
    </span>
  );
}
