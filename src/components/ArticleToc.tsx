"use client";

import { useEffect, useState } from "react";
import { ListTree, ChevronDown } from "lucide-react";

const COLLAPSED_COUNT = 6;

// Sidebar table of contents for long articles, letting a reader jump
// straight to the section they care about instead of scrolling past
// everything else. Only rendered when the article has more than one "## "
// heading (see the [slug] page). Scrolling is eased in code rather than
// left to the browser's built-in smooth scroll, same reasoning/approach as
// InstitutionalToc.tsx: smooth-scroll behavior varies a lot across
// browsers and is often too quick to actually read as a glide.

// Matches the h2's own `scroll-margin-top: 7rem` (markdown-lite.ts) and
// InstitutionalToc.tsx's identical offset — 96 (6rem) left the heading's
// top edge still partly behind the fixed navbar (~6.43rem tall) after the
// jump, same root cause as the sidebar's own top offset fix.
const NAVBAR_OFFSET = 112;
const DURATION_MS = 700;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function glideTo(targetY: number) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function frame(now: number) {
    const progress = Math.min(1, (now - startTime) / DURATION_MS);
    // The site sets scroll-behavior: smooth globally; left on, each frame would
    // start its own animation and the glide would fall behind and stop short.
    window.scrollTo({ top: startY + distance * easeInOutCubic(progress), behavior: "instant" as ScrollBehavior });
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function ArticleToc({ headings, label }: { headings: { id: string; title: string }[]; label: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // A fixed/viewport-relative max-height with internal scroll was tried
  // first, but a nested scrollable region inside a sticky sidebar isn't
  // discoverable — it just reads as the box being cut off, not as
  // "scroll here for more". Showing fewer items up front (never taller
  // than the viewport can hold) and letting the reader explicitly ask for
  // the rest avoids the whole problem instead of hiding it in a scrollbar.
  const [expanded, setExpanded] = useState(false);
  const visibleHeadings = expanded ? headings : headings.slice(0, COLLAPSED_COUNT);
  const hiddenCount = headings.length - COLLAPSED_COUNT;

  // Highlights whichever section is currently in view while scrolling, not
  // just on click — the list otherwise sits there static the whole read,
  // which is what read as "muito morto" (lifeless).
  useEffect(() => {
    const targets = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const targetY = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    glideTo(targetY);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      className="article-toc"
      aria-label={label}
      style={{
        backgroundColor: "var(--site-surface)",
        border: "1px solid var(--site-border)",
        borderTop: "2.5px solid #315E9C",
        borderRadius: "0.875rem",
        padding: "1.125rem 1.125rem 0.75rem",
        boxShadow: "0 1px 3px rgba(13,27,42,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#315E9C", marginBottom: "0.75rem", padding: "0 0.25rem" }}>
        <ListTree size={13} />
        {label}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: "0 0.25rem 0.375rem 0" }}>
        {visibleHeadings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => handleClick(event, heading.id)}
              className={heading.id === activeId ? "article-toc-active" : undefined}
            >
              <span className="article-toc-index">{index + 1}</span>
              <span className="article-toc-label">{heading.title}</span>
            </a>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3125rem",
            width: "100%",
            padding: "0.4375rem 0.375rem",
            marginTop: "0.125rem",
            background: "none",
            border: "none",
            borderTop: "1px solid var(--site-border)",
            color: "#315E9C",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <ChevronDown size={13} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          {expanded ? "Ver menos" : `Ver todos os ${headings.length} capítulos`}
        </button>
      )}
      <style>{`
        .article-toc li + li { margin-top: 0.125rem; }
        .article-toc li a {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.3125rem 0.375rem;
          margin-left: -0.375rem;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: background-color 0.15s;
        }
        .article-toc li a:hover { background-color: rgba(49, 94, 156, 0.08); }
        .article-toc-index {
          flex-shrink: 0;
          width: 1.125rem;
          height: 1.125rem;
          margin-top: 0.0625rem;
          border-radius: 50%;
          background-color: var(--site-border);
          color: var(--site-muted);
          font-size: 0.625rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s, color 0.15s;
        }
        .article-toc li a:hover .article-toc-index { background-color: #315E9C; color: white; }
        .article-toc-label {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: var(--site-text-secondary);
          font-size: 0.8125rem;
          font-weight: 600;
          line-height: 1.35;
          transition: color 0.15s;
        }
        .article-toc li a:hover .article-toc-label { color: #315E9C; }
        .article-toc-active { background-color: rgba(49, 94, 156, 0.08); }
        .article-toc-active .article-toc-index { background-color: #315E9C; color: white; }
        .article-toc-active .article-toc-label { color: #315E9C; }
      `}</style>
    </nav>
  );
}
