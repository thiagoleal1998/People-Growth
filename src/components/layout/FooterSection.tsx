"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// One markup for both layouts: on desktop the heading shows and the links are
// always visible; on phones the heading becomes a tap target that opens the
// list (styles live in Footer's <style> block).
export function FooterSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ft-section">
      <h4 className="ft-heading" style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </h4>
      <button type="button" className="ft-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {title}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      <div className={open ? "ft-body ft-body-open" : "ft-body"}>{children}</div>
    </div>
  );
}
