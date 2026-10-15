"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_ADVANCE_MS = 5000;
const FADE_MS = 220;

// Shared paging behavior for any "show N at a time, with prev/next + dots to
// see the rest" section — NflPreview.tsx, NbaPreview.tsx (both dark cards)
// and the home page's columnist strip (light background) all used to just
// hard-slice their list to a fixed preview count with no way to see what was
// left out. This only owns the page state and the control row.
//
// `items` takes already-rendered elements (one per underlying data item, each
// with its own key), not a render callback — NflPreview/NbaPreview are plain
// Server Components, and a Server Component can't pass a function prop to a
// Client Component like this one (React Server Components can only cross
// that boundary with serializable data; a closure isn't). Pre-rendering each
// item server-side and handing over the resulting element array sidesteps
// that entirely, and costs nothing since the Client Component only has to
// slice an array, not generate markup.
//
// Auto-advances on its own every 5s (re-armed on any page change, manual or
// automatic, so the spacing between transitions stays even either way).
// Transitions are a two-phase fade — opacity to 0, swap the page while
// invisible, opacity back to 1 — not a single fade-in: an earlier version
// flipped the page first and faded in after, which meant the new page's
// content was briefly visible at full opacity for one frame before the fade
// even started (easy to miss entirely on a fast page, which is what made it
// look like there was no effect at all). Going through `pending` first (the
// page to switch to once faded out) guarantees the swap only happens while
// genuinely invisible.
export function PagedCarousel({
  items,
  pageSize = 3,
  accentColor,
  controlColor = "white",
  controlBorderColor = "rgba(255,255,255,0.2)",
  dotInactiveColor = "rgba(255,255,255,0.25)",
  pageStyle,
  pageClassName,
}: {
  items: ReactNode[];
  pageSize?: number;
  accentColor: string;
  controlColor?: string;
  controlBorderColor?: string;
  dotInactiveColor?: string;
  pageStyle?: CSSProperties;
  pageClassName?: string;
}) {
  const pageCount = Math.ceil(items.length / pageSize);
  const [page, setPage] = useState(0);
  const [visible1, setVisible1] = useState(true);
  const pendingRef = useRef<number | null>(null);
  const visible = items.slice(page * pageSize, page * pageSize + pageSize);

  function goTo(next: number) {
    if (next === page) return;
    pendingRef.current = next;
    setVisible1(false);
  }

  // Runs the second half of the fade once the CSS transition that
  // setVisible1(false) kicked off has actually finished (not on a timer
  // guessed to roughly match FADE_MS — onTransitionEnd fires exactly when
  // the opacity:0 transition completes).
  function handleFadedOut() {
    if (pendingRef.current === null) return;
    setPage(pendingRef.current);
    pendingRef.current = null;
    requestAnimationFrame(() => setVisible1(true));
  }

  useEffect(() => {
    if (pageCount <= 1) return;
    const id = setTimeout(() => goTo((page + 1) % pageCount), AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageCount]);

  return (
    <div>
      <div
        className={pageClassName}
        style={{ ...pageStyle, opacity: visible1 ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "opacity" && !visible1) handleFadedOut();
        }}
      >
        {visible}
      </div>
      {pageCount > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={() => goTo((page - 1 + pageCount) % pageCount)}
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
                onClick={() => goTo(i)}
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
            onClick={() => goTo((page + 1) % pageCount)}
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
