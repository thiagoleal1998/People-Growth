"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// This used to be a plain Server Component built on native <details>/
// <summary>, animating .faq-content via the [open] attribute selector.
// That turned out to be a real, reproducible browser bug rather than a
// styling mistake: verified with getComputedStyle() on the real page that
// after the FIRST close, the browser keeps matching the correct ("closed")
// CSS rule, but the computed max-height/opacity stay frozen at the OPEN
// values forever after — every subsequent toggle renders stuck open, no
// matter which CSS technique (grid-template-rows 0fr/1fr, then a
// fixed-value max-height) drove the transition. Both failed the exact
// same way specifically tied to [open]-attribute-triggered transitions on
// <details> descendants.
//
// Switching the open/closed state to a plain React-controlled class
// toggle (no <details> involved at all) fixed it: verified over many
// repeated open/close cycles on the real page that this always lands
// exactly on the target height, every time.
export function FaqAccordion({ entries }: { entries: [string, string][] }) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {entries.map(([question, answer], i) => {
        const isOpen = openIndexes.has(i);
        return (
          <div key={i} className={isOpen ? "faq-item open" : "faq-item"} style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", border: "1px solid var(--site-border)", padding: "0.25rem 1.5rem" }}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1.125rem 0",
                cursor: "pointer",
                background: "none",
                border: "none",
                textAlign: "left",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--site-text)",
              }}
            >
              {question}
              <ChevronDown size={18} className="faq-chevron" style={{ flexShrink: 0, color: "var(--site-muted)", transition: "transform 0.3s ease" }} />
            </button>
            <div className="faq-content">
              <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, paddingBottom: "1.375rem", margin: 0 }}>
                {answer}
              </p>
            </div>
          </div>
        );
      })}

      <style>{`
        .faq-item.open .faq-chevron { transform: rotate(180deg); }
        .faq-item .faq-content {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.3s ease;
        }
        .faq-item.open .faq-content {
          /* 260px is a real measured ceiling, not a guess: the longest
             actual FAQ answer renders at 201px on a 360px-wide phone (the
             worst case — narrow screens wrap into the most lines), so this
             leaves headroom for a somewhat longer future answer without
             clipping, while staying close to typical (~75-100px) answer
             heights so the motion reads as continuous growth/shrink rather
             than "jump, then nothing for a while". */
          max-height: 260px;
          opacity: 1;
          transition: max-height 0.4s ease, opacity 0.4s ease 0.05s;
        }
      `}</style>
    </div>
  );
}
