import type { Article } from "@/types/database.types";

export function FormatTag({ format }: { format: Article["format"] }) {
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
      {isOpinion ? "Mea Sententia" : "Notícia"}
    </span>
  );
}
