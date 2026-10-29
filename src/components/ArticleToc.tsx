"use client";

// Sidebar table of contents for long articles, letting a reader jump
// straight to the section they care about instead of scrolling past
// everything else. Only rendered when the article has more than one "## "
// heading (see the [slug] page). Scrolling is eased in code rather than
// left to the browser's built-in smooth scroll, same reasoning/approach as
// InstitutionalToc.tsx: smooth-scroll behavior varies a lot across
// browsers and is often too quick to actually read as a glide.

const NAVBAR_OFFSET = 96;
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
      style={{ backgroundColor: "var(--site-surface-alt)", borderRadius: "0.875rem", padding: "1.125rem 1.125rem 0.75rem" }}
    >
      <div style={{ fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--site-muted)", marginBottom: "0.625rem", padding: "0 0.25rem" }}>
        {label}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: "0 0.25rem 0.375rem 0" }}>
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} onClick={(event) => handleClick(event, heading.id)}>
              <span className="article-toc-index">{index + 1}</span>
              <span className="article-toc-label">{heading.title}</span>
            </a>
          </li>
        ))}
      </ul>
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
      `}</style>
    </nav>
  );
}
