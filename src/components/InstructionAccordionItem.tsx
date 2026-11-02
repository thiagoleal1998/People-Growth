"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Click-to-expand row for the columnist-facing Canal de Instruções (both
// "Etapas" and "FAQ" use this). Smooth open/close via the same
// grid-template-rows 0fr -> 1fr trick as ArticleBody.tsx's "Resumo" box —
// no JS height measuring, the shared .instr-expand-* CSS lives once in the
// parent page (InstructionsClient-admin-side keeps its own always-expanded
// list; this is only for the read-only columnist view).
export function InstructionAccordionItem({ title, bodyHtml, badge }: { title: string; bodyHtml: string; badge?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1.125rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {badge}
        <span style={{ flex: 1, fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{title}</span>
        <ChevronDown
          size={16}
          style={{ flexShrink: 0, color: "var(--admin-faint)", transition: "transform 0.2s ease", transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>
      <div className={`instr-expand${expanded ? " instr-expand-open" : ""}`}>
        <div className="instr-expand-clip">
          <div
            className="instr-expand-content"
            style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </div>
    </div>
  );
}
