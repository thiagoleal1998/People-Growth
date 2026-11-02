import { ChevronRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale-content";
import type { Columnist } from "@/types/database.types";

export async function FounderCard({ columnist }: { columnist: Columnist }) {
  const locale = await getLocale();
  return (
    <Link
      href={{ pathname: "/sobre/[slug]", params: { slug: columnist.slug } }}
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
            background: columnist.photo_url
              ? `url("${columnist.photo_url}") center/cover`
              : "linear-gradient(135deg, #315E9C, #C89A4A)",
          }}
        />
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-text)" }}>{columnist.name}</h3>
          {columnist.role_pt && (
            <div style={{ color: "#315E9C", fontWeight: 600, fontSize: "0.8125rem", marginTop: "0.125rem" }}>
              {pickLocale(locale, columnist.role_pt, columnist.role_en)}
            </div>
          )}
        </div>
      </div>

      {columnist.tagline_pt && (
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
          {pickLocale(locale, columnist.tagline_pt, columnist.tagline_en)}
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
          color: "#315E9C",
        }}
      >
        {locale === "en" ? "View journey" : "Ver trajetória"}
        <ChevronRight size={14} />
      </div>
    </Link>
  );
}
