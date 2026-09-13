import { ChevronDown } from "lucide-react";

// Plain Server Component — <details>/<summary> gives the open/close
// interactivity natively, so no "use client" or JS handlers are needed.
export function FaqAccordion({ entries }: { entries: [string, string][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {entries.map(([question, answer], i) => (
        <details key={i} className="faq-item" style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", border: "1px solid var(--site-border)", padding: "0.25rem 1.5rem" }}>
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "1.125rem 0",
              cursor: "pointer",
              listStyle: "none",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--site-text)",
            }}
          >
            {question}
            <ChevronDown size={18} className="faq-chevron" style={{ flexShrink: 0, color: "var(--site-muted)", transition: "transform 0.2s" }} />
          </summary>
          <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, paddingBottom: "1.375rem", margin: 0 }}>
            {answer}
          </p>
        </details>
      ))}

      <style>{`
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] .faq-chevron { transform: rotate(180deg); }
      `}</style>
    </div>
  );
}
