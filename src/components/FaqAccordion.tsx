import { ChevronDown } from "lucide-react";

// Plain Server Component — <details>/<summary> gives the open/close
// interactivity natively, so no "use client" or JS handlers are needed.
//
// The answer is wrapped in .faq-content instead of animating the <p>
// directly: browsers hide every non-<summary> child of a closed <details>
// via `display: none` in the UA stylesheet, which can't be transitioned.
// Giving .faq-content its own `display: grid` (higher specificity than
// that UA rule) keeps it always rendered, so animating its
// grid-template-rows between 0fr and 1fr collapses/expands it smoothly.
// The bottom spacing below the answer lives on .faq-content's own
// padding-bottom (animated 0 <-> 1.375rem), not on the <p> — an
// element's own padding never shrinks via overflow/min-size tricks, so
// leaving it on the <p> left a permanent ~22px gap even fully "closed".
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
            <ChevronDown size={18} className="faq-chevron" style={{ flexShrink: 0, color: "var(--site-muted)", transition: "transform 0.3s ease" }} />
          </summary>
          <div className="faq-content">
            <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, margin: 0, overflow: "hidden" }}>
              {answer}
            </p>
          </div>
        </details>
      ))}

      <style>{`
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] .faq-chevron { transform: rotate(180deg); }
        .faq-item .faq-content {
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          opacity: 0;
          padding-bottom: 0;
          transition: grid-template-rows 0.35s ease, opacity 0.25s ease, padding-bottom 0.35s ease;
        }
        .faq-item[open] .faq-content {
          grid-template-rows: 1fr;
          opacity: 1;
          padding-bottom: 1.375rem;
          transition: grid-template-rows 0.35s ease, opacity 0.35s ease 0.05s, padding-bottom 0.35s ease;
        }
      `}</style>
    </div>
  );
}
