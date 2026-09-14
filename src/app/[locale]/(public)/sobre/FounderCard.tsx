import { ChevronRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale-content";
import type { Author } from "@/types/database.types";

export async function FounderCard({ author }: { author: Author }) {
  const locale = await getLocale();
  return (
    <Link
      href={{ pathname: "/sobre/[slug]", params: { slug: author.slug } }}
      className="hover-card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        backgroundColor: "var(--site-surface-alt)",
        borderRadius: "1rem",
        padding: "1.25rem",
        border: "1px solid var(--site-border)",
      }}
    >
      <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "50%",
            flexShrink: 0,
            background: author.photo_url
              ? `url(${author.photo_url}) center/cover`
              : "linear-gradient(135deg, #4361EE, #06D6A0)",
          }}
        />
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-text)" }}>{author.name}</h3>
          {author.role_pt && (
            <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem", marginTop: "0.125rem" }}>
              {pickLocale(locale, author.role_pt, author.role_en)}
            </div>
          )}
        </div>
      </div>

      {author.tagline_pt && (
        <p
          style={{
            color: "var(--site-text-secondary)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginTop: "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {pickLocale(locale, author.tagline_pt, author.tagline_en)}
        </p>
      )}

      <div
        className="hover-link-move"
        style={{
          alignItems: "center",
          gap: "0.25rem",
          marginTop: "0.875rem",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#4361EE",
        }}
      >
        {locale === "en" ? "View journey" : "Ver trajetória"}
        <ChevronRight size={14} />
      </div>
    </Link>
  );
}
