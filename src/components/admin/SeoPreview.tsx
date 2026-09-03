"use client";

export function SeoPreview({ url, title, description }: { url: string; title: string; description: string }) {
  const displayTitle = title.trim() || "Título do artigo aparece aqui";
  const displayDesc = description.trim() || "A descrição que aparece embaixo do título nos resultados de busca vem daqui.";

  return (
    <div>
      <div
        style={{
          border: "1px solid var(--admin-border-strong)",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          backgroundColor: "var(--admin-surface)",
          fontFamily: "arial, sans-serif",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-secondary)" }}>{url}</div>
        <div
          style={{
            fontSize: "1.1875rem",
            color: "#4361EE",
            marginTop: "0.125rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayTitle}
        </div>
        <div
          style={{
            fontSize: "0.875rem",
            color: "var(--admin-text-secondary)",
            marginTop: "0.25rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayDesc}
        </div>
      </div>
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.625rem", fontSize: "0.75rem", color: "var(--admin-faint)" }}>
        <span style={{ color: title.length > 60 ? "#ef4444" : undefined }}>Título: {title.length}/60 caracteres</span>
        <span style={{ color: description.length > 160 ? "#ef4444" : undefined }}>Descrição: {description.length}/160 caracteres</span>
      </div>
    </div>
  );
}
