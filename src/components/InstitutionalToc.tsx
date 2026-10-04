"use client";

// Section list for long institutional pages. Scrolling is eased in code rather
// than left to the browser's built-in smooth scroll, which varies a lot from
// one browser to another and is often too quick to read as a glide.

const NAVBAR_OFFSET = 112;
const DURATION_MS = 900;

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

export function InstitutionalToc({ headings, label }: { headings: { id: string; title: string }[]; label: string }) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const targetY = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    glideTo(targetY);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav className="oque-toc" aria-label={label}>
      <div className="oque-toc-title">{label}</div>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} onClick={(event) => handleClick(event, heading.id)}>
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
