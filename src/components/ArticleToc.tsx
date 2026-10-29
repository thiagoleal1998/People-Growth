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
      style={{ backgroundColor: "var(--site-surface-alt)", borderRadius: "1rem", padding: "1.5rem" }}
    >
      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", marginBottom: "1rem" }}>{label}</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderLeft: "2px solid var(--site-border)" }}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => handleClick(event, heading.id)}
              style={{
                display: "block",
                padding: "0.375rem 0 0.375rem 0.875rem",
                marginLeft: "-2px",
                borderLeft: "2px solid transparent",
                color: "var(--site-text-secondary)",
                fontSize: "0.875rem",
                lineHeight: 1.4,
                textDecoration: "none",
              }}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
      <style>{`
        .article-toc li a { transition: color 0.15s, border-color 0.15s; }
        .article-toc li a:hover { color: #315E9C; border-left-color: #315E9C; }
      `}</style>
    </nav>
  );
}
