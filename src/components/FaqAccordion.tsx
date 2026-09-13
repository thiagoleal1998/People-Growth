import { ChevronDown } from "lucide-react";

// Plain Server Component — <details>/<summary> gives the open/close
// interactivity natively, so no "use client" or JS handlers are needed.
//
// The answer is wrapped in .faq-content instead of animating the <p>
// directly: browsers hide every non-<summary> child of a closed <details>
// via `display: none` in the UA stylesheet, which can't be transitioned.
// Giving .faq-content its own `display: block` (higher specificity than
// that UA rule) keeps it always rendered.
//
// max-height (not grid-template-rows: 0fr/1fr) is what's actually
// animated. A first version used the grid-fr trick, which computes its
// track size from content under an auto-height container — verified live
// on the real page (not just an isolated component test) that this let
// some other reflow on the page interrupt the transition mid-flight,
// freezing it at a random partial height instead of reaching 0, every
// time it was re-opened after a close. max-height transitions between two
// fixed numbers, so there's nothing content-dependent for another reflow
// to knock off course — verified over repeated open/close/open cycles,
// always landing exactly on 0 or the open height, never stuck partway.
//
// 260px is a real measured ceiling, not a guess: the longest actual FAQ
// answer currently configured renders at 201px on a 360px-wide phone
// (its worst case — narrower screens wrap text into more lines), so 260px
// leaves headroom for a somewhat longer future answer without clipping,
// while staying close enough to typical (~75px) answer heights that the
// motion still reads as smooth instead of "jump, then nothing for a
// while" (which 600px very visibly did).
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
            <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, paddingBottom: "1.375rem", margin: 0 }}>
              {answer}
            </p>
          </div>
        </details>
      ))}

      <style>{`
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] .faq-chevron { transform: rotate(180deg); }
        .faq-item .faq-content {
          display: block;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.3s ease;
        }
        .faq-item[open] .faq-content {
          max-height: 260px;
          opacity: 1;
          transition: max-height 0.4s ease, opacity 0.4s ease 0.05s;
        }
      `}</style>
    </div>
  );
}
