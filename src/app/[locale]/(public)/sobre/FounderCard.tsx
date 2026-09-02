import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Author } from "@/types/database.types";

export function FounderCard({ author }: { author: Author }) {
  return (
    <Link
      href={{ pathname: "/sobre/[slug]", params: { slug: author.slug } }}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        backgroundColor: "#f0f4f8",
        borderRadius: "1rem",
        padding: "1.25rem",
        border: "1px solid rgba(0,0,0,0.05)",
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
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a" }}>{author.name}</h3>
          {author.role_pt && (
            <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem", marginTop: "0.125rem" }}>
              {author.role_pt}
            </div>
          )}
        </div>
      </div>

      {author.tagline_pt && (
        <p
          style={{
            color: "#475569",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginTop: "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {author.tagline_pt}
        </p>
      )}

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          marginTop: "0.875rem",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#4361EE",
        }}
      >
        Ver trajetória
        <ChevronRight size={14} />
      </div>
    </Link>
  );
}
