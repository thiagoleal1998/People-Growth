import type { Article } from "@/types/database.types";
import { MEA_SENTENTIA_LOGO_URL } from "@/lib/brand-logos";

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
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.6875rem",
        fontWeight: 800,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color: "#315E9C",
        backgroundColor: isOpinion ? "rgba(255,183,3,0.15)" : "rgba(49, 94, 156,0.1)",
        padding: "0.1875rem 0.5rem",
        borderRadius: "0.25rem",
      }}
    >
      {isOpinion ? (
        <img src={MEA_SENTENTIA_LOGO_URL} alt="Mea Sententia" style={{ height: "0.75rem", width: "auto", display: "block", objectFit: "contain" }} />
      ) : locale === "en" ? (
        "News"
      ) : (
        "Notícia"
      )}
    </span>
  );
}
