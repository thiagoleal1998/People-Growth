"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared paging behavior for any "show N at a time, with prev/next + dots to
// see the rest" section — NflPreview.tsx, NbaPreview.tsx (both dark cards)
// and the home page's columnist strip (light background) all used to just
// hard-slice their list to a fixed preview count with no way to see what was
// left out. This only owns the page state and the control row; the caller's
// renderPage decides how the current page's items actually look, so each
// section keeps its own grid/card styling instead of this component
// imposing one.
export function PagedCarousel<T>({
  items,
  pageSize = 3,
  accentColor,
  controlColor = "white",
  controlBorderColor = "rgba(255,255,255,0.2)",
  dotInactiveColor = "rgba(255,255,255,0.25)",
  renderPage,
}: {
  items: T[];
  pageSize?: number;
  accentColor: string;
  controlColor?: string;
  controlBorderColor?: string;
  dotInactiveColor?: string;
  renderPage: (pageItems: T[]) => ReactNode;
}) {
  const pageCount = Math.ceil(items.length / pageSize);
  const [page, setPage] = useState(0);
  const visible = items.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      {renderPage(visible)}
      {pageCount > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            aria-label="Anterior"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: `1px solid ${controlBorderColor}`, backgroundColor: "transparent", color: controlColor, cursor: "pointer" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: "flex", gap: "0.4375rem" }}>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Página ${i + 1}`}
                style={{
                  width: "0.4375rem",
                  height: "0.4375rem",
                  borderRadius: "50%",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  backgroundColor: i === page ? accentColor : dotInactiveColor,
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => (p + 1) % pageCount)}
            aria-label="Próximo"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: `1px solid ${controlBorderColor}`, backgroundColor: "transparent", color: controlColor, cursor: "pointer" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
