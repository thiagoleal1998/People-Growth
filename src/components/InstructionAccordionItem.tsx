"use client";

import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

// Click-to-expand row for the columnist-facing Canal de Instruções (both
// "Etapas" and "FAQ" use this). Smooth open/close via the same
// grid-template-rows 0fr -> 1fr trick as ArticleBody.tsx's "Resumo" box —
// no JS height measuring, the shared .instr-expand-* CSS lives once in the
// parent page (InstructionsClient-admin-side keeps its own always-expanded
// list; this is only for the read-only columnist view).
export function InstructionAccordionItem({
  title,
  bodyHtml,
  badge,
  creator,
  instructionItemId,
}: {
  title: string;
  bodyHtml: string;
  badge?: React.ReactNode;
  creator?: { id: string; name: string; roleLabel: string };
  instructionItemId?: string;
}) {
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
          {creator && instructionItemId && (
            <div style={{ padding: "0 1.25rem 1.125rem" }}>
              <Link
                href={`/colunista/mensagens?with=${creator.id}&about=${instructionItemId}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "#315E9C", textDecoration: "none" }}
              >
                <MessageCircleQuestion size={15} />
                Dúvida? Fale com {creator.name} ({creator.roleLabel})
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
