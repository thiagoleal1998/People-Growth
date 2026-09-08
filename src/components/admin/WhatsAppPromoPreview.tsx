import { parseWhatsAppLine } from "@/lib/whatsapp-promo";

const tokenStyle: Record<string, React.CSSProperties> = {
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
  // Decorative color on top of the real strikethrough — WhatsApp itself
  // renders struck-through text plain, this is just to visually echo the
  // "old price crossed out" look from the reference channels. The
  // strikethrough itself (text-decoration) is what actually reflects the
  // real markdown parsed from the generated text.
  strike: { textDecoration: "line-through", color: "rgba(255,255,255,0.45)" },
  mono: { fontFamily: "monospace", backgroundColor: "rgba(255,255,255,0.08)", padding: "0 0.25rem", borderRadius: "0.2rem" },
};

/** Mimics a WhatsApp Channel message bubble — image on top, formatted text
 * below. Parses the SAME string that gets copied via "Copiar texto" (see
 * whatsapp-promo.ts), so the preview and the pasted text can never drift
 * apart: there's no second, independent formatting path. */
export function WhatsAppPromoPreview({ text, imageUrl }: { text: string; imageUrl?: string | null }) {
  const lines = text.split("\n");

  return (
    <div
      style={{
        backgroundColor: "#0b141a",
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        maxWidth: "360px",
      }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" style={{ width: "100%", display: "block", maxHeight: "260px", objectFit: "cover" }} />
      )}
      <div
        style={{
          backgroundColor: "#202c33",
          color: "rgba(255,255,255,0.92)",
          padding: "0.875rem 1rem",
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ minHeight: line ? undefined : "0.5rem" }}>
            {parseWhatsAppLine(line).map((token, j) => (
              <span key={j} style={tokenStyle[token.type]}>
                {token.value}
              </span>
            ))}
          </div>
        ))}
        <div style={{ textAlign: "right", fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>21:46 ✓✓</div>
      </div>
    </div>
  );
}
